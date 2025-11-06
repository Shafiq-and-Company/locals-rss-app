import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { updateFeedUrlAction } from "@/app/actions/update-feed-url";
import { getAllFeeds, type FeedConfig } from "@/lib/feeds";
import { fetchFeeds, isNormalizedFeed } from "@/lib/rss";

type SourceStatus =
  | {
      type: "ok";
      id: string;
      title: string;
      feedUrl: string;
      description?: string;
      lastUpdated?: string;
      itemCount: number;
    }
  | {
      type: "error";
      id: string;
      title: string;
      feedUrl: string;
      description?: string;
      message: string;
    };

type SourcesPageProps = {
  searchParams?: Record<string, string | string[]>;
};

export default async function SourcesPage({ searchParams }: SourcesPageProps) {
  const feedConfigs = await getAllFeeds();
  const results = await fetchFeeds(feedConfigs);

  const statuses: SourceStatus[] = results.map((result) => {
    if (isNormalizedFeed(result)) {
      return {
        type: "ok",
        id: result.config.id,
        title: result.config.title,
        feedUrl: result.config.url,
        description: result.config.description,
        lastUpdated: result.lastUpdated,
        itemCount: result.items.length,
      };
    }

    return {
      type: "error",
      id: result.config.id,
      title: result.config.title,
      feedUrl: result.config.url,
      description: result.config.description,
      message: result.error,
    };
  });

  const healthyCount = statuses.filter((status) => status.type === "ok").length;
  const updatedId =
    typeof searchParams?.updated === "string" ? searchParams.updated : undefined;
  const errorMessage =
    typeof searchParams?.error === "string" ? searchParams.error : undefined;

  const successFeed =
    updatedId !== undefined
      ? feedConfigs.find((feed) => feed.id === updatedId)
      : undefined;
  const successMessage =
    successFeed !== undefined
      ? `Updated ${successFeed.title}`
      : updatedId !== undefined
        ? "Feed updated successfully"
        : undefined;

  return (
    <div className="min-h-screen bg-[color:var(--background)] py-12 text-[color:var(--foreground)] transition-colors">
      <main className="w-full px-4 sm:px-8 lg:px-12">
        <SiteHeader title="Source Health" />

        <section className="flex flex-col gap-6">
          <p className="rounded-xl border border-[color:var(--outline)] bg-[color:var(--surface)] p-4 text-sm text-[color:var(--muted)] sm:text-base">
            Tracking {healthyCount} of {statuses.length} sources. Each feed is
            polled live whenever you load this page (cached for a few minutes
            by the platform). Click a source to inspect it directly.
          </p>

          {successMessage ? (
            <div className="rounded-xl border border-[color:var(--outline)] bg-[color:var(--success-background,#183d2b)] px-4 py-3 text-sm text-[color:var(--success-foreground,#72f1b8)]">
              {successMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-xl border border-[color:var(--outline)] bg-[color:var(--error-background,#3d1a1a)] px-4 py-3 text-sm text-[color:var(--error-foreground,#ff9c9c)]">
              {errorMessage}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  <th className="border-b border-[color:var(--outline)] px-4 py-3">
                    Source
                  </th>
                  <th className="border-b border-[color:var(--outline)] px-4 py-3">
                    Status
                  </th>
                  <th className="border-b border-[color:var(--outline)] px-4 py-3">
                    Latest Items
                  </th>
                  <th className="border-b border-[color:var(--outline)] px-4 py-3">
                    Last Updated
                  </th>
                  <th className="border-b border-[color:var(--outline)] px-4 py-3">
                    Feed URL
                  </th>
                </tr>
              </thead>
              <tbody>
                {statuses.map((status) => (
                  <tr
                    key={status.id}
                    className="border-b border-[color:var(--outline)] last:border-b-0 hover:bg-[color:var(--surface-hover)]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Link
                          href={status.feedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-[color:var(--foreground)] hover:underline"
                        >
                          {status.title}
                        </Link>
                        {status.description ? (
                          <p className="text-xs text-[color:var(--muted)]">
                            {status.description}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {status.type === "ok" ? (
                        <span className="rounded-full bg-[color:var(--success-background,#183d2b)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--success-foreground,#72f1b8)]">
                          Online
                        </span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <span className="w-fit rounded-full bg-[color:var(--error-background,#3d1a1a)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--error-foreground,#ff9c9c)]">
                            Error
                          </span>
                          <p className="text-xs text-[color:var(--error,#ff9c9c)]">
                            {status.message}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[color:var(--muted)]">
                      {status.type === "ok" ? (
                        <span>{status.itemCount}</span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[color:var(--muted)]">
                      {status.type === "ok"
                        ? status.lastUpdated ?? "—"
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <FeedUrlForm
                        feed={feedConfigs.find((feed) => feed.id === status.id)}
                        defaultUrl={status.feedUrl}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeedUrlForm({
  feed,
  defaultUrl,
}: {
  feed: FeedConfig | undefined;
  defaultUrl: string;
}) {
  if (!feed) return null;

  return (
    <form
      action={updateFeedUrlAction}
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
    >
      <input type="hidden" name="feedId" value={feed.id} />
      <label className="sr-only" htmlFor={`feed-url-${feed.id}`}>
        RSS URL for {feed.title}
      </label>
      <input
        id={`feed-url-${feed.id}`}
        name="url"
        type="url"
        defaultValue={defaultUrl}
        required
        className="w-full rounded-md border border-[color:var(--outline)] bg-[color:var(--background)] px-3 py-2 text-sm text-[color:var(--foreground)] focus:border-[color:var(--accent)] focus:outline-none"
        placeholder="https://example.com/feed"
      />
      <button
        type="submit"
        className="w-full rounded-full border border-[color:var(--outline)] bg-[color:var(--surface)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)] transition hover:bg-[color:var(--surface-hover)] sm:w-auto"
      >
        Save
      </button>
    </form>
  );
}
