import React from "react";
import { notFound } from "next/navigation";
import { CheckCircle2, MapPin, Briefcase, Clock, ArrowRight } from "lucide-react";
import { OPEN_POSITIONS } from "@/data/xavanData";
import { SectionHeader, XavanButton } from "@/components/ui/XavanPrimitives";

export function generateStaticParams() {
  return OPEN_POSITIONS.map((p) => ({ slug: p.slug }));
}

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const position = OPEN_POSITIONS.find((p) => p.slug === slug);

  if (!position) return notFound();

  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container max-w-4xl">
        <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#F47735]">
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            {position.department}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {position.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {position.type}
          </span>
        </div>

        <div className="mt-4">
          <SectionHeader
            eyebrow="XavanXAI Talent Intelligence"
            title={position.title}
            description={position.summary}
          />
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-[#101010] p-7">
          <h2 className="font-display text-xl font-bold text-white">
            Role Competencies &amp; Technical Requirements
          </h2>
          <ul className="mt-4 space-y-3">
            {position.requirements.map((req) => (
              <li
                key={req}
                className="flex items-start gap-3 text-sm text-white/90"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F47735]" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-[#101010] p-7">
          <h2 className="font-display text-lg font-bold text-white">
            Transparent 4-Step Assessment Process
          </h2>
          <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs text-[#A1A1AA]">
            <li className="rounded-xl border border-white/5 bg-[#080808] p-4">
              <strong className="text-white block mb-1">
                1. CV &amp; LinkedIn Submission
              </strong>
              Upload PDF/DOCX resume with explicit GDPR processing consent.
            </li>
            <li className="rounded-xl border border-white/5 bg-[#080808] p-4">
              <strong className="text-white block mb-1">
                2. Hardware &amp; Slot Booking
              </strong>
              Verify mic, camera, and screen share before selecting a time slot.
            </li>
            <li className="rounded-xl border border-white/5 bg-[#080808] p-4">
              <strong className="text-white block mb-1">
                3. 30-Minute Adaptive AI Interview
              </strong>
              Structured technical and practical problem-solving conversation.
            </li>
            <li className="rounded-xl border border-white/5 bg-[#080808] p-4">
              <strong className="text-white block mb-1">
                4. Human Engineering Review
              </strong>
              Principal leads review your evidence report before final status email.
            </li>
          </ol>
        </div>

        <div className="mt-10 flex justify-end">
          <XavanButton
            variant="primary"
            size="lg"
            href={`/apply/${position.slug}`}
          >
            Start Application
            <ArrowRight className="h-4 w-4" />
          </XavanButton>
        </div>
      </div>
    </div>
  );
}