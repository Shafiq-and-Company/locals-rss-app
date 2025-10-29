export const PRIORITY_KEYWORDS: string[] = [
  "gaming industry",
  "video game business",
  "game development",
  "game studios",
  "publisher acquisition",
  "gaming acquisitions",
  "mergers and acquisitions",
  "esports organizations",
  "esports business",
  "gaming market",
  "game market trends",
  "gaming investment",
  "gaming startups",
  "venture capital gaming",
  "game publisher",
  "game developer",
  "gaming company",
  "gaming industry growth",
  "esports sponsorship",
  "esports tournaments",
  "game monetization",
  "gaming economy",
  "mobile gaming market",
  "console market",
  "pc gaming market",
  "gaming analytics",
  "game streaming",
  "gaming revenue",
  "esports teams",
  "esports leagues",
  "gaming partnerships",
  "game studio funding",
  "esports investment",
  "gaming ipo",
  "gaming stocks",
  "game marketing",
  "game publishing deals",
  "gaming platform",
  "cloud gaming",
  "game distribution",
  "gaming mergers",
  "esports media rights",
  "esports sponsorship deals",
  "game industry report",
  "gaming innovation",
  "indie game business",
  "gaming hardware market",
  "metaverse gaming",
  "game production",
  "gaming industry analysis",
  "esports organization acquisition",
  "game dev funding",
  "esports ecosystem",
  "competitive gaming industry",
];

const normalizedKeywords = PRIORITY_KEYWORDS.map((keyword) =>
  keyword.toLowerCase(),
);

export function getKeywordPriorityScore(text: string | undefined): number {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let score = 0;

  normalizedKeywords.forEach((keyword, index) => {
    if (lower.includes(keyword)) {
      score += normalizedKeywords.length - index;
    }
  });

  return score;
}

export function getStoryPriorityScore({
  title,
  summary,
  feedTitle,
}: {
  title?: string | null;
  summary?: string | null;
  feedTitle?: string | null;
}): number {
  const titleScore = getKeywordPriorityScore(title ?? undefined) * 3;
  const summaryScore = getKeywordPriorityScore(summary ?? undefined) * 2;
  const feedScore = getKeywordPriorityScore(feedTitle ?? undefined);
  return titleScore + summaryScore + feedScore;
}
