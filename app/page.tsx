import { SiteHeader } from "@/components/site-header";
import { StoryList } from "@/components/story-list";
import type { StoryCardData } from "@/components/story-card";
import { getAllFeeds } from "@/lib/feeds";
import { getStoryPriorityScore } from "@/lib/priorities";
import {
  fetchFeeds,
  isFeedError,
  isNormalizedFeed,
  type FeedWithError,
  type NormalizedFeed,
} from "@/lib/rss";

const RESULTS_LIMIT = 20;

export default async function Home() {
  const feedConfigs = getAllFeeds();
  const feeds = await fetchFeeds(feedConfigs);
  const normalizedFeeds = feeds.filter(isNormalizedFeed);
  const stories = buildStoryList(normalizedFeeds);
  const feedErrors = feeds.filter(isFeedError);

  return (
    <div className="min-h-screen bg-[color:var(--background)] py-12 text-[color:var(--foreground)] transition-colors">
      <main className="w-full px-4 sm:px-8 lg:px-12">
        <SiteHeader title="Locals.GG RSS" />

        {feedErrors.length > 0 ? (
          <ErrorBanner errors={feedErrors} />
        ) : null}

        <StoryList stories={stories} />
      </main>
    </div>
  );
}

function buildStoryList(feeds: NormalizedFeed[]) {
  const now = Date.now();
  let order = 0;
  type DecoratedStory = {
    story: StoryCardData;
    timestamp?: number;
    priorityScore: number;
    order: number;
    dayKey?: string;
  };

  const decorated: DecoratedStory[] = feeds.flatMap((feed) =>
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
        timestamp,
        priorityScore,
        order: order++,
        dayKey,
      };
    }),
  );

  const datedStories = decorated.filter(
    (item) => item.timestamp !== undefined && item.timestamp <= now,
  );

  const latestTimestamp = datedStories.reduce((max, item) => {
    return item.timestamp !== undefined && item.timestamp > max
      ? item.timestamp
      : max;
  }, 0);

  const latestDayKey =
    latestTimestamp > 0
      ? new Date(latestTimestamp).toISOString().slice(0, 10)
      : undefined;

  let filteredStories =
    latestDayKey !== undefined
      ? datedStories.filter((item) => item.dayKey === latestDayKey)
      : datedStories;

  if (filteredStories.length === 0) {
    filteredStories = decorated.filter(
      (item) => item.timestamp === undefined || item.timestamp <= now,
    );
  }

  const sortedStories = [...filteredStories]
    .sort((a, b) => {
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

  const keywordMatches = sortedStories.filter(
    (item) => item.priorityScore > 0,
  );
  const otherStories = sortedStories.filter(
    (item) => item.priorityScore <= 0,
  );

  return keywordMatches
    .concat(otherStories)
    .slice(0, RESULTS_LIMIT)
    .map((item) => item.story);
}

function ErrorBanner({ errors }: { errors: FeedWithError[] }) {
  return (
    <section className="mb-8 rounded-xl border border-[color:var(--outline)] bg-[color:var(--surface)] p-4 text-sm text-[color:var(--foreground)]">
      <h2 className="text-base font-semibold text-[color:var(--foreground)]">
        Issues loading feeds
      </h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-[color:var(--muted)]">
        {errors.map((feed) => (
          <li key={feed.config.id}>
            <span className="font-medium text-[color:var(--foreground)]">
              {feed.config.title}:
            </span>{" "}
            {feed.error}
          </li>
        ))}
      </ul>
    </section>
  );
}
