import { StoryList } from "@/components/story-list";
import { SiteHeader } from "@/components/site-header";
import { loadMoreStoriesAction } from "@/app/actions/load-more-stories";
import { getAllFeeds } from "@/lib/feeds";
import {
  INITIAL_FEED_BATCH_SIZE,
  INITIAL_STORY_LIMIT,
} from "@/lib/story-config";
import { loadStoryBatch } from "@/lib/story-loader";

export default async function Home() {
  const feedConfigs = await getAllFeeds();
  const totalFeeds = feedConfigs.length;

  const initialBatch = await loadStoryBatch({
    cursor: 0,
    feedBatchSize: INITIAL_FEED_BATCH_SIZE,
    storyLimit: INITIAL_STORY_LIMIT,
    feeds: feedConfigs,
  });

  return (
    <div className="min-h-screen bg-[color:var(--background)] py-12 text-[color:var(--foreground)] transition-colors">
      <main className="w-full px-4 sm:px-8 lg:px-12">
        <SiteHeader title="Locals.GG RSS" />

        <StoryList
          initialStories={initialBatch.stories}
          initialCursor={initialBatch.nextCursor}
          hasMoreFeeds={initialBatch.hasMoreFeeds}
          totalFeeds={totalFeeds}
          loadMoreAction={loadMoreStoriesAction}
          initialErrors={initialBatch.errors}
        />
      </main>
    </div>
  );
}
