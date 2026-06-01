"use client";

import { isPreviewMode } from "@/config/preview";

export function PreviewBanner() {
  if (!isPreviewMode()) return null;

  return (
    <div
      className="uni-card mb-3 border border-[rgba(184,255,60,0.35)] bg-[rgba(184,255,60,0.08)] px-4 py-2.5 text-center"
      role="status"
    >
      <p className="uni-label text-[var(--uni-pink)]">Preview mode</p>
      <p className="uni-caption mt-1">
        Mock data &amp; simulated actions — deploy Hub contracts for real on-chain
        txs.
      </p>
    </div>
  );
}
