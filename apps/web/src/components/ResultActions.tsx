"use client";

import React, { useState } from "react";
import { BookmarkCheck, BookmarkPlus, Check, Link2, Printer } from "lucide-react";
import { cn } from "../lib/cn";
import { profileToParams } from "../lib/profile";
import { QuoteRequest, QuoteResponse } from "../types/quote";

interface ResultActionsProps {
  profile: QuoteRequest;
  quote: QuoteResponse;
  isPinned: boolean;
  canPin: boolean;
  pinLabel: string;
  onPin: () => void;
}

export const ResultActions: React.FC<ResultActionsProps> = ({
  profile,
  isPinned,
  canPin,
  pinLabel,
  onPin,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?${profileToParams(profile).toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: address bar is already synced via history.replaceState
    }
  };

  return (
    <div className="no-print flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onPin}
        disabled={!canPin}
        aria-pressed={isPinned}
        className={cn(
          "btn-quiet flex-1",
          isPinned && "border-brand bg-brand-soft/60 text-brand hover:border-brand hover:text-brand"
        )}
      >
        {isPinned ? (
          <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />
        )}
        {pinLabel}
      </button>

      <button type="button" onClick={handleCopyLink} className="btn-quiet flex-1">
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            Copied link
          </>
        ) : (
          <>
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
            Share link
          </>
        )}
      </button>

      <button type="button" onClick={() => window.print()} className="btn-quiet" aria-label="Print estimate">
        <Printer className="h-3.5 w-3.5" aria-hidden="true" />
        Print
      </button>
    </div>
  );
};
