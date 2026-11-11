import "./globals.css";
import type { Metadata } from "next";
import { HeartPulse, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "DeltaCare | Transparent Health Insurance Premium Prediction",
  description: "Instant, anonymous, and statistically backed health insurance cost estimates. Zero personal data harvesting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col text-slate-900 dark:text-slate-50">
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/60">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <a href="#" className="flex items-center gap-2.5" aria-label="DeltaCare home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-glow">
                <HeartPulse className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                Delta<span className="text-emerald-600 dark:text-emerald-400">Care</span>
              </span>
            </a>

            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Lock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>100% Anonymous</span>
              <span className="hidden text-emerald-700/60 sm:inline dark:text-emerald-400/60">• Zero PII</span>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 md:py-14">
          {children}
        </main>

        <footer className="border-t border-slate-200/70 py-8 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
          <p>© {new Date().getFullYear()} DeltaCare Micro-SaaS. Informational premium estimates only.</p>
        </footer>
      </body>
    </html>
  );
}
