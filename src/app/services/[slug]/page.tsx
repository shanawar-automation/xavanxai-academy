import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { SERVICES_CATALOG } from "@/data/xavanData";
import { XavanButton } from "@/components/ui/XavanPrimitives";
import { Reveal } from "@/components/motion/Reveal";

export function generateStaticParams() {
  return SERVICES_CATALOG.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES_CATALOG.find((x) => x.slug === slug);
  return s ? { title: s.title, description: s.shortDesc } : { title: "Service not found" };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idx = SERVICES_CATALOG.findIndex((s) => s.slug === slug);
  if (idx === -1) return notFound();

  const service = SERVICES_CATALOG[idx];
  const next = SERVICES_CATALOG[(idx + 1) % SERVICES_CATALOG.length];

  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container max-w-5xl">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 font-mono text-xs text-[#F47735] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All solutions
        </Link>

        <header className="mt-6 animate-fade-up">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#F47735]">
            {service.category}
          </span>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {service.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[#A1A1AA]">
            {service.shortDesc}
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-white/10 bg-[#101010] p-7">
              <div className="flex items-center gap-2 font-mono text-xs uppercase text-amber-300">
                <AlertTriangle className="h-4 w-4" /> The problem
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/90">{service.problem}</p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="h-full rounded-2xl border border-[#F47735]/30 bg-[#101010] p-7">
              <div className="flex items-center gap-2 font-mono text-xs uppercase text-[#F47735]">
                <Lightbulb className="h-4 w-4" /> Our solution
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/90">{service.solution}</p>
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { title: "Key features", items: service.features },
            { title: "Business benefits", items: service.benefits },
            { title: "Example use cases", items: service.useCases },
          ].map((col, i) => (
            <Reveal key={col.title} delay={i * 80}>
              <div className="h-full rounded-2xl border border-white/10 bg-[#101010] p-6">
                <h2 className="font-display text-lg font-bold text-white">{col.title}</h2>
                <ul className="mt-4 space-y-3">
                  {col.items.map((it) => (
                    <li key={it} className="flex items-start gap-2.5 text-sm text-[#A1A1AA]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F47735]" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <section className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-7">
            <h2 className="font-display text-xl font-bold text-white">Delivery workflow</h2>
            <ol className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {service.workflowSteps.map((step, i) => (
                <li key={step} className="rounded-xl border border-white/5 bg-[#080808] p-4">
                  <span className="font-mono text-2xl font-bold text-[#F47735]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-2 text-sm text-white/90">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-[#F47735]/30 bg-[#101010] p-7 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Want this built for your business?
            </h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              Book a technical discovery session with our architects.
            </p>
          </div>
          <XavanButton variant="primary" href="/book-consultation">
            Book a Consultation <ArrowRight className="h-4 w-4" />
          </XavanButton>
        </div>

        <Link
          href={`/services/${next.slug}`}
          className="mt-8 flex items-center justify-between rounded-2xl border border-white/10 bg-[#101010] p-5 transition-colors hover:border-[#F47735]/40"
        >
          <span>
            <span className="font-mono text-[11px] uppercase text-[#A1A1AA]">Next solution</span>
            <span className="mt-1 block font-display text-lg font-bold text-white">{next.title}</span>
          </span>
          <ArrowRight className="h-5 w-5 text-[#F47735]" />
        </Link>
      </div>
    </div>
  );
}
