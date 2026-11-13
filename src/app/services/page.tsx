// src/app/services/page.tsx
import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICES_CATALOG } from "@/data/xavanData";
import { SectionHeader } from "@/components/ui/XavanPrimitives";

export const metadata = {
  title: "AI Services & Enterprise Solutions",
  description: "Autonomous AI agent development, n8n workflow automation, AI recruitment systems, voice agents, and custom AI SaaS.",
};

export default function ServicesPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container">
        <SectionHeader
          eyebrow="Enterprise Solutions"
          title="Production AI Engineering & Automation"
          description="Every XavanXAI engagement includes full backend architecture, security hardening, documentation, and measurable operational handoff."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES_CATALOG.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="xavan-card group flex flex-col justify-between p-7"
            >
              <div>
                <span className="font-mono text-xs uppercase text-[#F47735]">
                  {service.category}
                </span>
                <h2 className="mt-3 font-display text-xl font-bold text-white group-hover:text-[#F47735] transition-colors">
                  {service.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
                  {service.shortDesc}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-semibold text-white">
                View Problem, Solution &amp; Workflow
                <ArrowRight className="h-3.5 w-3.5 text-[#F47735]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}