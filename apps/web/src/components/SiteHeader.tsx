"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Moon, ShieldCheck, Sun } from "lucide-react";
import { cn } from "../lib/cn";
import { checkHealth } from "../services/api";

type Theme = "light" | "dark";
type EngineState = "checking" | "ready" | "standby";

export const SiteHeader: React.FC = () => {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const [engineState, setEngineState] = useState<EngineState>("checking");

  const probeEngine = useCallback((signal?: AbortSignal) => {
    setEngineState("checking");
    checkHealth(signal)
      .then((res) => {
        if (!signal?.aborted) {
          setEngineState(res.status === "healthy" && res.model_loaded ? "ready" : "standby");
        }
      })
      .catch(() => {
        if (!signal?.aborted) {
          setEngineState("standby");
        }
      });
  }, []);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const controller = new AbortController();
    probeEngine(controller.signal);
    return () => controller.abort();
  }, [probeEngine]);

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

  const statusMeta: Record<EngineState, { label: string; dotClass: string }> = {
    checking: { label: "Checking engine", dotClass: "bg-amber-500 animate-pulseDot" },
    ready: { label: "Engine ready", dotClass: "bg-brand" },
    standby: { label: "Engine standby", dotClass: "bg-accent" },
  };

  const currentStatus = statusMeta[engineState];

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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => probeEngine()}
            title="Click to re-check pricing engine availability"
            className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft transition-colors hover:border-ink-faint hover:text-ink sm:inline-flex"
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", currentStatus.dotClass)} aria-hidden="true" />
            {currentStatus.label}
          </button>

          <span className="hidden rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft lg:inline-flex">
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
