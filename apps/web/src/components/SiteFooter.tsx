"use client";

import React, { useEffect, useState } from "react";
import { ExternalLink, ShieldCheck, X } from "lucide-react";

const MIT_LICENSE_TEXT = `MIT License

Copyright (c) 2026 DeltaCare Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

export const SiteFooter: React.FC = () => {
  const [licenseOpen, setLicenseOpen] = useState(false);

  useEffect(() => {
    if (!licenseOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLicenseOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [licenseOpen]);

  return (
    <>
      <footer className="no-print border-t border-line bg-surface/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-ink">
              <ShieldCheck className="h-4 w-4 text-brand" aria-hidden="true" />
              <span className="font-serif text-lg font-medium">DeltaCare</span>
            </div>
            <p className="text-xs leading-relaxed text-ink-faint">
              Transparent health insurance premium estimation. Zero PII persistence, zero cookies, zero sales follow-ups.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-ink-soft">
            <a href="#estimate" className="hover:text-ink">
              Calculator
            </a>
            <a href="#how-it-works" className="hover:text-ink">
              Methodology
            </a>
            <a href="#model" className="hover:text-ink">
              Benchmarks
            </a>
            <a href="#faq" className="hover:text-ink">
              FAQ
            </a>
            <button
              type="button"
              onClick={() => setLicenseOpen(true)}
              className="underline decoration-line underline-offset-4 transition-colors hover:text-ink"
            >
              MIT License
            </button>
          </div>
        </div>
      </footer>

      {licenseOpen && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
          onClick={() => setLicenseOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mit-license-title"
        >
          <div
            className="card relative max-h-[85vh] w-full max-w-xl overflow-y-auto p-6 shadow-lift sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <p className="eyebrow">Open Source Software</p>
                <h2 id="mit-license-title" className="mt-1 font-serif text-2xl font-medium text-ink">
                  MIT License
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setLicenseOpen(false)}
                aria-label="Close MIT License modal"
                className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-paper hover:text-ink"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-line bg-paper/70 p-4 font-mono text-xs leading-relaxed text-ink-soft">
              {MIT_LICENSE_TEXT}
            </pre>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <a
                href="https://github.com/Sayan-pixel/DeltaCare/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
              >
                View on GitHub
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <button type="button" onClick={() => setLicenseOpen(false)} className="btn-quiet">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
