import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Globe2,
  Mic,
  ShieldCheck,
} from "lucide-react";
import {
  AUTONOMOUS_AGENTS,
  SERVICES_CATALOG,
  AI_TOOLS_MARKETPLACE,
  OPEN_POSITIONS,
} from "@/data/xavanData";
import {
  SectionHeader,
  TelemetryBadge,
  XavanButton,
} from "@/components/ui/XavanPrimitives";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { Marquee } from "@/components/motion/Marquee";
import { HqPreviewSolarSystem } from "@/components/hq/HqPreviewSolarSystem";

const STACK = [
  "Next.js App Router", "TypeScript", "Python FastAPI", "PostgreSQL + Prisma",
  "Redis & BullMQ", "Three.js / R3F", "WebRTC Realtime", "n8n Automation",
  "OpenAI & Anthropic", "Docker & VPC",
];

const FAQS = [
  {
    q: "How is XavanXAI different from a standard AI agency or wrapper?",
    a: "XavanXAI operates as an orchestrated multi-agent digital organization. Every client system is built with isolated tool permissions, PostgreSQL audit logs, n8n event pipelines, and human-in-the-loop approval gates—never fragile prompt wrappers.",
  },
  {
    q: "Does XavanXAI Talent Intelligence automatically reject candidates using AI?",
    a: "No. Our AI conducts structured CV analysis and 30-minute adaptive voice interviews to produce an evidence-linked evaluation report. A human recruiter must review the evidence and explicitly approve any hiring outcome before an email is dispatched.",
  },
  {
    q: "How do you protect candidate and enterprise data under GDPR?",
    a: "All CVs and reports are encrypted in transit and stored in private buckets with short-lived pre-signed URLs. Explicit consent is logged prior to CV parsing or interview recording, and we configure zero-data-retention API endpoints with LLM providers.",
  },
  {
    q: "Which regions and time zones does XavanXAI serve?",
    a: "We architect and deploy enterprise AI ecosystems for organizations across the USA, UK, Germany, UAE, and broader European markets, with automated timezone detection on all consultation and interview booking flows.",
  },
];

