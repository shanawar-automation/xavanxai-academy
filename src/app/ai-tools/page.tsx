"use client";

import React, { useState } from "react";
import { Sparkles, Clock, Terminal } from "lucide-react";
import { AI_TOOLS_MARKETPLACE, AiToolItem } from "@/data/xavanData";
import { SectionHeader, XavanButton } from "@/components/ui/XavanPrimitives";
import { AiToolRunnerModal } from "@/components/tools/AiToolRunnerModal";

const CATEGORIES: Array<"ALL" | AiToolItem["category"]> = [
  "ALL",
  "Business AI",
  "Development AI",
  "Marketing AI",
  "Productivity AI",
  "Career AI",
];

export default function AiToolsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("ALL");
  const [activeTool, setActiveTool] = useState<AiToolItem | null>(null);

  const filtered =
    selectedCategory === "ALL"
      ? AI_TOOLS_MARKETPLACE
      : AI_TOOLS_MARKETPLACE.filter((t) => t.category === selectedCategory);

  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container">
        <SectionHeader
          eyebrow="XavanXAI Tools Marketplace"
          title={`${AI_TOOLS_MARKETPLACE.length} Specialized AI Workspace Utilities`}
          description="Every tool below displays its exact backend integration state. Authenticated users can execute Backend Ready tools directly against our server-side LLM runtime."
        />

        <div className="mt-10 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-2 text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-[#F47735] text-[#080808] font-semibold"
                  : "border border-white/10 bg-[#101010] text-[#A1A1AA] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => {
            const isReady = tool.status === "LIVE_API_READY";
            return (
              <div
                key={tool.id}
                className="xavan-card flex flex-col justify-between p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-[#F47735]">
                      {tool.category}
                    </span>
                    {isReady ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-300">
                        <Terminal className="h-3 w-3" />
                        Backend Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] text-[#A1A1AA]">
                        <Clock className="h-3 w-3" />
                        Coming Soon
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 font-display text-lg font-bold text-white">
                    {tool.name}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  {isReady ? (
                    <XavanButton
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setActiveTool(tool)}
                      className="w-full"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-[#F47735]" />
                      Launch Tool
                    </XavanButton>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-white/5 bg-[#080808] py-2 text-xs font-mono text-[#A1A1AA]/60"
                    >
                      Scheduled for Upcoming Release
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeTool && (
        <AiToolRunnerModal
          tool={activeTool}
          onClose={() => setActiveTool(null)}
        />
      )}
    </div>
  );
}