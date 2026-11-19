export type SavedReaderStory = {
  title: string;
  category: string;
  source: string;
  publishedAt: string;
  image: string;
  publisherUrl: string;
  summary: string;
  savedAt: string;
};

export type SavedReaderStoryInput = Omit<SavedReaderStory, "savedAt">;

export type SavedReaderStoryUpdate = {
  stories: SavedReaderStory[];
  saved: boolean;
  persisted: boolean;
};

const STORAGE_KEY = "neurowire_saved_stories_v1";
const MAX_SAVED_STORIES = 100;

function safeHttpsUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function isSavedReaderStory(value: unknown): value is SavedReaderStory {
  if (!value || typeof value !== "object") return false;
  const story = value as Record<string, unknown>;
  return (
    typeof story.title === "string" &&
    story.title.trim().length > 0 &&
    typeof story.category === "string" &&
    typeof story.source === "string" &&
    typeof story.publishedAt === "string" &&
    typeof story.image === "string" &&
    typeof story.publisherUrl === "string" &&
    typeof story.summary === "string" &&
    typeof story.savedAt === "string"
  );
}

export function readSavedStories(): SavedReaderStory[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(isSavedReaderStory)
      .slice(0, MAX_SAVED_STORIES);
  } catch {
    return [];
  }
}

export function toggleSavedStory(input: SavedReaderStoryInput): SavedReaderStoryUpdate {
  const current = readSavedStories();
  const title = input.title.trim();
  if (!title || typeof window === "undefined") {
    return { stories: current, saved: false, persisted: false };
  }

  const normalizedTitle = title.toLocaleLowerCase();
  const alreadySaved = current.some(
    (story) => story.title.trim().toLocaleLowerCase() === normalizedTitle
  );
  const next = alreadySaved
    ? current.filter(
        (story) => story.title.trim().toLocaleLowerCase() !== normalizedTitle
      )
    : [
        {
          title: title.slice(0, 180),
          category: input.category.slice(0, 60),
          source: input.source.slice(0, 120),
          publishedAt: input.publishedAt.slice(0, 80),
          image: safeHttpsUrl(input.image),
          publisherUrl: safeHttpsUrl(input.publisherUrl),
          summary: input.summary.slice(0, 1000),
          savedAt: new Date().toISOString(),
        },
        ...current,
      ].slice(0, MAX_SAVED_STORIES);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return { stories: next, saved: !alreadySaved, persisted: true };
  } catch {
    return { stories: current, saved: alreadySaved, persisted: false };
  }
}
