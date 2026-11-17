import { NextRequest, NextResponse } from "next/server";
import { hasAdminSession } from "@/app/lib/admin-session";
import { createEditorialBriefing, formatEditorialBriefing } from "@/app/lib/gemini-editorial";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALLOWED_CATEGORIES = new Set([
  "AI",
  "Crypto",
  "Policy",
  "Technology",
  "Fox News",
  "Leadership",
]);

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

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { success: false, error: "AI drafting is not configured on this deployment." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid briefing request");
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, error: "The briefing details could not be read." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const title = cleanText(body.title, 180);
  const category = cleanText(body.category, 40);
  const publisher = cleanText(body.publisher, 120);
  const publisherUrl = cleanText(body.publisherUrl, 2048);
  const sourceText = cleanText(body.sourceText, 12000);

  if (!title || !publisher || !ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json(
      { success: false, error: "Add a headline, publisher and one of the six categories." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const parsedUrl = new URL(publisherUrl);
    if (parsedUrl.protocol !== "https:") throw new Error("HTTPS required");
  } catch {
    return NextResponse.json(
      { success: false, error: "Add a valid HTTPS link to the original source." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (sourceText.length < 900) {
    return NextResponse.json(
      { success: false, error: "Add more original source notes. At least 900 characters are needed for an evidence-checked draft." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const briefing = await createEditorialBriefing({
    title,
    category,
    publisher,
    publisherUrl,
    publishedAt: new Date().toISOString(),
    sourceText,
  });

  if (!briefing) {
    return NextResponse.json(
      { success: false, error: "AI could not produce a draft that passed the source-evidence checks. Review your notes or try again." },
      { status: 422, headers: { "Cache-Control": "no-store" } }
    );
  }

  return NextResponse.json(
    {
      success: true,
      briefing,
      content: formatEditorialBriefing(briefing, publisherUrl),
      requiresAdminReview: true,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
