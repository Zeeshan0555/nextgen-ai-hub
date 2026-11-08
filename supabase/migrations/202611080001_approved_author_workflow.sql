-- NeuroWire approved-author newsroom foundation.
-- Apply in Supabase SQL Editor or with `supabase db push`.

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  bio text not null default '',
  expertise text not null default '',
  portfolio_url text,
  role text not null default 'author' check (role in ('author', 'admin')),
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Every public signup starts as a pending author. Role/status are never taken
-- from user-editable metadata, so a signup cannot grant itself approval/admin.
create or replace function public.create_pending_author_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (user_id, full_name, bio, expertise, portfolio_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'bio', ''),
    coalesce(new.raw_user_meta_data ->> 'expertise', ''),
    nullif(new.raw_user_meta_data ->> 'portfolio_url', '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_pending_author_profile on auth.users;
create trigger create_pending_author_profile
after insert on auth.users
for each row execute function public.create_pending_author_profile();

create table if not exists public.author_articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  slug text,
  category text,
  summary text not null default '',
  content text not null default '',
  source_name text not null default '',
  source_url text not null default '',
  image_url text not null default '',
  image_alt text not null default '',
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'approved', 'rejected', 'published')),
  admin_feedback text,
  published_news_id bigint references public.news(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint author_articles_review_content_check check (
    status not in ('pending_review', 'approved', 'published') or
    (length(trim(title)) >= 8 and length(trim(source_name)) > 0 and
     length(trim(source_url)) > 0 and length(trim(image_url)) > 0 and
     array_length(regexp_split_to_array(trim(content), '\s+'), 1) >= 500)
  )
);

create index if not exists author_articles_author_status_idx
  on public.author_articles (author_id, status, updated_at desc);
create index if not exists author_articles_review_queue_idx
  on public.author_articles (status, created_at desc);

alter table public.user_profiles enable row level security;
alter table public.author_articles enable row level security;

-- Users can see their own profile, but only the trusted server/admin can change
-- approval status or role. No client-side profile update policy is intentional.
drop policy if exists "Authors can read their own profile" on public.user_profiles;
create policy "Authors can read their own profile"
  on public.user_profiles for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Authors can read their own submissions" on public.author_articles;
create policy "Authors can read their own submissions"
  on public.author_articles for select to authenticated
  using (author_id = (select auth.uid()));

drop policy if exists "Approved authors can create drafts and submit articles" on public.author_articles;
create policy "Approved authors can create drafts and submit articles"
  on public.author_articles for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and status in ('draft', 'pending_review')
    and exists (
      select 1 from public.user_profiles p
      where p.user_id = (select auth.uid())
        and p.role = 'author'
        and p.approval_status = 'approved'
    )
  );

drop policy if exists "Authors can edit their own drafts or rejected articles" on public.author_articles;
create policy "Authors can edit their own drafts or rejected articles"
  on public.author_articles for update to authenticated
  using (
    author_id = (select auth.uid())
    and status in ('draft', 'rejected')
    and exists (
      select 1 from public.user_profiles p
      where p.user_id = (select auth.uid())
        and p.role = 'author'
        and p.approval_status = 'approved'
    )
  )
  with check (
    author_id = (select auth.uid())
    and status in ('draft', 'pending_review')
    and exists (
      select 1 from public.user_profiles p
      where p.user_id = (select auth.uid())
        and p.role = 'author'
        and p.approval_status = 'approved'
    )
  );

grant select on public.user_profiles, public.author_articles to authenticated;
grant insert, update on public.author_articles to authenticated;

-- Keep public reading of published news intact, but remove the known blanket
-- client INSERT policies. The existing cron/service-role pipeline can still
-- write, while author submissions must pass the review workflow above.
drop policy if exists "Allow insert for all" on public.news;
drop policy if exists "Allow public inserts" on public.news;

alter table public.news
  add column if not exists source_url text,
  add column if not exists author_id uuid references auth.users(id) on delete set null,
  add column if not exists author_name text;

-- Authors may upload images to their own folder after approval. Keep the bucket
-- public for article display; upload authorization remains private/RLS-checked.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('author-article-images', 'author-article-images', true, 10485760,
        array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Approved authors upload article images to own folder" on storage.objects;
create policy "Approved authors upload article images to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'author-article-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.user_profiles p
      where p.user_id = (select auth.uid())
        and p.role = 'author'
        and p.approval_status = 'approved'
    )
  );

drop policy if exists "Authors update their own article images" on storage.objects;
create policy "Authors update their own article images"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'author-article-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'author-article-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Authors delete their own article images" on storage.objects;
create policy "Authors delete their own article images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'author-article-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Public can view author article images" on storage.objects;
create policy "Public can view author article images"
  on storage.objects for select to public
  using (bucket_id = 'author-article-images');
