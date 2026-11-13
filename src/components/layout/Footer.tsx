import React from "react";
import Link from "next/link";
import { Cpu, Shield, Globe, Mail } from "lucide-react";
import { BackToTop } from "@/components/layout/BackToTop";

const FOOTER_COLUMNS = [
  {
    title: "Autonomous Ecosystem",
    links: [
      { label: "3D AI Headquarters", href: "/ai-headquarters" },
      { label: "12 Department Agents", href: "/ai-agents" },
      { label: "AI Tools Marketplace", href: "/ai-tools" },
      { label: "n8n Automation Center", href: "/services/n8n-workflow-automation" },
    ],
  },
  {
    title: "Talent Intelligence",
    links: [
      { label: "AI Recruitment Platform", href: "/recruitment" },
      { label: "Open Positions", href: "/careers" },
      { label: "Interview Integrity & Ethics", href: "/privacy#interview-ethics" },
      { label: "Candidate Portal", href: "/login" },
    ],
  },
  {
    title: "Enterprise",
    links: [
      { label: "About XavanXAI", href: "/about" },
      { label: "Agency Solutions", href: "/services" },
      { label: "Pricing & Retainers", href: "/pricing" },
      { label: "Book a Consultation", href: "/book-consultation" },
    ],
  },
  {
    title: "Governance & Legal",
    links: [
      { label: "Privacy & GDPR Notice", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Security Architecture", href: "/about#security" },
      { label: "Contact Operations", href: "/contact" },
      { label: "Engineering Journal", href: "/blog" },
    ],
  },
];

export function Footer() {
  return (
    <footer aria-label="Site footer" className="border-t border-white/10 bg-[#080808] pt-16 pb-12">
      <div className="xavan-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-6">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#F47735]/40 bg-[#101010]">
                <Cpu className="h-5 w-5 text-[#F47735]" />
              </div>
              <span className="font-display text-xl font-bold tracking-wider text-white">
                XAVAN<span className="text-[#F47735]">XAI</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#A1A1AA]">
              Building the Intelligence Behind Tomorrow. An autonomous AI company
              operating through an orchestrated ecosystem of specialized enterprise agents.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-[#A1A1AA]">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#101010] px-3 py-1.5">
                <Shield className="h-3.5 w-3.5 text-[#F47735]" />
                GDPR-Ready Architecture
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#101010] px-3 py-1.5">
                <Globe className="h-3.5 w-3.5 text-[#F47735]" />
                USA • UK • DE • UAE • EU
              </span>
            </div>
            <a
              href="mailto:operations@xavanxai.com"
              className="mt-4 inline-flex items-center gap-2 text-sm text-[#A1A1AA] transition-colors hover:text-[#F47735]"
            >
              <Mail className="h-4 w-4 text-[#F47735]" />
              operations@xavanxai.com
            </a>
          </div>

          {/* Navigation Columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-white">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#A1A1AA] transition-colors hover:text-[#F47735]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-[#A1A1AA] sm:flex-row">
          <p>© {new Date().getFullYear()} XavanXAI. All rights reserved.</p>
          <p className="font-mono">
            SYSTEM CORE: NEXT.JS 15 • POSTGRESQL • MULTI-AGENT ORCHESTRATOR
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}