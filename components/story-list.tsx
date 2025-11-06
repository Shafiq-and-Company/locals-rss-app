"use client";

import { useMemo, useState } from "react";
import { FeedErrorBanner } from "@/components/feed-error-banner";
import { StoryCard, type StoryCardData } from "@/components/story-card";
import type { FeedWithError } from "@/lib/rss";
import { sortStoriesByPriority } from "@/lib/story-builder";
import { groupStoriesByDate } from "@/lib/utils";
import type { StoryBatchResult } from "@/lib/story-loader";

type LoadMoreAction = (input: { cursor: number }) => Promise<StoryBatchResult>;

type StoryListProps = {
  initialStories: StoryCardData[];
  initialCursor: number;
  hasMoreFeeds: boolean;
  totalFeeds: number;
  loadMoreAction: LoadMoreAction;
  initialErrors?: FeedWithError[];
};

export function StoryList({
  initialStories,
  initialCursor,
  hasMoreFeeds,
  totalFeeds,
  loadMoreAction,
  initialErrors,
}: StoryListProps) {
  const [stories, setStories] = useState<StoryCardData[]>(
    sortStoriesByPriority(initialStories),
  );
  const [cursor, setCursor] = useState(initialCursor);
  const [hasMore, setHasMore] = useState(hasMoreFeeds);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FeedWithError[]>(initialErrors ?? []);
  const [loadedFeedCount, setLoadedFeedCount] = useState(initialCursor);

  const grouped = useMemo(() => groupStoriesByDate(stories), [stories]);

  async function handleLoadMore() {
    if (!hasMore || isLoading) return;
    setIsLoading(true);
    setLoadError(null);

    try {
      const result = await loadMoreAction({ cursor });

      if (result.stories.length > 0) {
        setStories((current) => {
          const merged = new Map(
            current.map((story) => [storyKey(story), story]),
          );

          for (const story of result.stories) {
            merged.set(storyKey(story), story);
          }

          return sortStoriesByPriority(Array.from(merged.values()));
        });
      }

      if (result.errors.length > 0) {
        setErrors((current) => mergeFeedErrors(current, result.errors));
      }

      setCursor(result.nextCursor);
      setHasMore(result.hasMoreFeeds);
      setLoadedFeedCount(result.nextCursor);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load additional stories. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (stories.length === 0) {
    return (
      <div className="mt-8 flex flex-col gap-6">
        <FeedErrorBanner errors={errors} />
        <p className="rounded-xl border border-[color:var(--outline)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--muted)]">
          No stories available yet. Try adding new feeds in{" "}
          <code className="rounded bg-[color:var(--code-background)] px-1.5 py-1 text-xs text-[color:var(--code-foreground)]">
            lib/feeds.ts
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <FeedErrorBanner errors={errors} />

      <div className="flex flex-col gap-2 text-center text-xs uppercase tracking-[0.2em] text-[color:var(--muted)] sm:text-left">
        <span>
          Tracking {stories.length} stories from {loadedFeedCount} of {totalFeeds} feeds
        </span>
        {!hasMore ? (
          <span>All feeds processed</span>
        ) : null}
      </div>

      <div className="flex flex-col gap-10">
        {grouped.map((group) => (
          <section key={group.date.toISOString()} className="flex flex-col gap-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              {formatGroupDate(group.date)}
            </h2>
            <div className="flex flex-col gap-6">
              {group.stories.map((story) => (
                <StoryCard key={`${story.feedId}-${story.id}`} story={story} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 py-4">
        {loadError ? (
          <p className="text-xs text-[color:var(--error, var(--accent))]">
            {loadError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleLoadMore}
          disabled={!hasMore || isLoading}
          className="w-full rounded-full border border-[color:var(--outline)] bg-[color:var(--surface)] px-6 py-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isLoading ? "Loading…" : hasMore ? "Load more" : "All feeds loaded"}
        </button>
      </div>
    </div>
  );
}

function formatGroupDate(date: Date) {
  if (date.getTime() === 0) return "Undated";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function storyKey(story: StoryCardData): string {
  return `${story.feedId}-${story.id}`;
}

function mergeFeedErrors(
  existing: FeedWithError[],
  incoming: FeedWithError[],
): FeedWithError[] {
  const merged = new Map(existing.map((item) => [item.config.id, item]));

  for (const error of incoming) {
    merged.set(error.config.id, error);
  }

  return Array.from(merged.values());
}
