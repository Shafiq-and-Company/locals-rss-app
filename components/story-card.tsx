import Link from "next/link";
import type { FeedItem } from "@/lib/rss";

export type StoryCardData = FeedItem & {
  feedId: string;
  feedTitle: string;
  feedUrl: string;
};

type StoryCardProps = {
  story: StoryCardData;
};

export function StoryCard({ story }: StoryCardProps) {
  const publishedLabel = formatDate(story.publishedAt);

  return (
    <article className="rounded-xl border border-[color:var(--outline)] bg-[color:var(--surface)] p-6 transition hover:bg-[color:var(--surface-hover)]">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[color:var(--muted)]">
        <span className="text-xs font-semibold uppercase tracking-wide">
          {story.feedTitle}
        </span>
        <Link
          href={story.feedUrl}
          className="text-xs font-semibold uppercase tracking-wide text-[color:var(--accent)] hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          Visit feed
        </Link>
      </header>
      <Link
        href={story.link}
        className="text-xl font-semibold leading-7 text-[color:var(--foreground)] hover:underline"
        target="_blank"
        rel="noreferrer"
      >
        {story.title}
      </Link>
      {story.summary ? (
        <div className="mt-3 space-y-3 text-sm leading-6 text-[color:var(--muted)]">
          {story.summary
            .split(/\n+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
        </div>
      ) : null}
      <footer className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[color:var(--muted)]">
        {story.author ? <span>By {story.author}</span> : null}
        {publishedLabel ? <span>{publishedLabel}</span> : null}
      </footer>
    </article>
  );
}

function formatDate(dateInput?: string) {
  if (!dateInput) return undefined;
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
