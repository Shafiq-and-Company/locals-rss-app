export const PRIORITY_KEYWORDS: string[] = [
  "gaming business",
  "game industry",
  "games industry",
  "video game industry",
  "industry report",
  "market report",
  "market analysis",
  "market forecast",
  "market share",
  "growth forecast",
  "studio acquisition",
  "publisher acquisition",
  "strategic partnership",
  "publishing deal",
  "licensing agreement",
  "distribution deal",
  "venture capital",
  "funding round",
  "seed round",
  "series a",
  "series b",
  "private equity",
  "initial public offering",
  "esports business",
  "esports industry",
  "esports organization",
  "esports organisations",
  "esports team",
  "franchise league",
  "media rights",
  "broadcast rights",
  "sponsorship deal",
  "player transfer",
  "roster move",
];

const SUPPORTING_KEYWORDS: string[] = [
  "merger",
  "acquisition",
  "invests",
  "investment",
  "funding",
  "financing",
  "capital raise",
  "minority stake",
  "majority stake",
  "valuation",
  "financial results",
  "quarterly earnings",
  "earnings report",
  "earnings call",
  "revenue",
  "profit",
  "loss",
  "guidance",
  "expansion",
  "restructuring",
  "layoffs",
  "headcount",
  "hiring",
  "partnership",
  "sponsorship",
  "media rights",
  "broadcast deal",
  "licensing",
  "brand deal",
  "franchise",
  "player signing",
  "coaching staff",
  "transfer window",
];

const normalizedKeywords = PRIORITY_KEYWORDS.map((keyword) =>
  keyword.toLowerCase(),
);

const supportingKeywords = SUPPORTING_KEYWORDS.map((keyword) =>
  keyword.toLowerCase(),
);

export function getKeywordPriorityScore(text: string | undefined): number {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let score = 0;

  normalizedKeywords.forEach((keyword, index) => {
    if (matchesKeyword(lower, keyword)) {
      score += normalizedKeywords.length - index;
    }
  });

  supportingKeywords.forEach((keyword) => {
    if (matchesKeyword(lower, keyword)) {
      score += 5;
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

function matchesKeyword(text: string, keyword: string): boolean {
  if (keyword.includes(" ")) {
    return text.includes(keyword);
  }

  const pattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`);
  return pattern.test(text);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
