import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  hasAdminSession,
  verifyAdminPassword,
} from "../../../lib/admin-session";

export const dynamic = "force-dynamic";

function unavailableResponse() {
  return NextResponse.json(
    { success: false, error: "Admin access is not configured on this deployment." },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: true, isAuthenticated: hasAdminSession(request) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(request: NextRequest) {
  if (
    !process.env.NEUROWIRE_ADMIN_PASSWORD ||
    !process.env.NEUROWIRE_ADMIN_SESSION_SECRET ||
    process.env.NEUROWIRE_ADMIN_SESSION_SECRET.length < 32
  ) {
    return unavailableResponse();
  }

  let body: { password?: unknown };
  try {
    body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new Error("Invalid sign-in request");
    }
  } catch {
    return NextResponse.json(
      { success: false, error: "Enter the admin password and try again." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!verifyAdminPassword(body.password)) {
    return NextResponse.json(
      { success: false, error: "The admin password is incorrect." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  const token = createAdminSessionToken();
  if (!token) return unavailableResponse();

  const response = NextResponse.json(
    { success: true, isAuthenticated: true },
    { headers: { "Cache-Control": "no-store" } }
  );
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json(
    { success: true, isAuthenticated: false },
    { headers: { "Cache-Control": "no-store" } }
  );
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  return response;
}
