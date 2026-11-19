import { NextRequest, NextResponse } from "next/server";
import { getAuthorSession } from "@/app/lib/author-session";
import {
  encryptAuthorDraft,
  decryptAuthorDraft,
  PRIVATE_AUTHOR_DRAFT_MARKER,
  PRIVATE_AUTHOR_DRAFT_SOURCE,
  PRIVATE_AUTHOR_DRAFT_TITLE,
  type AuthorDraft,
  type AuthorDraftStatus,
} from "@/app/lib/author-drafts";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";

export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = new Set(["AI", "Crypto", "Policy", "Technology", "Fox News", "Leadership"]);

function rejectCrossOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin !== request.nextUrl.origin;
  } catch {
    return true;
  }
}

function cleanText(value: unknown, maximumLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function isOptionalHttpsUrl(value: string): boolean {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Author sign-in is required." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

function configurationError() {
  return NextResponse.json(
    { success: false, error: "Private Author draft storage is not configured on this deployment." },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

function publicDraft(id: string, draft: AuthorDraft) {
  return { id, ...draft };
}

function readDraftFields(body: Record<string, unknown>) {
  const title = cleanText(body.title, 180);
  const category = cleanText(body.category, 40);
  const source = cleanText(body.source, 120);
  const sourceUrl = cleanText(body.sourceUrl, 2048);
  const description = cleanText(body.description, 1000);
  const content = cleanText(body.content, 30000);
  const imageUrl = cleanText(body.imageUrl, 2048);

  if (title.length < 8 || !source || !ALLOWED_CATEGORIES.has(category) || content.length < 40) {
    return { error: "Add a clear headline, one of the six categories, a source name and at least 40 characters of article text." } as const;
  }
  if (!isOptionalHttpsUrl(sourceUrl) || !isOptionalHttpsUrl(imageUrl)) {
    return { error: "Source and image links must use HTTPS." } as const;
  }

  return { value: { title, category, source, sourceUrl, description, content, imageUrl } } as const;
}

export async function GET(request: NextRequest) {
  const session = getAuthorSession(request);
  if (!session) return unauthorized();
  if (!process.env.NEUROWIRE_AUTHOR_DRAFT_ENCRYPTION_KEY) return configurationError();

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("news")
      .select("id, content, created_at")
      .eq("source", PRIVATE_AUTHOR_DRAFT_SOURCE)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) throw error;

    const drafts = (data || []).flatMap((row) => {
      const draft = decryptAuthorDraft(row.content);
      if (!draft || draft.author !== session.username) return [];
      return [publicDraft(String(row.id), draft)];
    });

    return NextResponse.json(
      { success: true, drafts },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Your drafts could not be loaded. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request: NextRequest) {
  if (rejectCrossOriginRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Request origin was not accepted." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const session = getAuthorSession(request);
  if (!session) return unauthorized();
  if (!process.env.NEUROWIRE_AUTHOR_DRAFT_ENCRYPTION_KEY) return configurationError();

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid draft");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, error: "The draft details could not be read." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const fields = readDraftFields(body);
  if (!("value" in fields)) {
    return NextResponse.json(
      { success: false, error: fields.error },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const now = new Date().toISOString();
  const status: AuthorDraftStatus = body.action === "submit" ? "submitted" : "draft";
  const draft: AuthorDraft = {
    ...fields.value,
    status,
    feedback: "",
    author: session.username,
    createdAt: now,
    updatedAt: now,
  };
  const encrypted = encryptAuthorDraft(draft);
  if (!encrypted) return configurationError();

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("news")
      .insert({
        title: PRIVATE_AUTHOR_DRAFT_TITLE,
        category: "AI",
        source: PRIVATE_AUTHOR_DRAFT_SOURCE,
        description: "Private encrypted Author draft",
        content: encrypted,
        image_url: null,
      })
      .select("id")
      .single();

    if (error || !data) throw error || new Error("Draft ID missing");

    return NextResponse.json(
      { success: true, draft: publicDraft(String(data.id), draft) },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Your draft could not be saved. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (rejectCrossOriginRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Request origin was not accepted." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  const session = getAuthorSession(request);
  if (!session) return unauthorized();
  if (!process.env.NEUROWIRE_AUTHOR_DRAFT_ENCRYPTION_KEY) return configurationError();

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid draft");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, error: "The draft details could not be read." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const id = cleanText(body.id, 80);
  const action = body.action === "submit" || body.action === "resubmit" ? body.action : "save";
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) {
    return NextResponse.json(
      { success: false, error: "The selected draft ID is not valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const fields = readDraftFields(body);
  if (!("value" in fields)) {
    return NextResponse.json(
      { success: false, error: fields.error },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data: row, error: readError } = await supabase
      .from("news")
      .select("id, content")
      .eq("id", id)
      .eq("source", PRIVATE_AUTHOR_DRAFT_SOURCE)
      .maybeSingle();

    if (readError) throw readError;
    const existing = decryptAuthorDraft(row?.content);
    if (!row || !existing || existing.author !== session.username) {
      return NextResponse.json(
        { success: false, error: "This draft was not found in your account." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (existing.status === "published") {
      return NextResponse.json(
        { success: false, error: "Published articles can no longer be changed here." },
        { status: 409, headers: { "Cache-Control": "no-store" } }
      );
    }

    const nextDraft: AuthorDraft = {
      ...existing,
      ...fields.value,
      status: action === "submit" || action === "resubmit"
        ? "submitted"
        : existing.status,
      feedback: action === "resubmit" ? "" : existing.feedback,
      updatedAt: new Date().toISOString(),
    };
    const encrypted = encryptAuthorDraft(nextDraft);
    if (!encrypted) return configurationError();

    const { error: updateError } = await supabase
      .from("news")
      .update({ content: encrypted })
      .eq("id", id)
      .eq("source", PRIVATE_AUTHOR_DRAFT_SOURCE);

    if (updateError) throw updateError;

    return NextResponse.json(
      { success: true, draft: publicDraft(id, nextDraft) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Your draft could not be updated. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
