export const EDITORIAL_ARTICLE_MARKER = "NEUROWIRE_EDITORIAL_ARTICLE_V1";
export const EDITORIAL_BRIEF_MARKER = "NEUROWIRE_EDITORIAL_BRIEF_V1";
export const EDITORIAL_REQUIRED_WORDS = 350;

function visibleArticleText(content: string): string {
  return content.split("\n").filter((line) => !line.startsWith("NEUROWIRE_") && !line.startsWith("ORIGINAL_SOURCE_URL:")).join(" ").trim();
}

export function isIndexableEditorialArticle(input: { title: unknown; description: unknown; source: unknown; content: unknown }): boolean {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const source = typeof input.source === "string" ? input.source.trim() : "";
  const content = typeof input.content === "string" ? input.content : "";
  if (!title || title.length < 20 || description.length < 60 || !source) return false;
  if (!content.startsWith(EDITORIAL_ARTICLE_MARKER) && !content.startsWith(EDITORIAL_BRIEF_MARKER)) return false;
  const text = visibleArticleText(content);
  const words = text.split(/\\s+/).filter(Boolean);
  const paragraphs = text.split(/\\n\\s*\\n/).filter((part) => part.trim().length >= 50);
  const headings = content.split("\n").filter((line) => /^#{2,3}\\s+\\S/.test(line));
  return words.length >= EDITORIAL_REQUIRED_WORDS && paragraphs.length >= 3 && headings.length >= 2;
}