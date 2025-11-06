import Parser from "rss-parser";
import type { FeedConfig } from "./feeds";

export type FeedItem = {
  id: string;
  title: string;
  link: string;
  publishedAt?: string;
  author?: string;
  summary?: string;
};

export type NormalizedFeed = {
  config: FeedConfig;
  feedTitle: string;
  feedDescription?: string;
  lastUpdated?: string;
  items: FeedItem[];
};

export type FeedWithError = {
  config: FeedConfig;
  error: string;
};

type LoadedFeed = NormalizedFeed | FeedWithError;

const parser = new Parser({
  customFields: {
    item: ["contentSnippet", "content", "summary"],
  },
});

const DEFAULT_LIMIT = 15;
const REQUEST_HEADERS = {
  Accept:
    "application/rss+xml, application/atom+xml;q=0.9, text/xml;q=0.8, */*;q=0.5",
  "User-Agent": "LocalsGG RSS Reader (https://locals.gg)",
};

async function loadFeedXml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    next: {
      revalidate: 300,
    },
  });

  if (!response.ok) {
    throw new Error(`Feed responded with HTTP ${response.status}`);
  }

  return response.text();
}

export async function fetchFeed(config: FeedConfig): Promise<LoadedFeed> {
  try {
    const xml = await loadFeedXml(config.url);
    const feed = await parser.parseString(xml);

    const items: FeedItem[] = (feed.items ?? []).map((rawItem, index) => {
      const item = rawItem as Parser.Item & {
        id?: string;
        summary?: string;
        content?: string;
        contentSnippet?: string;
        author?: string;
        creator?: string;
      };

      return {
        id:
          item.guid ??
          item.id ??
          item.link ??
          `${config.id}-${item.title ?? index}`,
        title: item.title ?? "Untitled story",
        link: item.link ?? "#",
        publishedAt: item.isoDate ?? item.pubDate ?? undefined,
        author: item.creator ?? item.author ?? undefined,
        summary: item.summary ?? item.contentSnippet ?? item.content ?? undefined,
      };
    });

    const trimmedItems = items.slice(0, config.limit ?? DEFAULT_LIMIT);

    return {
      config,
      feedTitle: feed.title ?? config.title,
      feedDescription: feed.description ?? config.description,
      lastUpdated: feed.lastBuildDate ?? feed.pubDate ?? undefined,
      items: trimmedItems,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load feed.";
    return { config, error: message };
  }
}

export async function fetchFeeds(
  feeds: FeedConfig[],
): Promise<LoadedFeed[]> {
  return Promise.all(feeds.map((feed) => fetchFeed(feed)));
}

export function isFeedError(feed: LoadedFeed): feed is FeedWithError {
  return "error" in feed;
}

export function isNormalizedFeed(feed: LoadedFeed): feed is NormalizedFeed {
  return !isFeedError(feed);
}
