import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export const metadata = { title: "Page not found" };

const SUGGESTIONS = [
  { label: "AI Headquarters", href: "/ai-headquarters" },
  { label: "Solutions", href: "/services" },
  { label: "AI Tools", href: "/ai-tools" },
  { label: "Careers", href: "/careers" },
];

export default function NotFound() {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-24">
      <div aria-hidden className="xavan-grid-bg absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F47735]/40 bg-[#101010] shadow-orange-subtle">
          <Compass className="h-6 w-6 text-[#F47735]" />
        </div>
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-[#F47735]">
          Error 404
        </p>
        <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
          This route isn&apos;t in our orbit
        </h1>
        <p className="mt-4 text-[#A1A1AA]">
          The page you&apos;re looking for moved, was renamed, or never existed.
          Try one of these instead.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
          {SUGGESTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-xl border border-white/10 bg-[#101010] px-4 py-2 text-sm text-white transition-colors hover:border-[#F47735]/50"
            >
              {s.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#F47735] px-5 py-3 text-sm font-semibold text-[#080808] shadow-orange-subtle transition-all hover:bg-[#FF884B] hover:shadow-orange-glow"
        >
          Back to home
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
