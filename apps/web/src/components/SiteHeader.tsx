"use client";

import React, { useEffect, useState } from "react";
import { Moon, ShieldCheck, Sun } from "lucide-react";

type Theme = "light" | "dark";

export const SiteHeader: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    try {
      localStorage.setItem("deltacare-theme", next);
    } catch {
      // Ignore storage failures in private contexts
    }
  };

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 rounded-lg text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-brand-on shadow-sm">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-serif text-xl font-medium tracking-tight">DeltaCare</span>
        </a>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex" aria-label="Primary navigation">
          <a href="#estimate" className="transition-colors hover:text-ink">
            Calculator
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#model" className="transition-colors hover:text-ink">
            Model facts
          </a>
          <a href="#faq" className="transition-colors hover:text-ink">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <span className="hidden rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft sm:inline-flex">
            100% Stateless
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={mounted && theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

