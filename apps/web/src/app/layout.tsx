import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "DeltaCare | Transparent Health Insurance Premium Prediction",
  description: "Instant, anonymous, and statistically backed health insurance cost estimates. Zero personal data harvesting.",
  openGraph: {
    title: "DeltaCare — transparent health insurance pricing",
    description: "An instant monthly estimate with an honest margin of error. No sign-up, nothing stored.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1310" },
  ],
};

/** Runs before first paint so the saved theme never flashes the wrong colours. */
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('deltacare-theme');var d=t==='dark'||((t===null||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#estimate"
          className="sr-only z-50 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to calculator
        </a>
        <SiteHeader />
        <main id="top" className="mx-auto w-full max-w-6xl flex-1 scroll-mt-24 px-4 pb-24 pt-10 sm:px-6 md:pt-16 lg:pb-16">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
