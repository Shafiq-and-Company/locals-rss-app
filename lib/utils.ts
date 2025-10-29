import type { StoryCardData } from "@/components/story-card";

export function isSameDay(dateA: Date, dateB: Date): boolean {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export function getStoryDate(story: StoryCardData): Date | undefined {
  if (!story.publishedAt) return undefined;
  const date = new Date(story.publishedAt);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

export type GroupedStories = Array<{
  date: Date;
  stories: StoryCardData[];
}>;

export function groupStoriesByDate(stories: StoryCardData[]): GroupedStories {
  const groups = new Map<string, { date: Date; stories: StoryCardData[] }>();

  for (const story of stories) {
    const date = getStoryDate(story);
    const key = date
      ? date.toISOString().slice(0, 10)
      : "undated";

    if (!groups.has(key)) {
      groups.set(key, {
        date: date ?? new Date(0),
        stories: [],
      });
    }

    groups.get(key)!.stories.push(story);
  }

  const sorted = Array.from(groups.values()).sort((a, b) => {
    if (a.date.getTime() === b.date.getTime()) {
      return 0;
    }
    return b.date.getTime() - a.date.getTime();
  });

  // Ensure undated stories appear at the end
  const undatedIndex = sorted.findIndex((group) => group.date.getTime() === 0);
  if (undatedIndex > -1) {
    const [undatedGroup] = sorted.splice(undatedIndex, 1);
    sorted.push(undatedGroup);
  }

  return sorted;
}
