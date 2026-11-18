export type NewsCategory = "AI" | "Crypto" | "Policy" | "Technology" | "Fox News" | "Leadership";

export type NewsFeed = {
  rssUrl: string;
  publisher: string;
  category: Exclude<NewsCategory, "Fox News">;
  allowedHosts: string[];
  titleKeywords?: string[];
};

export const NEWS_FEEDS: NewsFeed[] = [
  {
    rssUrl: "https://openai.com/news/rss.xml",
    publisher: "OpenAI",
    category: "AI",
    allowedHosts: ["openai.com"],
  },
  {
    rssUrl: "https://deepmind.google/blog/rss.xml",
    publisher: "Google DeepMind",
    category: "AI",
    allowedHosts: ["deepmind.google"],
  },
  {
    rssUrl: "https://blog.google/innovation-and-ai/technology/ai/rss/",
    publisher: "Google",
    category: "AI",
    allowedHosts: ["blog.google"],
  },
  {
    rssUrl: "https://news.microsoft.com/source/topics/ai/feed/",
    publisher: "Microsoft",
    category: "AI",
    allowedHosts: ["news.microsoft.com"],
  },
  {
    rssUrl: "https://www.sec.gov/news/pressreleases.rss",
    publisher: "U.S. Securities and Exchange Commission",
    category: "Crypto",
    allowedHosts: ["sec.gov"],
    titleKeywords: ["crypto", "bitcoin", "ethereum", "digital asset", "tokenized", "tokenization", "blockchain", "stablecoin"],
  },
  {
    rssUrl: "https://www.ftc.gov/feeds/press-release-competition.xml",
    publisher: "U.S. Federal Trade Commission",
    category: "Policy",
    allowedHosts: ["ftc.gov"],
    titleKeywords: ["competition", "privacy", "data", "technology", "platform", "digital", "software", "online", "artificial intelligence", "antitrust"],
  },
  {
    rssUrl: "https://www.nasa.gov/feed/",
    publisher: "NASA",
    category: "Technology",
    allowedHosts: ["nasa.gov"],
    titleKeywords: ["technology", "robot", "computing", "spacecraft", "satellite", "artificial intelligence", "machine learning", "engineering", "software", "chip", "innovation"],
  },
  {
    rssUrl: "https://news.microsoft.com/source/feed/",
    publisher: "Microsoft",
    category: "Technology",
    allowedHosts: ["news.microsoft.com"],
    titleKeywords: ["technology", "software", "windows", "security", "chip", "computer", "cloud", "data", "cybersecurity", "artificial intelligence"],
  },
  {
    rssUrl: "https://blog.google/rss/",
    publisher: "Google",
    category: "Leadership",
    allowedHosts: ["blog.google"],
    titleKeywords: ["chief", "ceo", "executive", "leadership", "appointed", "appointment", "president", "founder", "board"],
  },
  {
    rssUrl: "https://news.microsoft.com/source/feed/",
    publisher: "Microsoft",
    category: "Leadership",
    allowedHosts: ["news.microsoft.com"],
    titleKeywords: ["chief", "ceo", "executive", "leadership", "appointed", "appointment", "president", "founder", "board"],
  },
];

export function rssToJsonUrl(rssUrl: string): string {
  return "https://api.rss2json.com/v1/api.json?rss_url=" + encodeURIComponent(rssUrl);
}

export function cleanHeadline(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseFeedDate(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function safePublisherUrl(value: unknown, allowedHosts: string[]): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const parsed = new URL(value.trim());
    const host = parsed.hostname.toLocaleLowerCase();
    const hostAllowed = allowedHosts.some((domain) => host === domain || host.endsWith("." + domain));
    const hasUnsafeAuthority = Boolean(parsed.username || parsed.password || (parsed.port && parsed.port !== "443"));

    if (parsed.protocol !== "https:" || !hostAllowed || hasUnsafeAuthority) return "";

    // Fragments are not sent to the publisher and can carry misleading client-side text.
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "";
  }
}

export function headlineMatchesFeed(title: string, feed: NewsFeed): boolean {
  if (!feed.titleKeywords?.length) return true;
  const normalizedTitle = title.toLocaleLowerCase();
  return feed.titleKeywords.some((keyword) => normalizedTitle.includes(keyword));
}

export function normalizeHeadline(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
