// src/app/pricing/page.tsx
import React from "react";
import { Check } from "lucide-react";
import { SectionHeader, XavanButton } from "@/components/ui/XavanPrimitives";

export const metadata = {
  title: "Pricing & Engagement Models",
  description: "Transparent enterprise engagement tiers for autonomous AI systems, n8n workflows, and XavanXAI Talent Intelligence.",
};

const PLANS = [
  {
    name: "Automation Sprint",
    subtitle: "Rapid workflow & n8n integration",
    price: "Custom Scope",
    features: [
      "Up to 3 production n8n / webhook pipelines",
      "CRM, Google Calendar & Email integration",
      "Error retry queues & execution logging",
      "Full JSON blueprint handover & documentation",
    ],
    cta: "Book Automation Discovery",
    featured: false,
  },
  {
    name: "Autonomous Department",
    subtitle: "Multi-agent ecosystem & Talent Intelligence",
    price: "Enterprise Retainer",
    features: [
      "Custom role-scoped AI agents with RBAC sandbox",
      "XavanXAI Talent Intelligence (30-min AI interviewer)",
      "Dedicated PostgreSQL + Redis event architecture",
      "Human approval gates & GDPR compliance audit",
    ],
    cta: "Schedule Architecture Call",
    featured: true,
  },
  {
    name: "Full AI Headquarters",
    subtitle: "Custom AI SaaS & white-label platform",
    price: "Dedicated Pod",
    features: [
      "End-to-end Next.js + FastAPI custom AI product",
      "Real-time WebRTC voice & WhatsApp AI agents",
      "Custom LLM routing & token cost governance",
      "24/7 SLA monitoring & security hardening",
    ],
    cta: "Request Executive Proposal",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container">
        <SectionHeader
          eyebrow="Engagement Models"
          title="Structured for Measurable Enterprise ROI"
          description="Every engagement begins with an architectural discovery session to scope exact infrastructure, token consumption, and security requirements."
          align="center"
        />

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-3xl p-8 ${
                plan.featured
                  ? "border-2 border-[#F47735] bg-[#101010] shadow-orange-glow"
                  : "border border-white/10 bg-[#101010]"
              }`}
            >
              <div>
                <h2 className="font-display text-2xl font-bold text-white">
                  {plan.name}
                </h2>
                <p className="mt-1 text-sm text-[#A1A1AA]">{plan.subtitle}</p>
                <div className="mt-6 border-y border-white/10 py-4 font-display text-2xl font-bold text-[#F47735]">
                  {plan.price}
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-start gap-2.5 text-sm text-white/90"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#F47735]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <XavanButton
                variant={plan.featured ? "primary" : "secondary"}
                href="/book-consultation"
                className="mt-8 w-full"
              >
                {plan.cta}
              </XavanButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}