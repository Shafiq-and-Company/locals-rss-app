import fs from "node:fs/promises";
import path from "node:path";

export type FeedConfig = {
  id: string;
  title: string;
  url: string;
  description?: string;
  limit?: number;
};

const FEEDS_FILE_PATH = path.join(process.cwd(), "data", "feeds.json");

async function readFeedsFile(): Promise<FeedConfig[]> {
  try {
    const contents = await fs.readFile(FEEDS_FILE_PATH, "utf8");
    const parsed = JSON.parse(contents) as FeedConfig[];
    return parsed.map((feed) => ({
      ...feed,
      limit: feed.limit ?? 12,
    }));
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return [];
    }
    throw error;
  }
}

async function writeFeedsFile(feeds: FeedConfig[]) {
  const serialized = JSON.stringify(feeds, null, 2);
  await fs.writeFile(`${FEEDS_FILE_PATH}`, `${serialized}\n`, "utf8");
}

export async function getAllFeeds(): Promise<FeedConfig[]> {
  return readFeedsFile();
}

export async function updateFeedUrl(
  id: string,
  url: string,
): Promise<FeedConfig> {
  const feeds = await readFeedsFile();
  const index = feeds.findIndex((feed) => feed.id === id);
  if (index === -1) {
    throw new Error(`Feed with id "${id}" not found.`);
  }

  feeds[index] = {
    ...feeds[index],
    url,
  };

  await writeFeedsFile(feeds);
  return feeds[index];
}
