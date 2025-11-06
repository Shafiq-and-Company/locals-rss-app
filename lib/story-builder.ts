import type { StoryCardData } from "@/components/story-card";
import { getStoryPriorityScore } from "@/lib/priorities";
import type { NormalizedFeed } from "@/lib/rss";

const DEFAULT_RESULT_LIMIT = 100;

type DecoratedStory = {
  story: StoryCardData;
  timestamp?: number;
  priorityScore: number;
  order: number;
  dayKey?: string;
};

type BuildStoryListOptions = {
  limit?: number;
  now?: number;
};

export function buildStoryList(
  feeds: NormalizedFeed[],
  options: BuildStoryListOptions = {},
): StoryCardData[] {
  const { limit = DEFAULT_RESULT_LIMIT, now = Date.now() } = options;

  const decorated = decorateStories(feeds, now);
  const { datedStories, undatedStories } = partitionStories(decorated, now);
  const latestDayStories = filterByLatestDay(datedStories);

  const candidates =
    latestDayStories.length > 0 ? latestDayStories : datedStories;

  const sorted = sortStories(
    candidates.length > 0 ? candidates : undatedStories,
  );

  const keywordMatches = sorted.filter((item) => item.priorityScore > 0);
  const otherStories = sorted.filter((item) => item.priorityScore <= 0);

  return keywordMatches
    .concat(otherStories)
    .map((item) => item.story)
    .slice(0, limit);
}

export function sortStoriesByPriority(
  stories: StoryCardData[],
  options: { now?: number } = {},
): StoryCardData[] {
  const now = options.now ?? Date.now();
  const decorated = decorateLooseStories(stories, now);
  const sorted = sortStories(decorated);

  const keywordMatches = sorted.filter((item) => item.priorityScore > 0);
  const otherStories = sorted.filter((item) => item.priorityScore <= 0);

  return keywordMatches
    .concat(otherStories)
    .map((item) => item.story);
}

function decorateStories(feeds: NormalizedFeed[], now: number): DecoratedStory[] {
  let order = 0;
  return feeds.flatMap((feed) =>
    feed.items.map((item) => {
      const rawTimestamp =
        item.publishedAt !== undefined ? Date.parse(item.publishedAt) : undefined;
      const hasValidTimestamp =
        typeof rawTimestamp === "number" && !Number.isNaN(rawTimestamp);
      const timestamp = hasValidTimestamp ? rawTimestamp : undefined;
      const dayKey =
        timestamp !== undefined
          ? new Date(timestamp).toISOString().slice(0, 10)
          : undefined;

      const story: StoryCardData = {
        ...item,
        feedId: feed.config.id,
        feedTitle: feed.feedTitle,
        feedUrl: feed.config.url,
      };

      const priorityScore = getStoryPriorityScore({
        title: story.title,
        summary: story.summary,
        feedTitle: story.feedTitle,
      });

      return {
        story,
        timestamp: timestamp !== undefined && timestamp <= now ? timestamp : undefined,
        priorityScore,
        order: order++,
        dayKey,
      };
    }),
  );
}

function decorateLooseStories(
  stories: StoryCardData[],
  now: number,
): DecoratedStory[] {
  let order = 0;
  return stories.map((story) => {
    const rawTimestamp =
      story.publishedAt !== undefined ? Date.parse(story.publishedAt) : undefined;
    const hasValidTimestamp =
      typeof rawTimestamp === "number" && !Number.isNaN(rawTimestamp);
    const timestamp =
      hasValidTimestamp && rawTimestamp !== undefined && rawTimestamp <= now
        ? rawTimestamp
        : undefined;
    const dayKey =
      timestamp !== undefined
        ? new Date(timestamp).toISOString().slice(0, 10)
        : undefined;

    const priorityScore = getStoryPriorityScore({
      title: story.title,
      summary: story.summary,
      feedTitle: story.feedTitle,
    });

    return {
      story,
      timestamp,
      priorityScore,
      order: order++,
      dayKey,
    };
  });
}

function partitionStories(decorated: DecoratedStory[], now: number) {
  const datedStories = decorated.filter(
    (item) => item.timestamp !== undefined && item.timestamp <= now,
  );

  const undatedStories = decorated.filter(
    (item) => item.timestamp === undefined || item.timestamp > now,
  );

  return { datedStories, undatedStories };
}

function filterByLatestDay(stories: DecoratedStory[]): DecoratedStory[] {
  const latestTimestamp = stories.reduce((max, item) => {
    return item.timestamp !== undefined && item.timestamp > max
      ? item.timestamp
      : max;
  }, 0);

  if (latestTimestamp === 0) return stories;

  const latestDayKey = new Date(latestTimestamp).toISOString().slice(0, 10);

  return stories.filter((item) => item.dayKey === latestDayKey);
}

function sortStories(stories: DecoratedStory[]): DecoratedStory[] {
  return [...stories].sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    const aTimestamp = a.timestamp ?? 0;
    const bTimestamp = b.timestamp ?? 0;
    if (bTimestamp !== aTimestamp) {
      return bTimestamp - aTimestamp;
    }
    return a.order - b.order;
  });
}
