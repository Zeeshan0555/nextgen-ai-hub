export const EDITORIAL_ARTICLE_MARKER = "NEUROWIRE_EDITORIAL_ARTICLE_V1";
export const EDITORIAL_BRIEF_MARKER = "NEUROWIRE_EDITORIAL_BRIEF_V1";

// Internal editorial quality floor. This is not a Google-required word count.
export const EDITORIAL_REQUIRED_WORDS = 350;

function visibleArticleText(content: string): string {
  return content
    .split(/\r?\n/)
    .filter((line) =>
      !line.startsWith("NEUROWIRE_") &&
      !line.startsWith("ORIGINAL_SOURCE_URL:")
    )
    .join("\n")
    .trim();
}

export function isIndexableEditorialArticle(input: {
  title: unknown;
  description: unknown;
  source: unknown;
  content: unknown;
}): boolean {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const source = typeof input.source === "string" ? input.source.trim() : "";
  const content = typeof input.content === "string" ? input.content : "";

  if (title.length < 20 || description.length < 60 || !source) return false;
  if (
    !content.startsWith(EDITORIAL_ARTICLE_MARKER) &&
    !content.startsWith(EDITORIAL_BRIEF_MARKER)
  ) return false;

  const text = visibleArticleText(content);
  const words = text.match(/[A-Za-z0-9][A-Za-z0-9’'-]*/g) || [];
  const paragraphs = text
    .split(/\n\s*\n/)
    .filter((paragraph) => paragraph.trim().length >= 50);
  const headings = content
    .split(/\r?\n/)
    .filter((line) => /^#{2,3}\s+\S/.test(line.trim()));

  return (
    words.length >= EDITORIAL_REQUIRED_WORDS &&
    paragraphs.length >= 3 &&
    headings.length >= 2
  );
}
