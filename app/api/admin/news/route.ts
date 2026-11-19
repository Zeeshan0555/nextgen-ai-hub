import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "../../../lib/admin-session";
import { createSupabaseServerClient } from "../../../lib/supabase-server";

export const dynamic = "force-dynamic";

const ALLOWED_CATEGORIES = new Set([
  "AI",
  "Crypto",
  "Policy",
  "Technology",
  "Fox News",
  "Leadership",
]);

type PublishBody = {
  title?: unknown;
  category?: unknown;
  source?: unknown;
  image_url?: unknown;
  source_url?: unknown;
  description?: unknown;
  content?: unknown;
};

function cleanText(value: unknown, maximumLength: number): string {
  return typeof value === "string"
    ? value.trim().slice(0, maximumLength)
    : "";
}

function rejectCrossOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin !== request.nextUrl.origin;
  } catch {
    return true;
  }
}

export async function POST(request: NextRequest) {
  if (rejectCrossOriginRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Request origin was not accepted." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!hasAdminSession(request)) {
    return NextResponse.json(
      { success: false, error: "Admin sign-in is required." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: PublishBody;
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Invalid article details");
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "The article details could not be read." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const title = cleanText(body.title, 180);
  const category = cleanText(body.category, 40);
  const source = cleanText(body.source, 120);
  const description = cleanText(body.description, 1000);
  const content = cleanText(body.content, 30000);
  const imageUrl = cleanText(body.image_url, 2048);
  const sourceUrl = cleanText(body.source_url, 2048);

  if (!title || !source || content.length < 40) {
    return NextResponse.json(
      { success: false, error: "Add a headline, source name, and a full article." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json(
      { success: false, error: "Choose one of the six available news categories." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (imageUrl) {
    try {
      if (new URL(imageUrl).protocol !== "https:") throw new Error("HTTPS required");
    } catch {
      return NextResponse.json(
        { success: false, error: "Use a valid HTTPS image link, or leave it empty." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  let storedContent = content;
  if (!storedContent.startsWith("NEUROWIRE_EDITORIAL_BRIEF_V1") && !storedContent.startsWith("NEUROWIRE_EDITORIAL_ARTICLE_V1")) {
    storedContent = "NEUROWIRE_EDITORIAL_ARTICLE_V1\n\n" + storedContent;
  }
  if (storedContent.startsWith("NEUROWIRE_EDITORIAL_ARTICLE_V1") && !storedContent.includes("NEUROWIRE_AUTHOR_NAME:")) {
    storedContent += "\n\nNEUROWIRE_AUTHOR_NAME: NeuroWire Admin";
  }
  if (sourceUrl) {
    try {
      if (new URL(sourceUrl).protocol !== "https:") throw new Error("HTTPS required");
      if (!storedContent.includes("ORIGINAL_SOURCE_URL:")) {
        storedContent += "\n\nORIGINAL_SOURCE_URL: " + sourceUrl;
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Use a valid HTTPS source link, or leave it empty." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("news")
      .insert({
        title,
        category,
        source,
        description: description || content.slice(0, 240),
        content: storedContent,
        image_url: imageUrl || null,
      })
      .select("id, title, category, source, description, content, image_url, created_at")
      .single();

    if (error || !data) {
      console.error("Admin article publish failed:", error?.message || "No article row returned");
      return NextResponse.json(
        { success: false, error: "The article could not be saved. Please try again." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { success: true, story: data },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(
      "Admin article publish error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { success: false, error: "The article could not be saved. Please check the server setup." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}


type UpdateBody = PublishBody & { id?: unknown };

function isHttpsUrl(value: string): boolean {
  if (!value) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function PATCH(request: NextRequest) {
  if (rejectCrossOriginRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Request origin was not accepted." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!hasAdminSession(request)) {
    return NextResponse.json(
      { success: false, error: "Admin sign-in is required." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: UpdateBody;
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Invalid article details");
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "The article details could not be read." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const id = cleanText(body.id, 80);
  const title = cleanText(body.title, 180);
  const category = cleanText(body.category, 40);
  const source = cleanText(body.source, 120);
  const description = cleanText(body.description, 1000);
  const content = cleanText(body.content, 30000);
  const imageUrl = cleanText(body.image_url, 2048);
  const sourceUrl = cleanText(body.source_url, 2048);
  const articleText = content
    .split(/\r?\n/)
    .filter((line) => !line.startsWith("NEUROWIRE_") && !line.startsWith("ORIGINAL_SOURCE_URL:"))
    .join("\n")
    .trim();

  if (!id || !/^[a-zA-Z0-9_-]{1,80}$/.test(id)) {
    return NextResponse.json(
      { success: false, error: "The selected article ID is not valid." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!title || !source || articleText.length < 40) {
    return NextResponse.json(
      { success: false, error: "Add a headline, source name, and at least 40 characters of article text." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json(
      { success: false, error: "Choose one of the six available news categories." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!isHttpsUrl(imageUrl) || !isHttpsUrl(sourceUrl)) {
    return NextResponse.json(
      { success: false, error: "Image and source links must use HTTPS." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  let storedContent = content
    .split(/\r?\n/)
    .filter((line) => !line.startsWith("ORIGINAL_SOURCE_URL:"))
    .join("\n")
    .trim();

  if (
    !storedContent.startsWith("NEUROWIRE_EDITORIAL_BRIEF_V1") &&
    !storedContent.startsWith("NEUROWIRE_EDITORIAL_ARTICLE_V1")
  ) {
    storedContent = "NEUROWIRE_EDITORIAL_ARTICLE_V1\n\n" + storedContent;
  }
  if (
    storedContent.startsWith("NEUROWIRE_EDITORIAL_ARTICLE_V1") &&
    !storedContent.includes("NEUROWIRE_AUTHOR_NAME:")
  ) {
    storedContent += "\n\nNEUROWIRE_AUTHOR_NAME: NeuroWire Admin";
  }
  if (sourceUrl) {
    storedContent += "\n\nORIGINAL_SOURCE_URL: " + sourceUrl;
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("news")
      .update({
        title,
        category,
        source,
        description: description || articleText.slice(0, 240),
        content: storedContent,
        image_url: imageUrl || null,
      })
      .eq("id", id)
      .select("id, title, category, source, description, content, image_url, created_at")
      .maybeSingle();

    if (error) {
      console.error("Admin article update failed:", error.message);
      return NextResponse.json(
        { success: false, error: "The article could not be updated. Please try again." },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "The selected article could not be found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      { success: true, story: data },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error(
      "Admin article update error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { success: false, error: "The article could not be updated. Please check the server setup." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
