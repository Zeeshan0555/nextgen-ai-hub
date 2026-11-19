import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const AUTHOR_SESSION_COOKIE = "neurowire_author_session";
export const AUTHOR_SESSION_MAX_AGE_SECONDS = 12 * 60 * 60;

type AuthorSessionPayload = {
  username: string;
  expiresAt: number;
  nonce: string;
};

function safeEqual(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  if (leftBytes.length !== rightBytes.length) return false;
  return timingSafeEqual(leftBytes, rightBytes);
}

type AuthorAccount = { username: string; password: string };

function getAuthorAccounts(): AuthorAccount[] {
  const accountsJson = process.env.NEUROWIRE_AUTHOR_ACCOUNTS_JSON;
  if (accountsJson) {
    try {
      const parsed: unknown = JSON.parse(accountsJson);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is AuthorAccount => Boolean(
        item &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).username === "string" &&
        typeof (item as Record<string, unknown>).password === "string" &&
        (item as Record<string, string>).username.trim().length > 0 &&
        (item as Record<string, string>).username.length <= 120 &&
        (item as Record<string, string>).password.length >= 12 &&
        (item as Record<string, string>).password.length <= 256
      ));
    } catch {
      return [];
    }
  }

  const username = process.env.NEUROWIRE_AUTHOR_USERNAME?.trim() || "";
  const password = process.env.NEUROWIRE_AUTHOR_PASSWORD || "";
  return username && password.length >= 12 && password.length <= 256
    ? [{ username, password }]
    : [];
}

function getSessionSecret(): string | null {
  const secret = process.env.NEUROWIRE_AUTHOR_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export function verifyAuthorCredentials(username: unknown, password: unknown): string | null {
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    username.length > 120 ||
    password.length > 256
  ) return null;

  const normalizedUsername = username.trim().toLocaleLowerCase();
  for (const account of getAuthorAccounts()) {
    if (
      safeEqual(normalizedUsername, account.username.trim().toLocaleLowerCase()) &&
      safeEqual(password, account.password)
    ) return account.username.trim();
  }
  return null;
}

export function createAuthorSessionToken(username: string, now = Date.now()): string | null {
  const secret = getSessionSecret();
  if (!secret || !username.trim()) return null;

  const payload: AuthorSessionPayload = {
    username: username.trim(),
    expiresAt: Math.floor(now / 1000) + AUTHOR_SESSION_MAX_AGE_SECONDS,
    nonce: randomBytes(16).toString("hex"),
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return encoded + "." + signature;
}

export function getAuthorSession(request: Request, now = Date.now()): { username: string } | null {
  const secret = getSessionSecret();
  if (!secret) return null;

  const cookieHeader = request.headers.get("cookie") || "";
  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(AUTHOR_SESSION_COOKIE + "="));
  if (!cookie) return null;

  const token = cookie.slice(AUTHOR_SESSION_COOKIE.length + 1);
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encoded, providedSignature] = parts;
  const expectedSignature = createHmac("sha256", secret).update(encoded).digest("base64url");
  if (!safeEqual(providedSignature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<AuthorSessionPayload>;
    const nowSeconds = Math.floor(now / 1000);
    if (
      typeof payload.username !== "string" ||
      !payload.username.trim() ||
      !Number.isSafeInteger(payload.expiresAt) ||
      (payload.expiresAt as number) <= nowSeconds ||
      (payload.expiresAt as number) > nowSeconds + AUTHOR_SESSION_MAX_AGE_SECONDS + 60 ||
      typeof payload.nonce !== "string" ||
      !/^[a-f0-9]{32}$/.test(payload.nonce)
    ) return null;

    return { username: payload.username };
  } catch {
    return null;
  }
}

export function isAuthorSessionConfigured(): boolean {
  return getAuthorAccounts().length > 0 && Boolean(getSessionSecret());
}
