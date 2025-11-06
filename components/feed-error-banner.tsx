"use client";

import type { FeedWithError } from "@/lib/rss";

type FeedErrorBannerProps = {
  errors: FeedWithError[];
  className?: string;
};

export function FeedErrorBanner({
  errors,
  className,
}: FeedErrorBannerProps) {
  if (errors.length === 0) return null;

  const containerClassName = [
    "mb-8 rounded-xl border border-[color:var(--outline)] bg-[color:var(--surface)] p-4 text-sm text-[color:var(--foreground)]",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={containerClassName}>
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
