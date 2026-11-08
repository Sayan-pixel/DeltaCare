import "./globals.css";
import type { Metadata } from "next";

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
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
        <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🩺</span>
              <div>
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">DeltaCare</span>
                <span className="ml-2 text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                  100% Anonymous
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Zero PII • Statistical Confidence
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 md:py-12">
          {children}
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} DeltaCare Micro-SaaS. Informational premium estimates only.</p>
        </footer>
      </body>
    </html>
  );
}

