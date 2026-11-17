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

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("news")
      .insert({
        title,
        category,
        source,
        description: description || content.slice(0, 240),
        content,
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
