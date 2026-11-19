# NeuroWire admin access

The admin controls now use a signed, HTTP-only session cookie. The old `?admin=true` URL switch and browser-storage flag are not accepted as proof of access.

Before using admin sign-in on a deployment, configure these server-only environment variables:

- `NEUROWIRE_ADMIN_PASSWORD`: a long, unique admin password.
- `NEUROWIRE_ADMIN_SESSION_SECRET`: a random secret with at least 32 characters.

Do not add either value to source files, commit them to GitHub, or use a `NEXT_PUBLIC_` prefix. Keep the signing secret private. Changing the signing secret invalidates existing sessions.

The session cookie is HTTP-only, uses SameSite=Strict, is Secure in production, and expires after 12 hours. Sign out clears the browser cookie. The protected Admin Dashboard also provides a sign-out control.

Manual article publishing is routed through the protected server endpoint and uses the existing server-side Supabase client helper. No Supabase project settings, credentials, schema, or database configuration were changed in this branch.

## Current limits

- This is a single-admin password gate, not a multi-author account and approval system.
- Login attempt rate limiting and central session revocation still need a deployment-level solution before treating this as a complete production identity system.
- The project branch has not been deployed. Its environment variables have not been configured or tested here.
- Supabase Row Level Security policies were not inspected or changed. Until those policies are verified separately, do not assume this route prevents every possible direct write using a public database key.

## Author access and private drafts

The Author sign-in and draft workflow uses a separate signed, HTTP-only session. Author passwords and signing keys are server-only environment variables. Never place them in source files, GitHub commits, browser code or variables with a `NEXT_PUBLIC_` prefix.

Configure these server-side variables before enabling the Author workspace:

- `NEUROWIRE_AUTHOR_ACCOUNTS_JSON`: a JSON array of Author accounts. Each entry has a `username` and a unique `password` of at least 12 characters. Example shape only: `[{"username":"author-one","password":"use-a-long-unique-password"}]`. Add one entry per Author.
- `NEUROWIRE_AUTHOR_SESSION_SECRET`: a random secret with at least 32 characters.
- `NEUROWIRE_AUTHOR_DRAFT_ENCRYPTION_KEY`: exactly 64 hexadecimal characters (32 random bytes) for AES-256-GCM draft encryption.
- The existing server-side Supabase URL and `SUPABASE_SERVICE_ROLE_KEY` must already be available to the server. Do not expose the service-role key to the browser.

A single account can also be configured with `NEUROWIRE_AUTHOR_USERNAME` and `NEUROWIRE_AUTHOR_PASSWORD` instead of the JSON list. The JSON list supports multiple named Authors. The Admin currently reviews their submissions; account invitations and password changes are still handled outside the website by updating the server environment.

Author drafts are encrypted on the server before being stored in the existing `news` table. The public homepage, article lookup and Admin article list exclude the private-draft records. The encrypted content is not sent to the browser until the signed Author or Admin API has checked the session. Each Author can list and edit only drafts whose encrypted owner matches their sign-in username. Admin can review submissions, request changes, and publish them after the article passes the newsroom quality checks.

Saving a draft does not publish it. Authors must submit it for review; when Admin requests changes, the Author must revise and resubmit before it can be published. Published stories are copied into normal public news records. The encrypted private draft is retained with a published status so the workflow history is not silently discarded.

This is an initial environment-configured account system, not a full user-management screen. Login rate limiting, account recovery, password rotation UI, central session revocation and multi-factor authentication still need a deployment-level plan before treating it as a complete production identity system. Do not use weak or shared passwords. Keep the encryption key backed up securely: losing it makes saved Author drafts unreadable.
