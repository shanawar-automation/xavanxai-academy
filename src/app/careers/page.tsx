// src/app/careers/page.tsx
import React from "react";
import { MapPin, Briefcase, ArrowRight } from "lucide-react";
import { OPEN_POSITIONS } from "@/data/xavanData";
import { SectionHeader, XavanButton } from "@/components/ui/XavanPrimitives";

export const metadata = {
  title: "Careers at XavanXAI — Apply via Talent Intelligence",
  description: "Join XavanXAI. Upload your CV and complete a fair, evidence-based 30-minute adaptive AI voice interview.",
};

export default function CareersPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container">
        <SectionHeader
          eyebrow="Careers"
          title="Build Autonomous Systems With Us"
          description="Our hiring pipeline uses XavanXAI Talent Intelligence: every candidate receives a transparent, bias-shielded 30-minute technical conversation reviewed by human engineering leads."
        />

        <div className="mt-12 space-y-5">
          {OPEN_POSITIONS.map((job) => (
            <div key={job.id} className="xavan-card p-7">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#F47735]">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.department}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white">
                    {job.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm text-[#A1A1AA]">
                    {job.summary}
                  </p>
                </div>
                <XavanButton variant="primary" href={`/careers/${job.slug}`}>
                  View Role &amp; Apply
                  <ArrowRight className="h-4 w-4" />
                </XavanButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}