import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/app/lib/admin-session";
import {
  decryptAuthorDraft,
  encryptAuthorDraft,
  PRIVATE_AUTHOR_DRAFT_SOURCE,
  type AuthorDraft,
} from "@/app/lib/author-drafts";
import { createSupabaseServerClient } from "@/app/lib/supabase-server";
import { isIndexableEditorialArticle } from "@/app/lib/article-quality";

export const dynamic = "force-dynamic";

function rejectCrossOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin !== request.nextUrl.origin;
  } catch {
    return true;
  }
}

function unauthorized() {
  return NextResponse.json(
    { success: false, error: "Admin sign-in is required." },
    { status: 401, headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) return unauthorized();
  if (!process.env.NEUROWIRE_AUTHOR_DRAFT_ENCRYPTION_KEY) {
    return NextResponse.json(
      { success: false, error: "Private Author draft storage is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

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
      if (!draft) return [];
      return [{ id: String(row.id), ...draft }];
    });

    return NextResponse.json(
      { success: true, drafts },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Author submissions could not be loaded." },
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
  if (!hasAdminSession(request)) return unauthorized();
  if (!process.env.NEUROWIRE_AUTHOR_DRAFT_ENCRYPTION_KEY) {
    return NextResponse.json(
      { success: false, error: "Private Author draft storage is not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid review request");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, error: "The review details could not be read." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  const action = body.action;
  const feedback = typeof body.feedback === "string" ? body.feedback.trim().slice(0, 1200) : "";
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id) || (action !== "request_revision" && action !== "publish")) {
    return NextResponse.json(
      { success: false, error: "Choose a valid submission and review action." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }
  if (action === "request_revision" && feedback.length < 5) {
    return NextResponse.json(
      { success: false, error: "Add clear feedback before sending an article back for changes." },
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
    const draft = decryptAuthorDraft(row?.content);
    if (!row || !draft) {
      return NextResponse.json(
        { success: false, error: "The selected Author submission could not be found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (draft.status !== "submitted") {
      return NextResponse.json(
        { success: false, error: "Only submitted articles can be reviewed or published." },
        { status: 409, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (action === "request_revision") {
      const updatedDraft: AuthorDraft = {
        ...draft,
        status: "revision_requested",
        feedback,
        updatedAt: new Date().toISOString(),
      };
      const encrypted = encryptAuthorDraft(updatedDraft);
      if (!encrypted) throw new Error("Draft encryption is unavailable");
      const { error } = await supabase
        .from("news")
        .update({ content: encrypted })
        .eq("id", id)
        .eq("source", PRIVATE_AUTHOR_DRAFT_SOURCE);
      if (error) throw error;

      return NextResponse.json(
        { success: true, draft: { id, ...updatedDraft } },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!draft.sourceUrl || !draft.sourceUrl.startsWith("https://")) {
      return NextResponse.json(
        { success: false, error: "Add a valid original source link before publishing." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const articleContent = [
      "NEUROWIRE_EDITORIAL_ARTICLE_V1",
      "",
      draft.content,
      "",
      "NEUROWIRE_AUTHOR_NAME: " + draft.author,
      "",
      "NEUROWIRE_AUTHOR_DRAFT_ID: " + id,
      "",
      "ORIGINAL_SOURCE_URL: " + draft.sourceUrl,
    ].join("\n");

    if (!isIndexableEditorialArticle({
      title: draft.title,
      description: draft.description,
      source: draft.source,
      content: articleContent,
    })) {
      return NextResponse.json(
        { success: false, error: "This article does not yet meet the newsroom's minimum quality checks. Add a fuller summary, clear sections and supporting detail before publication." },
        { status: 422, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { data: possibleDuplicate, error: duplicateError } = await supabase
      .from("news")
      .select("id, content")
      .eq("title", draft.title)
      .eq("source", draft.source)
      .limit(20);

    if (duplicateError) throw duplicateError;
    const alreadyPublished = (possibleDuplicate || []).find((item) =>
      typeof item.content === "string" &&
      item.content.includes("NEUROWIRE_AUTHOR_DRAFT_ID: " + id)
    );

    let articleId: string;
    if (alreadyPublished) {
      articleId = String(alreadyPublished.id);
    } else {
      const { data: published, error: publishError } = await supabase
        .from("news")
        .insert({
          title: draft.title,
          category: draft.category,
          source: draft.source,
          description: draft.description,
          content: articleContent,
          image_url: draft.imageUrl || null,
        })
        .select("id")
        .single();

      if (publishError || !published) throw publishError || new Error("Published article ID missing");
      articleId = String(published.id);
    }

    const updatedDraft: AuthorDraft = {
      ...draft,
      status: "published",
      feedback: "",
      updatedAt: new Date().toISOString(),
    };
    const encrypted = encryptAuthorDraft(updatedDraft);
    if (!encrypted) throw new Error("Draft encryption is unavailable");
    const { error: updateError } = await supabase
      .from("news")
      .update({ content: encrypted })
      .eq("id", id)
      .eq("source", PRIVATE_AUTHOR_DRAFT_SOURCE);
    if (updateError) throw updateError;

    return NextResponse.json(
      { success: true, articleId, draft: { id, ...updatedDraft } },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "The Author submission could not be updated. Please try again." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
