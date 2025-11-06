"use server";

import {
  SUBSEQUENT_FEED_BATCH_SIZE,
  SUBSEQUENT_STORY_LIMIT,
} from "@/lib/story-config";
import { loadStoryBatch } from "@/lib/story-loader";

export type LoadMoreStoriesInput = {
  cursor: number;
};

export async function loadMoreStoriesAction({
  cursor,
}: LoadMoreStoriesInput) {
  return loadStoryBatch({
    cursor,
    feedBatchSize: SUBSEQUENT_FEED_BATCH_SIZE,
    storyLimit: SUBSEQUENT_STORY_LIMIT,
  });
}
