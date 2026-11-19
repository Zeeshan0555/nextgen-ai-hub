import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

export const PRIVATE_AUTHOR_DRAFT_MARKER = "NEUROWIRE_PRIVATE_AUTHOR_DRAFT_V1";
export const PRIVATE_AUTHOR_DRAFT_SOURCE = "NeuroWire Private Draft";
export const PRIVATE_AUTHOR_DRAFT_TITLE = "Private author draft";

export type AuthorDraftStatus = "draft" | "submitted" | "revision_requested" | "published";

export type AuthorDraft = {
  title: string;
  category: string;
  source: string;
  sourceUrl: string;
  description: string;
  content: string;
  imageUrl: string;
  status: AuthorDraftStatus;
  feedback: string;
  author: string;
  createdAt: string;
  updatedAt: string;
};

function getEncryptionKey(): Buffer | null {
  const value = process.env.NEUROWIRE_AUTHOR_DRAFT_ENCRYPTION_KEY || "";
  if (!/^[a-f0-9]{64}$/i.test(value)) return null;
  return Buffer.from(value, "hex");
}

export function isPrivateAuthorDraftContent(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(PRIVATE_AUTHOR_DRAFT_MARKER + "\n");
}

export function encryptAuthorDraft(draft: AuthorDraft): string | null {
  const key = getEncryptionKey();
  if (!key) return null;

  try {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(draft), "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    const payload = Buffer.concat([iv, tag, encrypted]).toString("base64url");
    return PRIVATE_AUTHOR_DRAFT_MARKER + "\n" + payload;
  } catch {
    return null;
  }
}

export function decryptAuthorDraft(value: unknown): AuthorDraft | null {
  if (!isPrivateAuthorDraftContent(value)) return null;
  const key = getEncryptionKey();
  if (!key) return null;

  try {
    const payload = Buffer.from(value.slice((PRIVATE_AUTHOR_DRAFT_MARKER + "\n").length), "base64url");
    if (payload.length <= 28) return null;

    const iv = payload.subarray(0, 12);
    const tag = payload.subarray(12, 28);
    const encrypted = payload.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
    const parsed: unknown = JSON.parse(plain);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

    const draft = parsed as Record<string, unknown>;
    const statuses: AuthorDraftStatus[] = ["draft", "submitted", "revision_requested", "published"];
    if (
      typeof draft.title !== "string" ||
      typeof draft.category !== "string" ||
      typeof draft.source !== "string" ||
      typeof draft.sourceUrl !== "string" ||
      typeof draft.description !== "string" ||
      typeof draft.content !== "string" ||
      typeof draft.imageUrl !== "string" ||
      typeof draft.status !== "string" ||
      !statuses.includes(draft.status as AuthorDraftStatus) ||
      typeof draft.feedback !== "string" ||
      typeof draft.author !== "string" ||
      typeof draft.createdAt !== "string" ||
      typeof draft.updatedAt !== "string"
    ) return null;

    return draft as unknown as AuthorDraft;
  } catch {
    return null;
  }
}
