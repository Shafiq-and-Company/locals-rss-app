export const PRIORITY_KEYWORDS: string[] = [
  "gaming business",
  "gaming industry",
  "game industry",
  "games industry",
  "gaming market",
  "game market trends",
  "game industry report",
  "game industry analysis",
  "game industry growth",
  "video game business",
  "gaming revenue",
  "gaming investment",
  "gaming startups",
  "venture capital gaming",
  "game studio funding",
  "game studio acquisition",
  "studio acquisition",
  "publisher acquisition",
  "publisher investment",
  "game publisher",
  "game developer",
  "development studio",
  "development company",
  "game financing",
  "game monetization",
  "game production",
  "game distribution",
  "digital distribution",
  "game publishing deals",
  "gaming platform",
  "gaming analytics",
  "gaming infrastructure",
  "gaming economy",
  "gaming partnerships",
  "strategic partnership",
  "business expansion",
  "market expansion",
  "cloud gaming",
  "subscription service",
  "mobile gaming market",
  "console market",
  "pc gaming market",
  "indie game business",
  "metaverse gaming",
  "gaming hardware market",
  "esports business",
  "esports industry",
  "esports organization",
  "esports organizations",
  "esports team",
  "esports teams",
  "esports leagues",
  "franchise league",
  "esports tournaments",
  "esports ecosystem",
  "competitive gaming industry",
  "esports sponsorship",
  "esports sponsorship deals",
  "esports partnership",
  "esports media rights",
  "esports investment",
  "esports revenue",
  "esports organization acquisition",
];

const SUPPORTING_KEYWORDS: string[] = [
  "mergers and acquisitions",
  "merger",
  "acquisition",
  "investment",
  "funding",
  "funding round",
  "seed round",
  "series a",
  "series b",
  "venture capital",
  "capital raise",
  "financial results",
  "quarterly earnings",
  "earnings report",
  "earnings call",
  "fiscal year",
  "revenue",
  "profit",
  "losses",
  "guidance",
  "valuation",
  "ipo",
  "stock market",
  "shareholder",
  "partnership",
  "sponsorship",
  "licensing deal",
  "licensing agreement",
  "media rights",
  "brand deal",
  "strategic review",
  "restructuring",
  "expansion",
  "layoffs",
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
