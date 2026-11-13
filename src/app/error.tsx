"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[APP_ERROR]", error);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center px-4 py-24">
      <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-[#101010] p-8 text-center shadow-glass">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="h-6 w-6 text-amber-400" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-white">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          An unexpected error interrupted this page. You can retry, or head back home.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-[#A1A1AA]">
            Reference: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F47735] px-5 py-2.5 text-sm font-semibold text-[#080808] hover:bg-[#FF884B]"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-[#181818] px-5 py-2.5 text-sm text-white hover:border-[#F47735]/50"
          >
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