export default function HomePage() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "XavanXAI",
    description:
      "An intelligent AI company operating through a connected ecosystem of autonomous agents, enterprise automation, and XavanXAI Talent Intelligence.",
    areaServed: ["US", "GB", "DE", "AE", "EU"],
  };

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* =========================================================
          SECTION 1 & 2: HERO SECTION & ANIMATED ECOSYSTEM VISUAL
      ========================================================= */}
      <section className="relative overflow-hidden bg-radial-core pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div aria-hidden className="xavan-grid-bg pointer-events-none absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-[#F47735]/10 blur-3xl animate-float" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-64 h-64 w-64 rounded-full bg-[#FF9B66]/10 blur-3xl animate-float [animation-delay:-3s]" />
        <div className="xavan-container relative">
          <div className="mx-auto max-w-4xl text-center animate-fade-up">
            <TelemetryBadge
              label={`Autonomous AI Company • ${AUTONOMOUS_AGENTS.length} Connected Agent Departments`}
              status="simulation"
            />

            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Building the Intelligence{" "}
              <span className="bg-gradient-to-r from-[#F47735] via-[#FF9B66] to-white bg-clip-text text-transparent">
                Behind Tomorrow.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#A1A1AA] sm:text-xl">
              XavanXAI builds intelligent AI systems, autonomous agents and
              advanced automation solutions that help businesses operate smarter,
              faster and more efficiently.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <XavanButton variant="primary" size="lg" href="/ai-headquarters">
                Explore Our AI Ecosystem
                <ArrowRight className="h-4 w-4" />
              </XavanButton>
              <XavanButton variant="secondary" size="lg" href="/ai-agents">
                Meet Our AI Agents
              </XavanButton>
              <XavanButton variant="ghost" size="lg" href="/book-consultation">
                Book a Consultation
              </XavanButton>
            </div>
          </div>

          {/* =========================================================
              SECTION 3 & 4: LIVE AI HEADQUARTERS SOLAR-SYSTEM PREVIEW
          ========================================================= */}
          <Reveal className="mt-16">
            <HqPreviewSolarSystem />
          </Reveal>

          <div className="mt-10">
            <Marquee items={STACK} />
          </div>
        </div>
      </section>

      {/* =========================================================
          SECTION 5: ABOUT XAVANXAI (CONTRAST LIGHT ARCHITECTURE BAND)
      ========================================================= */}
      <section className="bg-white py-20 text-[#080808] lg:py-28">
        <Reveal><div className="xavan-container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <div className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#F47735]">
                <span className="h-[1px] w-6 bg-[#F47735]" />
                About XavanXAI
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#080808] sm:text-4xl lg:text-5xl">
                Not an Ordinary Agency. An Autonomous Digital Organization.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-zinc-600 sm:text-lg">
                Traditional agencies rely on disconnected human handoffs and
                fragile scripts. XavanXAI operates as an intelligent digital
                enterprise where 12 specialized AI departments collaborate via a
                central event bus—supervised by human architects and strict
                cybersecurity boundaries.
              </p>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                  <ShieldCheck className="h-6 w-6 text-[#F47735]" />
                  <h3 className="mt-3 font-display text-base font-bold">
                    Human-Governed Autonomy
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Critical actions pause at human approval gates with full
                    cryptographic audit trails.
                  </p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                  <Globe2 className="h-6 w-6 text-[#F47735]" />
                  <h3 className="mt-3 font-display text-base font-bold">
                    Global Enterprise Delivery
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    Engineered for compliance across the USA, UK, Germany, UAE,
                    and European Union.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 16: Verified Architectural Capabilities (Zero Fake Stats) */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl bg-[#080808] p-8 text-white shadow-2xl">
                <span className="font-mono text-xs uppercase tracking-widest text-[#F47735]">
                  Platform Architecture Specifications
                </span>
                <div className="mt-6 grid grid-cols-2 gap-6">
                  <div className="border-b border-white/10 pb-5">
                    <div className="font-display text-3xl font-bold text-white sm:text-4xl">
                      <CountUp to={AUTONOMOUS_AGENTS.length} />
                    </div>
                    <div className="mt-1 text-xs text-[#A1A1AA]">
                      Specialized Autonomous Agent Departments
                    </div>
                  </div>
                  <div className="border-b border-white/10 pb-5">
                    <div className="font-display text-3xl font-bold text-[#F47735] sm:text-4xl">
                      <CountUp to={AI_TOOLS_MARKETPLACE.length} />
                    </div>
                    <div className="mt-1 text-xs text-[#A1A1AA]">
                      Integrated Business, Dev, SEO &amp; Career AI Tools
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="font-display text-3xl font-bold text-white sm:text-4xl">
                      <CountUp to={30} suffix=" Min" />
                    </div>
                    <div className="mt-1 text-xs text-[#A1A1AA]">
                      Structured WebRTC AI Voice Interview Protocol
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="font-display text-3xl font-bold text-white sm:text-4xl">
                      <CountUp to={100} suffix="%" />
                    </div>
                    <div className="mt-1 text-xs text-[#A1A1AA]">
                      Human Recruiter Sign-Off on Hiring Decisions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div></Reveal>
      </section>

      {/* =========================================================
          SECTION 6: AI SOLUTIONS AND SERVICES
      ========================================================= */}
      <section className="bg-[#080808] py-20 lg:py-28">
        <Reveal><div className="xavan-container">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader
              eyebrow="Enterprise Capabilities"
              title="AI Solutions & Agency Engineering"
              description="Production-grade multi-agent systems, n8n workflow orchestration, and custom AI SaaS platforms built with strict security isolation."
            />
            <XavanButton variant="secondary" href="/services">
              View All {SERVICES_CATALOG.length} Solutions
              <ArrowUpRight className="h-4 w-4" />
            </XavanButton>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES_CATALOG.map((service) => (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="xavan-card group flex flex-col justify-between p-7"
              >
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#F47735]">
                    {service.category}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-bold text-white group-hover:text-[#F47735] transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
                    {service.shortDesc}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4 text-xs font-semibold text-white">
                  Explore Architecture
                  <ArrowRight className="h-3.5 w-3.5 text-[#F47735] transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div></Reveal>
      </section>

      {/* =========================================================
          SECTION 7: AUTONOMOUS AI AGENTS ROSTER
      ========================================================= */}
      <section className="border-y border-white/10 bg-[#101010] py-20 lg:py-28">
        <Reveal><div className="xavan-container">
          <SectionHeader
            eyebrow="Multi-Agent Workforce"
            title="12 Specialized Autonomous Departments"
            description="Every agent operates inside an isolated permission sandbox with explicit tool whitelists, structured memory, and event-bus audit logging."
          />

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AUTONOMOUS_AGENTS.map((agent) => (
              <div
                key={agent.id}
                className="rounded-2xl border border-white/10 bg-[#080808] p-5 transition-colors hover:border-[#F47735]/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-[#F47735]">
                    {agent.codeName}
                  </span>
                  <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-[#A1A1AA]">
                    {agent.department}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-white">
                  {agent.role}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#A1A1AA]">
                  {agent.capabilities[0]}
                </p>
              </div>
            ))}
          </div>
        </div></Reveal>
      </section>

      {/* =========================================================
          SECTION 8: AI PRODUCTS & TOOLS MARKETPLACE PREVIEW
      ========================================================= */}
      <section className="bg-[#080808] py-20 lg:py-28">
        <Reveal><div className="xavan-container">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader
              eyebrow="XavanXAI Suite"
              title="Enterprise AI Tools Marketplace"
              description="Purpose-built AI utilities across Business, Development, Marketing, Productivity, and Career workflows—transparently labeled by API readiness."
            />
            <XavanButton variant="primary" href="/ai-tools">
              Open AI Tools Suite
              <ArrowRight className="h-4 w-4" />
            </XavanButton>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AI_TOOLS_MARKETPLACE.slice(0, 6).map((tool) => (
              <div key={tool.id} className="xavan-card p-6">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#A1A1AA]">
                    {tool.category}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] ${
                      tool.status === "LIVE_API_READY"
                        ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        : "bg-white/5 text-[#A1A1AA] border border-white/10"
                    }`}
                  >
                    {tool.status === "LIVE_API_READY"
                      ? "API Ready"
                      : "Coming Soon"}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-white">
                  {tool.name}
                </h3>
                <p className="mt-2 text-sm text-[#A1A1AA]">{tool.description}</p>
              </div>
            ))}
          </div>
        </div></Reveal>
      </section>

      {/* =========================================================
          SECTION 9: XAVANXAI TALENT INTELLIGENCE (RECRUITMENT PRODUCT)
      ========================================================= */}
      <section className="border-y border-white/10 bg-[#101010] py-20 lg:py-28">
        <Reveal><div className="xavan-container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <SectionHeader
                eyebrow="Flagship Product"
                title="XavanXAI Talent Intelligence"
                description="An ethical, consent-first AI recruitment and 30-minute adaptive voice interview platform engineered to augment—never replace—human hiring judgment."
              />

              <ul className="mt-8 space-y-4">
                {[
                  "Structured CV & authorized LinkedIn competency extraction without demographic bias",
                  "30-minute real-time WebRTC voice interviewer with configurable 4-second silence respect",
                  "Transparent, consent-based screen sharing and session integrity logging",
                  "Evidence-linked 8-category evaluation reports requiring mandatory human recruiter sign-off",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-white/90">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#F47735]" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-4">
                <XavanButton variant="primary" href="/recruitment">
                  Explore Talent Intelligence
                </XavanButton>
                <XavanButton variant="secondary" href="/careers">
                  Test Candidate Journey
                </XavanButton>
              </div>
            </div>

            {/* 30-Minute Interview Structure Breakdown */}
            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-white/10 bg-[#080808] p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Mic className="h-5 w-5 text-[#F47735]" />
                    <span className="font-display font-bold text-white">
                      30-Minute Adaptive Voice Protocol
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#F47735]">
                    WEBRTC + LLM
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { stage: "01. Introduction & Consent Check", time: "03 min" },
                    { stage: "02. CV & Verified Experience Deep-Dive", time: "05 min" },
                    { stage: "03. Adaptive Technical Assessment", time: "10 min" },
                    { stage: "04. Practical Problem-Solving Scenario", time: "07 min" },
                    { stage: "05. Situational & Communication Clarity", time: "03 min" },
                    { stage: "06. Candidate Questions & Closing", time: "02 min" },
                  ].map((item) => (
                    <div
                      key={item.stage}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-[#101010] px-4 py-3 text-sm"
                    >
                      <span className="text-white/90">{item.stage}</span>
                      <span className="font-mono text-xs text-[#F47735]">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div></Reveal>
      </section>

      {/* =========================================================
          SECTION 10, 11, 12, 13: AUTOMATION, INDUSTRIES, PROCESS & STACK
      ========================================================= */}
      <section className="bg-[#080808] py-20 lg:py-28">
        <Reveal><div className="xavan-container">
          <SectionHeader
            eyebrow="How XavanXAI Operates"
            title="From Discovery to Autonomous Production"
            align="center"
          />

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "Architecture & Threat Audit",
                desc: "We map data boundaries, RBAC roles, and GDPR retention rules before writing a single prompt.",
              },
              {
                step: "02",
                title: "Agent & n8n Orchestration",
                desc: "We build isolated tool sandboxes, PostgreSQL schemas, and self-healing webhook workflows.",
              },
              {
                step: "03",
                title: "Human-in-the-Loop QA",
                desc: "Veritas QA Agent and human engineers validate structured outputs against regression suites.",
              },
              {
                step: "04",
                title: "Live Telemetry & Scaling",
                desc: "Monitor real-time execution logs, token costs, and system health inside your Control Center.",
              },
            ].map((phase) => (
              <div key={phase.step} className="xavan-card p-6">
                <span className="font-mono text-2xl font-bold text-[#F47735]">
                  {phase.step}
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-white">
                  {phase.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#A1A1AA]">
                  {phase.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Section 11 & 13: Industries & Core Stack Strip */}
          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#101010] p-7">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#F47735]">
                Target Industries &amp; Global Regions
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "B2B SaaS & Technology",
                  "Enterprise Recruitment & HR",
                  "FinTech & Operations",
                  "E-Commerce & Logistics",
                  "Healthcare Administration",
                  "Legal & Compliance Ops",
                ].map((ind) => (
                  <span
                    key={ind}
                    className="rounded-lg border border-white/10 bg-[#080808] px-3 py-1.5 text-xs text-white/90"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101010] p-7">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#F47735]">
                Production Engineering Stack
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {STACK.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-lg border border-white/10 bg-[#080808] px-3 py-1.5 font-mono text-xs text-[#A1A1AA]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div></Reveal>
      </section>

      {/* =========================================================
          SECTION 14 & 15: DEMONSTRATION ARCHITECTURES (TRANSPARENTLY LABELED)
      ========================================================= */}
      <section className="border-y border-white/10 bg-[#101010] py-20 lg:py-28">
        <Reveal><div className="xavan-container">
          <SectionHeader
            eyebrow="Reference Architectures"
            title="Demonstration System Blueprints"
            description="In accordance with XavanXAI transparency standards, all reference architectures below are explicitly labeled as technical demonstrations rather than fabricated client testimonials."
          />

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                tag: "DEMONSTRATION ARCHITECTURE • 01",
                title: "Autonomous Inbound Lead & n8n Qualification Pipeline",
                summary:
                  "Webhook ingestion → Firmographic enrichment → ICP scoring → Drafted SOW proposal queued for human account executive approval.",
              },
              {
                tag: "DEMONSTRATION ARCHITECTURE • 02",
                title: "30-Minute WebRTC Technical Interview & CV Engine",
                summary:
                  "Encrypted CV upload → Skill graph extraction → Adaptive voice interview with 4s silence handling → Evidence-linked recruiter scorecard.",
              },
              {
                tag: "DEMONSTRATION ARCHITECTURE • 03",
                title: "Zero-Trust Multi-Agent Security & Token Governance",
                summary:
                  "Central Redis event bus enforcing per-agent tool whitelists, daily LLM spend caps, and real-time audit trail persistence.",
              },
            ].map((demo) => (
              <div key={demo.title} className="xavan-card p-7">
                <span className="inline-block rounded bg-[#F47735]/15 px-2.5 py-1 font-mono text-[10px] font-semibold text-[#F47735]">
                  {demo.tag}
                </span>
                <h3 className="mt-4 font-display text-xl font-bold text-white">
                  {demo.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">
                  {demo.summary}
                </p>
              </div>
            ))}
          </div>
        </div></Reveal>
      </section>

      {/* =========================================================
          SECTION 17: CAREERS & RECRUITMENT
      ========================================================= */}
      <section className="bg-[#080808] py-20 lg:py-28">
        <Reveal><div className="xavan-container">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader
              eyebrow="Join XavanXAI"
              title="Open Engineering & AI Roles"
              description="Experience XavanXAI Talent Intelligence firsthand—apply with your CV and schedule your structured 30-minute AI technical interview."
            />
            <XavanButton variant="secondary" href="/careers">
              View All Positions
            </XavanButton>
          </div>

          <div className="mt-10 space-y-4">
            {OPEN_POSITIONS.map((job) => (
              <div
                key={job.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#101010] p-6 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#F47735]">
                    <span>{job.department}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                  </div>
                  <h3 className="mt-1.5 font-display text-xl font-bold text-white">
                    {job.title}
                  </h3>
                </div>
                <XavanButton variant="primary" href={`/careers/${job.slug}`}>
                  Apply &amp; Schedule Interview
                </XavanButton>
              </div>
            ))}
          </div>
        </div></Reveal>
      </section>

      {/* =========================================================
          SECTION 18 & 19: FAQ & CONSULTATION CTA
      ========================================================= */}
      <section className="border-t border-white/10 bg-[#101010] py-20 lg:py-28">
        <Reveal><div className="xavan-container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeader
                eyebrow="Governance & Clarity"
                title="Frequently Asked Questions"
                description="Direct answers on our multi-agent security architecture, ethical recruitment protocols, and enterprise deployment timelines."
              />
              <div className="mt-8 rounded-2xl border border-[#F47735]/30 bg-[#080808] p-6">
                <h3 className="font-display text-xl font-bold text-white">
                  Ready to Architect Your AI Ecosystem?
                </h3>
                <p className="mt-2 text-sm text-[#A1A1AA]">
                  Schedule a technical discovery session with our principal
                  architects across US, UK, EU, or UAE time zones.
                </p>
                <XavanButton
                  variant="primary"
                  href="/book-consultation"
                  className="mt-5 w-full"
                >
                  Book a Consultation
                  <ArrowRight className="h-4 w-4" />
                </XavanButton>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-7">
              {FAQS.map((faq) => (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-white/10 bg-[#080808] p-6"
                >
                  <h3 className="font-display text-base font-bold text-white sm:text-lg">
                    {faq.q}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#A1A1AA]">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div></Reveal>
      </section>
    </div>
  );
}