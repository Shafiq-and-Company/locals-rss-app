## Game & Esports RSS

This project is a modular RSS dashboard built with the Next.js App Router. It fetches and normalizes multiple gaming and esports outlets, presenting them in a single scrollable list with a crisp black-and-white aesthetic so you can scan the latest headlines at a glance.

### Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Managing feeds

Feeds are defined in `lib/feeds.ts`. Each feed entry accepts:

- `id`: unique identifier used for keys and fallback IDs.
- `title`: display name for the feed tile.
- `url`: RSS/Atom endpoint.
- `description` *(optional)*: short blurb shown under the title.
- `limit` *(optional)*: number of posts to show per feed (defaults to 15).

Add, remove, or reorder entries in that array to control the dashboard. No other files need to change.

### Prioritizing keywords

Update `lib/priorities.ts` to change the list of keywords that receive a higher weighting. Stories whose titles or summaries contain those phrases float to the top of the feed, followed by the most recent items. The interface shows 50 stories at a time—tap **Load more** at the bottom to reveal the next batch.

### How it works

- `lib/rss.ts` handles parsing and normalizing RSS items using `rss-parser`.
- `components/story-card.tsx` renders individual story cards with source context.
- `app/page.tsx` loads all configured feeds on the server, merges them into a single ordered stream, and renders the list.

- The site header shows the current time and a theme toggle that flips the palette between high-contrast light and dark modes.

Feel free to extend the UI with filters, search, or persistence once you decide which games, leagues, or creators you want to highlight.
