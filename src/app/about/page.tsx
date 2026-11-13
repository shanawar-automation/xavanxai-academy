import React from "react";
import { Shield, Cpu, Globe, Lock } from "lucide-react";
import { SectionHeader, XavanButton } from "@/components/ui/XavanPrimitives";

export const metadata = {
  title: "About XavanXAI — Autonomous AI Company Architecture",
  description: "Learn how XavanXAI combines 12 autonomous agent departments with strict human governance and enterprise cybersecurity.",
};

export default function AboutPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container">
        <SectionHeader
          eyebrow="Company Architecture"
          title="Engineering the Autonomous Enterprise"
          description="XavanXAI was founded on a clear premise: the future of enterprise operations isn't another isolated chatbot—it is a coordinated, auditable ecosystem of specialized AI agents governed by human leadership."
        />

        <div id="security" className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="xavan-card p-7">
            <Lock className="h-7 w-7 text-[#F47735]" />
            <h2 className="mt-4 font-display text-xl font-bold text-white">
              Zero-Trust Agent Sandboxes
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-[#A1A1AA]">
              No agent holds unrestricted database or API credentials. Every
              tool call passes through an RBAC permission broker and writes an
              immutable execution log.
            </p>
          </div>

          <div className="xavan-card p-7">
            <Shield className="h-7 w-7 text-[#F47735]" />
            <h2 className="mt-4 font-display text-xl font-bold text-white">
              Ethical AI &amp; GDPR First
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-[#A1A1AA]">
              From candidate CV isolation to zero emotion-inference rules in
              voice interviews, privacy and fairness are enforced in code—not
              just policy documents.
            </p>
          </div>

          <div className="xavan-card p-7">
            <Globe className="h-7 w-7 text-[#F47735]" />
            <h2 className="mt-4 font-display text-xl font-bold text-white">
              International Delivery
            </h2>
            <p className="mt-2.5 text-sm leading-relaxed text-[#A1A1AA]">
              Serving growth-stage and enterprise organizations across the USA,
              United Kingdom, Germany, UAE, and European Union.
            </p>
          </div>
        </div>

        <div className="mt-14 rounded-3xl border border-white/10 bg-[#101010] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold text-white">
              Inspect Our 12 Autonomous Departments
            </h3>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              Explore how each department collaborates inside the XavanXAI Headquarters.
            </p>
          </div>
          <XavanButton variant="primary" href="/ai-headquarters">
            Open AI Headquarters
          </XavanButton>
        </div>
      </div>
    </div>
  );
}