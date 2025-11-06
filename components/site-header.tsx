"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "localsgg-theme";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function SiteHeader({ title }: { title: string }) {
  const pathname = usePathname();
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
  const navItems = [
    { href: "/", label: "Stories" },
    { href: "/sources", label: "Sources" },
  ];

  return (
    <header className="mb-8 flex flex-col gap-6 border-b border-[color:var(--outline)] pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
          {title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--muted)] sm:justify-end sm:text-xs">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === item.href
                : pathname.startsWith(item.href);
            const baseClasses =
              "rounded-full border border-[color:var(--outline)] px-3 py-1 font-semibold transition hover:text-[color:var(--foreground)] hover:border-[color:var(--accent)]";
            const activeClasses = isActive
              ? "bg-[color:var(--surface)] text-[color:var(--foreground)] border-[color:var(--accent)]"
              : "bg-[color:var(--background)]";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${baseClasses} ${activeClasses}`}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setTheme(nextTheme)}
            className="rounded-full border border-[color:var(--outline)] bg-[color:var(--background)] px-4 py-1 text-xs font-semibold uppercase tracking-wide text-[color:var(--foreground)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--foreground)]"
            aria-label="Toggle theme"
          >
            <span suppressHydrationWarning>{buttonLabel}</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col items-start gap-3 text-xs text-[color:var(--muted)] sm:flex-row sm:items-center sm:gap-4 sm:text-sm">
        <span aria-live="polite" className="font-mono leading-5 sm:leading-none">
          <span suppressHydrationWarning>{timeLabel}</span>
          <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.3em] text-[color:var(--muted)] sm:ml-2 sm:inline sm:text-xs">
            <span suppressHydrationWarning>{dateLabel}</span>
          </span>
        </span>
      </div>
    </header>
  );
}
