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
  let order = 0;
  const decorated = feeds.flatMap((feed) =>
    feed.items.map((item) => {
      const timestamp = item.publishedAt
        ? new Date(item.publishedAt).getTime()
        : 0;

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
      };
    }),
  );

  const sortedStories = decorated
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      if (b.timestamp !== a.timestamp) {
        return b.timestamp - a.timestamp;
      }
      return a.order - b.order;
    })
    .map((item) => item.story);

  return sortedStories;
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
