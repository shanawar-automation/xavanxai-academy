"use client";

import React, { useState } from "react";
import { X, Sparkles, AlertCircle, Copy, Check } from "lucide-react";
import { AiToolItem } from "@/data/xavanData";
import { XavanButton } from "@/components/ui/XavanPrimitives";

export function AiToolRunnerModal({
  tool,
  onClose,
}: {
  tool: AiToolItem;
  onClose: () => void;
}) {
  const [promptInput, setPromptInput] = useState("");
  const [output, setOutput] = useState<string | null>(null);
  const [tokensUsed, setTokensUsed] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const res = await fetch("/api/tools/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolId: tool.id,
          promptInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Tool execution failed.");
      } else {
        setOutput(data.output);
        setTokensUsed(data.tokensUsed || 0);
      }
    } catch {
      setError("Network error communicating with XavanXAI Tool Runtime.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={tool.name}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#101010] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <span className="font-mono text-[11px] uppercase text-[#F47735]">
              {tool.category}
            </span>
            <h2 className="font-display text-xl font-bold text-white">
              {tool.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tool modal"
            className="rounded-xl border border-white/10 bg-[#080808] p-2 text-[#A1A1AA] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <p className="text-xs text-[#A1A1AA]">{tool.description}</p>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRun} className="space-y-4">
            <div>
              <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
                Input Brief / Technical Context
              </label>
              <textarea
                rows={4}
                required
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder={`Enter parameters, requirements, or text for ${tool.name}...`}
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] p-4 text-sm text-white focus:border-[#F47735] focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <XavanButton type="submit" variant="primary" disabled={loading}>
                <Sparkles className="h-4 w-4" />
                {loading ? "Running AI Inference..." : `Execute ${tool.name}`}
              </XavanButton>
            </div>
          </form>

          {output && (
            <div className="rounded-2xl border border-[#F47735]/35 bg-[#080808] p-5">
              <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="font-mono text-[11px] text-[#F47735]">
                  VERIFIED OUTPUT • {tokensUsed} TOKENS
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 font-mono text-xs text-[#A1A1AA] hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Output
                    </>
                  )}
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/95">
                {output}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}