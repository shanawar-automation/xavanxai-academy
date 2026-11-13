"use client";

import React from "react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#101010] px-3 py-1.5 font-mono text-[11px] text-[#A1A1AA] transition-colors hover:border-[#F47735]/50 hover:text-white"
    >
      <ArrowUp className="h-3.5 w-3.5 text-[#F47735]" />
      Back to top
    </button>
  );
}
