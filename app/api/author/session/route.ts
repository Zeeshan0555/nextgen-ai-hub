import { NextRequest, NextResponse } from "next/server";
import {
  AUTHOR_SESSION_COOKIE,
  AUTHOR_SESSION_MAX_AGE_SECONDS,
  createAuthorSessionToken,
  getAuthorSession,
  isAuthorSessionConfigured,
  verifyAuthorCredentials,
} from "@/app/lib/author-session";

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

function isAuthorWorkspaceConfigured(): boolean {
  return (
    isAuthorSessionConfigured() &&
    /^[a-f0-9]{64}$/i.test(process.env.NEUROWIRE_AUTHOR_DRAFT_ENCRYPTION_KEY || "") &&
    Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: true, configured: isAuthorWorkspaceConfigured(), isAuthenticated: Boolean(getAuthorSession(request)) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest) {
  if (rejectCrossOriginRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Request origin was not accepted." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }
  if (!isAuthorWorkspaceConfigured()) {
    return NextResponse.json(
      { success: false, error: "Author sign-in is not configured on this deployment yet." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid sign-in request");
  } catch {
    return NextResponse.json(
      { success: false, error: "Enter your Author username and password." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const username = verifyAuthorCredentials(body.username, body.password);
  if (!username) {
    return NextResponse.json(
      { success: false, error: "The Author username or password is incorrect." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const token = createAuthorSessionToken(username);
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Author sign-in is not configured correctly." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const response = NextResponse.json(
    { success: true, isAuthenticated: true, username },
    { headers: { "Cache-Control": "no-store" } }
  );
  response.cookies.set(AUTHOR_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: AUTHOR_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json(
    { success: true, isAuthenticated: false },
    { headers: { "Cache-Control": "no-store" } }
  );
  response.cookies.set(AUTHOR_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
