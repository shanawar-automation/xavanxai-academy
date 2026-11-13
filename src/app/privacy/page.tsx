import React from "react";
import { ShieldCheck } from "lucide-react";
import { SectionHeader } from "@/components/ui/XavanPrimitives";

export const metadata = {
  title: "Privacy Policy, GDPR & Ethical AI Governance — XavanXAI",
  description:
    "How XavanXAI protects candidate CVs, enforces consent-first integrity verification, and guarantees human recruiter sign-off.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container max-w-4xl space-y-8">
        <SectionHeader
          eyebrow="Trust, GDPR & Ethical AI"
          title="Privacy Policy &amp; Ethical AI Governance"
          description="Effective Date: November 2026 • Data Controller: XavanXAI Operations (operations@xavanxai.com)"
        />

        <div className="rounded-3xl border border-white/10 bg-[#101010] p-7 sm:p-9 space-y-6 text-sm leading-relaxed text-[#A1A1AA]">
          <section className="space-y-2">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
              <ShieldCheck className="h-5 w-5 text-[#F47735]" />
              1. Data Minimization &amp; Encrypted Private Storage
            </h2>
            <p>
              XavanXAI collects only the information explicitly submitted by
              users and candidates during account registration, consultation
              booking, project discovery, or job applications. Uploaded PDF and
              DOCX resumes are stored in isolated, non-public private storage
              and are never indexed by public search engines.
            </p>
          </section>

          <section id="interview-ethics" className="space-y-2">
            <h2 className="font-display text-lg font-bold text-white">
              2. Ethical AI Recruitment &amp; Non-Discrimination Commitments
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-white">Zero Biometric or Gaze Scoring:</strong>{" "}
                XavanXAI never analyzes eye movement, facial micro-expressions,
                accent, appearance, or disability-related movement.
              </li>
              <li>
                <strong className="text-white">Consent-First Integrity:</strong>{" "}
                Screen sharing and browser focus checks operate solely after
                explicit disclosure and candidate consent, monitoring only the
                intentionally shared interview surface.
              </li>
              <li>
                <strong className="text-white">Mandatory Human Sign-Off:</strong>{" "}
                AI-generated 8-category evaluations serve strictly as
                evidence-linked decision support. No candidate rejection or
                advancement email can be dispatched without explicit human
                recruiter approval.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold text-white">
              3. Your GDPR Rights (Access, Portability &amp; Erasure)
            </h2>
            <p>
              Authenticated users can export a complete machine-readable JSON
              archive of their profile, applications, and interview records at
              any time via <code className="font-mono text-white">/dashboard/settings</code>.
              To request rectification, human review, or permanent erasure,
              contact <strong className="text-white">operations@xavanxai.com</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}