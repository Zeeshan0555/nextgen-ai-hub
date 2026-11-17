import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "neurowire_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

function getSessionSecret(): string | null {
  const secret = process.env.NEUROWIRE_ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

function safeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  if (leftBytes.length !== rightBytes.length) return false;
  return timingSafeEqual(leftBytes, rightBytes);
}

export function verifyAdminPassword(candidate: unknown): boolean {
  const configuredPassword = process.env.NEUROWIRE_ADMIN_PASSWORD;
  if (
    typeof candidate !== "string" ||
    candidate.length === 0 ||
    candidate.length > 256 ||
    !configuredPassword
  ) return false;
  return safeEqual(candidate, configuredPassword);
}

export function createAdminSessionToken(now = Date.now()): string | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const expiresAt = Math.floor(now / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS;
  const payload = Buffer.from(
    `${expiresAt}.${randomBytes(16).toString("hex")}`
  ).toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

export function isAdminSessionTokenValid(
  token: string | undefined,
  now = Date.now()
): boolean {
  const secret = getSessionSecret();
  if (!secret || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payload, providedSignature] = parts;
  const expectedSignature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  if (!safeEqual(providedSignature, expectedSignature)) return false;

  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const [expiresAtText, nonce] = decoded.split(".");
    const expiresAt = Number(expiresAtText);
    const nowSeconds = Math.floor(now / 1000);

    return (
      Number.isSafeInteger(expiresAt) &&
      expiresAt > nowSeconds &&
      expiresAt <= nowSeconds + ADMIN_SESSION_MAX_AGE_SECONDS + 60 &&
      typeof nonce === "string" &&
      /^[a-f0-9]{32}$/.test(nonce)
    );
  } catch {
    return false;
  }
}

export function hasAdminSession(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));

  if (!cookie) return false;

  const token = cookie.slice(ADMIN_SESSION_COOKIE.length + 1);
  return isAdminSessionTokenValid(token);
}
