export type EditorialEvidencePoint = {
  point: string;
  evidence: string;
};

export type EditorialBriefing = {
  summary: string;
  keyPoints: EditorialEvidencePoint[];
  whyItMatters: string;
  openQuestions: string[];
};

type EditorialInput = {
  title: string;
  category: string;
  publisher: string;
  publisherUrl: string;
  publishedAt: string;
  sourceText: string;
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
};

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeForEvidence(value: string): string {
  return value.toLocaleLowerCase().replace(/\s+/g, " ").trim();
}

function hasSourceEvidence(sourceText: string, evidence: string): boolean {
  const quote = normalizeForEvidence(evidence);
  const source = normalizeForEvidence(sourceText);
  const words = quote.split(/\s+/).filter(Boolean);
  return words.length >= 5 && words.length <= 14 && source.includes(quote);
}

function isBriefingShape(value: unknown, sourceText: string): value is EditorialBriefing {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  const summary = cleanString(data.summary, 900);
  const whyItMatters = cleanString(data.whyItMatters, 600);
  const keyPoints = Array.isArray(data.keyPoints) ? data.keyPoints : [];
  const openQuestions = Array.isArray(data.openQuestions) ? data.openQuestions : [];

  if (summary.length < 80 || whyItMatters.length < 35) return false;
  if (keyPoints.length < 2 || keyPoints.length > 4) return false;
  if (openQuestions.length < 1 || openQuestions.length > 3) return false;

  const validPoints = keyPoints.every((item) => {
    if (!item || typeof item !== "object") return false;
    const point = cleanString((item as Record<string, unknown>).point, 280);
    const evidence = cleanString((item as Record<string, unknown>).evidence, 180);
    return point.length >= 24 && hasSourceEvidence(sourceText, evidence);
  });

  const validQuestions = openQuestions.every((item) =>
    typeof item === "string" && cleanString(item, 240).length >= 12
  );

  return validPoints && validQuestions;
}

export async function createEditorialBriefing(
  input: EditorialInput
): Promise<EditorialBriefing | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const sourceText = cleanString(input.sourceText, 12000);
  // Very short RSS fragments are not enough evidence for an original briefing.
  if (sourceText.length < 900 || !input.publisherUrl.startsWith("https://")) {
    return null;
  }

  const model = cleanString(process.env.GEMINI_MODEL, 80) || "gemini-3.8-flash";
  const prompt = [
    "You are the careful research editor for NeuroWire News.",
    "Create a useful, original editorial briefing from ONLY the supplied publisher RSS text.",
    "Do not use outside knowledge, browsing, assumptions, forecasts, invented context, invented numbers, invented quotes, or claims not directly supported by the supplied text.",
    "Do not rewrite the source paragraph sentence by sentence. Explain the central development clearly and distinguish confirmed details from what the source does not establish.",
    "Keep the supplied headline, publisher name, category and publication date unchanged; they are metadata, not facts to embellish.",
    "Return only valid JSON with these exact keys: summary, keyPoints, whyItMatters, openQuestions.",
    "summary: 2 to 4 clear sentences in plain English, written freshly, explaining what the publisher text actually reports.",
    "keyPoints: 2 to 4 objects, each with point and evidence. Each evidence value must be an exact, contiguous 5-to-14-word excerpt copied verbatim from the supplied source text. Keep excerpts short.",
    "whyItMatters: a cautious explanation only where the source text supports it. If the source gives too little context, say that clearly instead of guessing.",
    "openQuestions: 1 to 3 important details the supplied text does not answer. Phrase them as unknowns, not speculation.",
    "Avoid promotional language, dramatic claims, SEO keyword stuffing, and repetitive filler.",
  ].join("\n");

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(model) + ":generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: prompt }] },
          contents: [{
            role: "user",
            parts: [{
              text: [
                "Headline: " + input.title,
                "Category: " + input.category,
                "Publisher: " + input.publisher,
                "Publisher publication date: " + input.publishedAt,
                "Original publisher URL: " + input.publisherUrl,
                "",
                "SOURCE TEXT (the only factual source you may use):",
                sourceText,
              ].join("\n"),
            }],
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1100,
            responseMimeType: "application/json",
          },
        }),
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!response.ok) {
      console.warn("Gemini editorial briefing unavailable:", response.status);
      return null;
    }

    const payload = await response.json() as GeminiGenerateResponse;
    const rawText = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n")
      .trim();

    if (!rawText) return null;

    const parsed: unknown = JSON.parse(rawText);
    if (!isBriefingShape(parsed, sourceText)) {
      console.warn("Gemini editorial briefing failed source-evidence validation.");
      return null;
    }

    return {
      summary: cleanString(parsed.summary, 900),
      keyPoints: parsed.keyPoints.map((item) => ({
        point: cleanString(item.point, 280),
        evidence: cleanString(item.evidence, 180),
      })),
      whyItMatters: cleanString(parsed.whyItMatters, 600),
      openQuestions: parsed.openQuestions.map((item) => cleanString(item, 240)),
    };
  } catch (error) {
    console.warn(
      "Gemini editorial briefing failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return null;
  }
}

export function formatEditorialBriefing(
  briefing: EditorialBriefing,
  publisherUrl: string
): string {
  const keyPoints = briefing.keyPoints
    .map((item) => "- " + item.point + "\n  Evidence from source: “" + item.evidence + "”")
    .join("\n");
  const openQuestions = briefing.openQuestions
    .map((item) => "- " + item)
    .join("\n");

  return [
    "NEUROWIRE_EDITORIAL_BRIEF_V1",
    "",
    "## What happened",
    briefing.summary,
    "",
    "## Key details",
    keyPoints,
    "",
    "## Why it matters",
    briefing.whyItMatters,
    "",
    "## What the source does not tell us",
    openQuestions,
    "",
    "## Editorial note",
    "AI-assisted briefing based only on the publisher text supplied to NeuroWire. Evidence excerpts are shown for transparency. This is not an independent investigation or a substitute for the original report.",
    "",
    "ORIGINAL_SOURCE_URL: " + publisherUrl,
  ].join("\n");
}

export function formatSourceExcerpt(sourceText: string, publisherUrl: string): string {
  const words = sourceText.trim().split(/\s+/).filter(Boolean);
  const excerpt = words.slice(0, 100).join(" ");
  return [
    "NEUROWIRE_SOURCE_EXCERPT_V1",
    "",
    excerpt,
    "",
    "This story is shown as a publisher excerpt because there was not enough source detail to create a source-evidence-checked NeuroWire briefing.",
    "",
    "ORIGINAL_SOURCE_URL: " + publisherUrl,
  ].join("\n");
}
