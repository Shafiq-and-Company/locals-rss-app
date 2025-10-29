"use client";

import { useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "localsgg-theme";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function SiteHeader({ title }: { title: string }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : "light";
  });
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const updateTime = () => setTime(new Date());
    updateTime();
    const interval = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  const timeLabel = useMemo(() => {
    if (!time) return "–";
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(time);
  }, [time]);

  const dateLabel = useMemo(() => {
    if (!time) return "—";
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(time);
  }, [time]);

  const nextTheme: Theme = theme === "light" ? "dark" : "light";
  const buttonLabel = theme === "light" ? "Dark Theme" : "Light Theme";

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--outline)] pb-4">
      <h1 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
        {title}
      </h1>
      <div className="flex items-center gap-4 text-sm text-[color:var(--muted)] sm:text-base">
        <span aria-live="polite" className="font-mono">
          <span suppressHydrationWarning>{timeLabel}</span>{" "}
          <span className="ml-2 text-xs uppercase tracking-[0.3em] text-[color:var(--muted)]">
            <span suppressHydrationWarning>{dateLabel}</span>
          </span>
        </span>
        <button
          type="button"
          onClick={() => setTheme(nextTheme)}
          className="rounded-full border border-[color:var(--outline)] bg-[color:var(--background)] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)] transition hover:bg-[color:var(--surface)]"
          aria-label="Toggle theme"
        >
          <span suppressHydrationWarning>{buttonLabel}</span>
        </button>
      </div>
    </header>
  );
}
