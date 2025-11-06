import type { StoryCardData } from "@/components/story-card";
import type { FeedConfig } from "@/lib/feeds";
import { getAllFeeds } from "@/lib/feeds";
import { buildStoryList } from "@/lib/story-builder";
import {
  fetchFeeds,
  isFeedError,
  isNormalizedFeed,
  type FeedWithError,
} from "@/lib/rss";

export type StoryBatchResult = {
  stories: StoryCardData[];
  nextCursor: number;
  hasMoreFeeds: boolean;
  errors: FeedWithError[];
};

export async function loadStoryBatch({
  cursor,
  feedBatchSize,
  storyLimit,
  feeds: providedFeeds,
}: {
  cursor: number;
  feedBatchSize: number;
  storyLimit: number;
  feeds?: FeedConfig[];
}): Promise<StoryBatchResult> {
  const feeds = providedFeeds ?? (await getAllFeeds());
  const slice = feeds.slice(cursor, cursor + feedBatchSize);

  if (slice.length === 0) {
    return {
      stories: [],
      nextCursor: cursor,
      hasMoreFeeds: false,
      errors: [],
    };
  }

  const loadedFeeds = await fetchFeeds(slice);
  const normalized = loadedFeeds.filter(isNormalizedFeed);
  const errors = loadedFeeds.filter(isFeedError);

  const stories = buildStoryList(normalized, { limit: storyLimit });
  const nextCursor = cursor + slice.length;
  const hasMoreFeeds = nextCursor < feeds.length;

  return {
    stories,
    nextCursor,
    hasMoreFeeds,
    errors,
  };
}
