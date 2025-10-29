"use client";

import { useState } from "react";
import { StoryCard, type StoryCardData } from "@/components/story-card";
import { groupStoriesByDate } from "@/lib/utils";

type StoryListProps = {
  stories: StoryCardData[];
  batchSize?: number;
};

const DEFAULT_BATCH_SIZE = 50;

export function StoryList({ stories, batchSize }: StoryListProps) {
  const pageSize = batchSize ?? DEFAULT_BATCH_SIZE;
  const [visibleCount, setVisibleCount] = useState(pageSize);

  const visibleStories = stories.slice(0, visibleCount);
  const hasMore = visibleCount < stories.length;
  const grouped = groupStoriesByDate(visibleStories);

  if (stories.length === 0) {
    return (
      <p className="rounded-xl border border-[color:var(--outline)] bg-[color:var(--surface)] p-6 text-sm text-[color:var(--muted)]">
        No stories available yet. Try adding new feeds in{" "}
        <code className="rounded bg-[color:var(--code-background)] px-1.5 py-1 text-xs text-[color:var(--code-foreground)]">
          lib/feeds.ts
        </code>
        .
      </p>
    );
  }

  return (
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

      <div className="flex justify-center py-4">
        <button
          type="button"
          onClick={() => {
            if (!hasMore) return;
            setVisibleCount((count) => count + pageSize);
          }}
          disabled={!hasMore}
          className="rounded-full border border-[color:var(--outline)] bg-[color:var(--surface)] px-6 py-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Load more
        </button>
      </div>

      {!hasMore ? (
        <p className="pb-4 text-center text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
          All stories loaded
        </p>
      ) : null}
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
