import React from "react";
import {
  ShieldCheck,
  Mic,
  FileSearch,
  UserCheck,
  Eye,
  ArrowRight,
} from "lucide-react";
import { SectionHeader, XavanButton } from "@/components/ui/XavanPrimitives";

export const metadata = {
  title: "XavanXAI Talent Intelligence — Ethical AI Recruitment Platform",
  description:
    "AI CV competency extraction, 30-minute adaptive WebRTC voice interviewing, consent-based integrity verification, and mandatory human recruiter approval.",
};

export default function RecruitmentProductPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container">
        <SectionHeader
          eyebrow="XavanXAI Talent Intelligence"
          title="Fair, Evidence-Linked AI Recruitment"
          description="Built to eliminate resume keyword roulette and repetitive first-round calls—while guaranteeing zero demographic bias and 100% human recruiter sign-off."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: FileSearch,
              title: "Fact-Grounded CV Engine",
              desc: "Extracts verified education, skills, and project depth from PDF/DOCX without inventing credentials.",
            },
            {
              icon: Mic,
              title: "30-Min Voice Interviewer",
              desc: "Adaptive WebRTC voice conversation that respects a 4-second thinking pause and never interrupts.",
            },
            {
              icon: Eye,
              title: "Consent-First Integrity",
              desc: "Disclosed screen sharing and session checks—never penalizing gaze direction, accent, or disability.",
            },
            {
              icon: UserCheck,
              title: "Human Recruiter Sign-Off",
              desc: "Every candidate receives an 8-category evidence report reviewed by a human recruiter before any decision.",
            },
          ].map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="xavan-card p-6">
                <Icon className="h-6 w-6 text-[#F47735]" />
                <h2 className="mt-4 font-display text-lg font-bold text-white">
                  {pillar.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-14 rounded-3xl border border-[#F47735]/35 bg-[#101010] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#F47735]">
              <ShieldCheck className="h-4 w-4" />
              EXPERIENCE THE CANDIDATE JOURNEY
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-white">
              Apply to an Open Position at XavanXAI
            </h3>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              Upload your CV, test your microphone/camera/screen share, and
              book your 30-minute AI technical interview.
            </p>
          </div>
          <XavanButton variant="primary" size="lg" href="/careers">
            Browse Open Roles
            <ArrowRight className="h-4 w-4" />
          </XavanButton>
        </div>
      </div>
    </div>
  );
}