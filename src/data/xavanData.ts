export interface DepartmentAgent {
  id: string;
  codeName: string;
  name: string;
  department: string;
  role: string;
  orbitRing: 1 | 2 | 3;
  capabilities: string[];
  permissions: string[];
  sampleWorkflow: string;
}

export interface ServiceItem {
  slug: string;
  title: string;
  category: string;
  shortDesc: string;
  problem: string;
  solution: string;
  features: string[];
  benefits: string[];
  useCases: string[];
  workflowSteps: string[];
}

export interface AiToolItem {
  id: string;
  name: string;
  category: "Business AI" | "Development AI" | "Marketing AI" | "Productivity AI" | "Career AI";
  description: string;
  status: "LIVE_API_READY" | "COMING_SOON";
  endpoint?: string;
}

export const AUTONOMOUS_AGENTS: DepartmentAgent[] = [
  {
    id: "ceo",
    codeName: "XVN-CEO-01",
    name: "Aurelia Core",
    department: "Executive Orchestration",
    role: "CEO Intelligence Agent",
    orbitRing: 1,
    capabilities: [
      "Cross-department task routing & priority balancing",
      "Workflow dependency resolution",
      "Executive synthesis & operational reporting",
    ],
    permissions: ["orchestrator:dispatch", "reports:read_all", "approval:request_human"],
    sampleWorkflow: "Receives enterprise project brief → decomposes into Research, Architecture, and QA tasks.",
  },
  {
    id: "research",
    codeName: "XVN-RES-02",
    name: "Vanguard Intel",
    department: "Market & AI Research",
    role: "Research Agent",
    orbitRing: 1,
    capabilities: [
      "Technical literature & model benchmark synthesis",
      "Competitor & market landscape mapping",
      "Structured research brief generation",
    ],
    permissions: ["web:authorized_search", "knowledge_base:write"],
    sampleWorkflow: "Evaluates emerging LLM latency benchmarks → publishes technical advisory to Dev Agent.",
  },
  {
    id: "lead-gen",
    codeName: "XVN-LED-03",
    name: "Meridian Scout",
    department: "Enterprise Growth",
    role: "Lead Generation Agent",
    orbitRing: 2,
    capabilities: [
      "Public company firmographic enrichment",
      "ICP fit scoring & pain-point mapping",
      "CRM record creation & tailored outreach drafting",
    ],
    permissions: ["crm:create_lead", "email:draft_only"],
    sampleWorkflow: "Scores inbound B2B inquiry → enriches company stack → drafts briefing for human review.",
  },
  {
    id: "client-comms",
    codeName: "XVN-COM-04",
    name: "Lyra Concierge",
    department: "Client Relations",
    role: "Client Communication Agent",
    orbitRing: 1,
    capabilities: [
      "24/7 technical inquiry resolution",
      "Project requirement scoping & qualification",
      "Human escalation routing",
    ],
    permissions: ["chat:respond", "calendar:propose_slots", "ticket:escalate"],
    sampleWorkflow: "Qualifies enterprise automation inquiry → captures scope → books discovery slot.",
  },
  {
    id: "recruitment",
    codeName: "XVN-REC-05",
    name: "Athena Talent",
    department: "XavanXAI Talent Intelligence",
    role: "Recruitment & Interview Agent",
    orbitRing: 1,
    capabilities: [
      "Structured PDF/DOCX CV competency extraction",
      "Evidence-based skill matching (bias-shielded)",
      "30-minute adaptive WebRTC voice interviewing",
    ],
    permissions: ["cv:parse_isolated", "interview:conduct", "hiring:queue_human_review"],
    sampleWorkflow: "Parses candidate CV → conducts 30-min technical voice interview → queues report for human recruiter.",
  },
  {
    id: "development",
    codeName: "XVN-DEV-06",
    name: "Forge Architect",
    department: "Software Engineering",
    role: "Development Agent",
    orbitRing: 2,
    capabilities: [
      "TypeScript & Python microservice scaffolding",
      "Automated PR diff & static security review",
      "API contract & schema verification",
    ],
    permissions: ["repo:read", "pr:comment", "sandbox:run_tests"],
    sampleWorkflow: "Reviews pull request → flags unhandled promise rejection → attaches patch suggestion.",
  },
  {
    id: "marketing",
    codeName: "XVN-MKT-07",
    name: "Pulse Strategist",
    department: "Brand & Content",
    role: "Marketing Agent",
    orbitRing: 3,
    capabilities: [
      "Technical whitepaper & case study drafting",
      "Multi-channel campaign architecture",
      "Engagement telemetry analysis",
    ],
    permissions: ["cms:create_draft", "analytics:read"],
    sampleWorkflow: "Transforms completed architecture deployment into a technical case study draft.",
  },
  {
    id: "seo",
    codeName: "XVN-SEO-08",
    name: "Apex Crawler",
    department: "Search & Performance",
    role: "SEO Agent",
    orbitRing: 3,
    capabilities: [
      "Core Web Vitals & structured JSON-LD auditing",
      "Technical keyword intent clustering",
      "Semantic internal linking optimization",
    ],
    permissions: ["site:audit", "seo_reports:write"],
    sampleWorkflow: "Audits service routes → generates missing Organization & Service schema patches.",
  },
  {
    id: "automation",
    codeName: "XVN-AUT-09",
    name: "Nexus Weaver",
    department: "Workflow Integration",
    role: "Automation Agent",
    orbitRing: 2,
    capabilities: [
      "n8n JSON workflow blueprint generation",
      "Webhook retry & dead-letter queue recovery",
      "Cross-platform API payload transformation",
    ],
    permissions: ["n8n:trigger_approved", "webhooks:monitor"],
    sampleWorkflow: "Detects failed CRM webhook → replays payload with exponential backoff → logs recovery.",
  },
  {
    id: "security",
    codeName: "XVN-SEC-10",
    name: "Aegis Sentinel",
    department: "Cybersecurity & Compliance",
    role: "Security Agent",
    orbitRing: 1,
    capabilities: [
      "Real-time RBAC & auth anomaly detection",
      "PII & GDPR retention policy enforcement",
      "Dependency CVE & audit log inspection",
    ],
    permissions: ["audit_logs:read_all", "session:revoke_suspicious", "alert:critical"],
    sampleWorkflow: "Detects repeated unauthorized API token probes → rate-limits IP → alerts SecOps.",
  },
  {
    id: "finance",
    codeName: "XVN-FIN-11",
    name: "Ledger Ops",
    department: "Finance & Operations",
    role: "Finance & Operations Agent",
    orbitRing: 3,
    capabilities: [
      "LLM token consumption & inference cost tracking",
      "Project margin & resource utilization forecasting",
      "Approved invoice & operational ledger summaries",
    ],
    permissions: ["billing:read_aggregated", "token_metrics:read"],
    sampleWorkflow: "Tracks daily OpenAI/Anthropic token spend per department → alerts if budget threshold nears 80%.",
  },
  {
    id: "qa",
    codeName: "XVN-QA-12",
    name: "Veritas Validator",
    department: "Quality Assurance",
    role: "Quality Assurance Agent",
    orbitRing: 2,
    capabilities: [
      "LLM structured output schema validation",
      "Hallucination & source-grounding verification",
      "End-to-end regression suite execution",
    ],
    permissions: ["outputs:validate", "pipeline:block_invalid"],
    sampleWorkflow: "Intercepts candidate evaluation JSON → verifies every score cites transcript evidence.",
  },
];

export const SERVICES_CATALOG: ServiceItem[] = [
  {
    slug: "ai-agent-development",
    title: "Autonomous AI Agent Development",
    category: "Core Intelligence",
    shortDesc: "Custom multi-agent architectures with isolated tool permissions, memory boundaries, and human approval gates.",
    problem: "Off-the-shelf chatbots hallucinate, lack access to internal workflows, and pose security risks when given unrestricted API keys.",
    solution: "We engineer deterministic, role-scoped autonomous agents connected via an event-driven orchestrator with strict RBAC and audit logging.",
    features: [
      "Role-based tool whitelisting & credential isolation",
      "Structured JSON outputs with schema validation",
      "Human-in-the-loop approval queues for high-stakes actions",
      "Real-time execution telemetry & token cost controls",
    ],
    benefits: [
      "Eliminates repetitive cross-platform operational bottlenecks",
      "Full compliance audit trail for every autonomous decision",
      "Model-agnostic architecture (OpenAI, Anthropic, local weights)",
    ],
    useCases: [
      "Automated B2B lead qualification & CRM enrichment",
      "Internal Tier-2 technical support & log triage",
      "Autonomous compliance & document verification",
    ],
    workflowSteps: [
      "Event Trigger (Webhook / Schedule / User Input)",
      "Orchestrator Context Assembly & Permission Check",
      "Agent Reasoning & Sandboxed Tool Execution",
      "QA Verification & Human Approval Gate (if required)",
    ],
  },
  {
    slug: "n8n-workflow-automation",
    title: "n8n Workflow & Process Automation",
    category: "Automation Infrastructure",
    shortDesc: "Self-healing, event-driven n8n pipelines connecting your CRM, ERP, databases, and AI models.",
    problem: "Fragmented SaaS tools force teams into manual copy-pasting, fragile Zapier chains, and silent webhook failures.",
    solution: "Production-grade self-hosted or cloud n8n clusters equipped with error-handling sub-workflows, dead-letter retries, and AI enrichment nodes.",
    features: [
      "Custom webhook & HMAC signature verification",
      "Automated retry loops & Slack/Email failure alerts",
      "PostgreSQL & Redis state persistence",
      "Zero-data-retention AI processing nodes",
    ],
    benefits: [
      "Up to 85% reduction in manual data entry overhead",
      "Predictable infrastructure cost without per-task tax",
      "Full ownership of workflow JSON blueprints",
    ],
    useCases: [
      "Inbound inquiry → AI scoring → HubSpot/Salesforce sync",
      "Automated invoice extraction & ERP reconciliation",
      "Multi-channel client onboarding & workspace provisioning",
    ],
    workflowSteps: [
      "Authenticated Webhook Ingestion",
      "Payload Validation & Schema Normalization",
      "AI Classification / Enrichment Node",
      "Transactional Database Write & Downstream Sync",
    ],
  },
  {
    slug: "ai-recruitment-systems",
    title: "AI Recruitment Systems (Talent Intelligence)",
    category: "Enterprise Products",
    shortDesc: "Ethical, consent-first AI CV analysis and 30-minute adaptive voice interviewing with human recruiter sign-off.",
    problem: "Technical hiring teams spend hundreds of hours screening resumes and conducting repetitive first-round interviews.",
    solution: "XavanXAI Talent Intelligence parses CVs, conducts adaptive 30-minute WebRTC voice interviews, and generates evidence-linked reports—never auto-rejecting candidates without human review.",
    features: [
      "PDF/DOCX competency extraction without demographic bias",
      "30-minute real-time voice interviewer with 4s silence respect",
      "Transparent, consent-based screen & session integrity logs",
      "Mandatory human recruiter approval before candidate emails",
    ],
    benefits: [
      "Reduces initial technical screening time by 70%",
      "Standardized, evidence-backed candidate comparisons",
      "GDPR-compliant candidate data protection & appeal workflows",
    ],
    useCases: [
      "High-volume software engineering & AI role screening",
      "Global remote talent evaluation across time zones",
      "Structured technical competency benchmarking",
    ],
    workflowSteps: [
      "Candidate Application, CV Upload & Explicit Consent",
      "Hardware Check & Slot Booking",
      "30-Minute Adaptive AI Voice Interview",
      "Evidence Report Generation → Human Recruiter Decision",
    ],
  },
  {
    slug: "ai-voice-agents",
    title: "Enterprise AI Voice & WhatsApp Agents",
    category: "Conversational AI",
    shortDesc: "Sub-second latency WebRTC voice assistants and WhatsApp automation with live human whisper handoff.",
    problem: "Traditional IVR phone trees and rigid rule-based WhatsApp bots frustrate customers and lose high-intent leads.",
    solution: "Real-time conversational voice and messaging agents grounded in your company knowledge base with instant CRM booking and human escalation.",
    features: [
      "Real-time voice activity detection & natural interruption handling",
      "Official WhatsApp Business Cloud API integration",
      "Live Google Calendar / Calendly appointment scheduling",
      "Seamless warm transfer to human specialists",
    ],
    benefits: [
      "24/7 multilingual customer engagement across US, UK, EU & UAE",
      "Instant lead capture and qualification under 60 seconds",
      "Full call transcripts and sentiment-free intent tagging",
    ],
    useCases: [
      "Inbound consultation booking & qualification",
      "24/7 patient, client, or logistics status concierge",
      "Automated follow-up & appointment confirmation",
    ],
    workflowSteps: [
      "Inbound WebRTC Voice / WhatsApp Session",
      "RAG Knowledge Retrieval & Intent Classification",
      "Tool Execution (Calendar Booking / CRM Lookup)",
      "Structured Summary Logged to Client Portal",
    ],
  },
  {
    slug: "custom-ai-saas-development",
    title: "Custom AI SaaS & Enterprise Platforms",
    category: "Full-Stack Engineering",
    shortDesc: "End-to-end Next.js, TypeScript, Python FastAPI, and PostgreSQL AI products built for global scale.",
    problem: "MVP wrappers fail under enterprise security audits, multi-tenant isolation requirements, and real-time concurrency.",
    solution: "We architect multi-tenant SaaS applications with row-level security, streaming LLM interfaces, Stripe billing, and comprehensive observability.",
    features: [
      "Next.js App Router + Python FastAPI microservice architecture",
      "Multi-tenant RBAC, SSO, and audit logging",
      "Token metering & usage-based billing pipelines",
      "WCAG-accessible, responsive dark/light design systems",
    ],
    benefits: [
      "Production-ready security and scalability from day one",
      "Clean, documented codebase with zero vendor lock-in",
      "Rapid deployment cycles with automated CI/CD checks",
    ],
    useCases: [
      "B2B vertical AI SaaS platforms",
      "Internal enterprise knowledge & RAG portals",
      "White-label AI automation dashboards",
    ],
    workflowSteps: [
      "System Architecture & Threat Modeling",
      "Database Schema & API Contract Design",
      "Full-Stack Implementation & AI Pipeline Integration",
      "Load Testing, Security Audit & Production Launch",
    ],
  },
  {
    slug: "ai-consulting-integration",
    title: "AI Strategy, Integration & Security Audits",
    category: "Advisory",
    shortDesc: "Architectural roadmaps, LLM provider selection, GDPR compliance, and legacy ERP/CRM AI integration.",
    problem: "Organizations waste budget on disconnected AI pilots that fail security review or lack measurable ROI.",
    solution: "Senior principal architects audit your workflows, establish data governance boundaries, and deploy high-ROI production integrations.",
    features: [
      "Data privacy & EU AI Act / GDPR readiness mapping",
      "LLM latency vs. cost benchmarking & routing strategy",
      "Private VPC / zero-data-retention API configuration",
      "Executive & engineering team enablement workshops",
    ],
    benefits: [
      "Clear, prioritized implementation roadmap with exact cost models",
      "Eliminates shadow-AI data leakage risks",
      "Measurable operational KPIs tied to every deployment",
    ],
    useCases: [
      "Enterprise AI transformation blueprint",
      "Legacy SQL/ERP semantic search integration",
      "Pre-launch AI security & prompt-injection hardening",
    ],
    workflowSteps: [
      "Infrastructure & Workflow Bottleneck Audit",
      "Security, Privacy & Cost Modeling",
      "Architecture Blueprint & Proof-of-Value",
      "Production Rollout & Team Handover",
    ],
  },
];

export const AI_TOOLS_MARKETPLACE: AiToolItem[] = [
  // Business AI
  { id: "biz-consultant", name: "AI Business Consultant", category: "Business AI", description: "Analyzes operational bottlenecks and generates structured AI automation roadmaps.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "biz-plan", name: "AI Business Plan Generator", category: "Business AI", description: "Creates investor-ready market sizing, unit economics, and execution milestones.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "market-research", name: "AI Market Research Agent", category: "Business AI", description: "Synthesizes regional demand across USA, UK, Germany, and UAE markets.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "competitor-analyzer", name: "AI Competitor Analyzer", category: "Business AI", description: "Maps positioning gaps, feature matrices, and technical differentiators.", status: "COMING_SOON" },
  { id: "proposal-generator", name: "AI Proposal Generator", category: "Business AI", description: "Drafts scoped technical statements of work (SOW) with phase deliverables.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "req-analyzer", name: "AI Client Requirement Analyzer", category: "Business AI", description: "Converts raw discovery call notes into user stories and database schemas.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },

  // Development AI
  { id: "code-assistant", name: "AI Code Assistant", category: "Development AI", description: "Generates production TypeScript, Next.js, and Python FastAPI modules.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "debug-assistant", name: "AI Debugging Assistant", category: "Development AI", description: "Traces stack traces, race conditions, and memory leaks with root-cause patches.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "code-reviewer", name: "AI Code Reviewer", category: "Development AI", description: "Audits diffs for OWASP vulnerabilities, N+1 queries, and type safety.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "api-doc-gen", name: "AI API Documentation Generator", category: "Development AI", description: "Produces OpenAPI 3.1 specs and cURL/SDK integration guides from handlers.", status: "COMING_SOON" },
  { id: "arch-planner", name: "AI Architecture Planner", category: "Development AI", description: "Designs distributed queue, caching, and multi-agent topology diagrams.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },

  // Marketing AI
  { id: "content-writer", name: "AI Technical Content Writer", category: "Marketing AI", description: "Drafts authoritative engineering blogs and B2B whitepapers without fluff.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "seo-analyzer", name: "AI SEO & Schema Analyzer", category: "Marketing AI", description: "Audits semantic keyword coverage and generates JSON-LD structured data.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "social-planner", name: "AI Social Media Planner", category: "Marketing AI", description: "Builds LinkedIn and X technical thought-leadership calendars.", status: "COMING_SOON" },
  { id: "email-campaign", name: "AI Email Campaign Generator", category: "Marketing AI", description: "Creates compliant, high-clarity B2B outbound and onboarding sequences.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "ad-copy", name: "AI Advertising Copy Generator", category: "Marketing AI", description: "Generates A/B tested enterprise search and LinkedIn ad variants.", status: "COMING_SOON" },

  // Productivity AI
  { id: "meeting-summarizer", name: "AI Meeting Summarizer", category: "Productivity AI", description: "Extracts decisions, owners, and deadlines from raw meeting transcripts.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "doc-analyzer", name: "AI Document Analyzer", category: "Productivity AI", description: "Queries complex technical contracts and RFP documents with citations.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "research-assistant", name: "AI Research Assistant", category: "Productivity AI", description: "Compares methodologies and summarizes technical documentation.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "knowledge-assistant", name: "AI Knowledge Assistant", category: "Productivity AI", description: "Internal RAG workspace assistant grounded strictly in company SOPs.", status: "COMING_SOON" },
  { id: "task-planner", name: "AI Task Planner", category: "Productivity AI", description: "Breaks project milestones into dependency-ordered engineering sprints.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },

  // Career AI
  { id: "cv-builder", name: "AI CV Builder", category: "Career AI", description: "Formats authentic technical experience into ATS-readable structured profiles.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "portfolio-gen", name: "AI Portfolio Generator", category: "Career AI", description: "Structures project architecture case studies for engineering portfolios.", status: "COMING_SOON" },
  { id: "cover-letter", name: "AI Cover Letter Generator", category: "Career AI", description: "Aligns verified candidate skills directly to job description criteria.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "interview-prep", name: "AI Interview Preparation", category: "Career AI", description: "Generates role-specific system design and practical problem prompts.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
  { id: "skill-gap", name: "AI Skill Gap Analyzer", category: "Career AI", description: "Compares your current stack against target senior engineering roles.", status: "LIVE_API_READY", endpoint: "/api/tools/execute" },
];

export const OPEN_POSITIONS = [
  {
    id: "pos-ai-arch-01",
    slug: "senior-ai-agent-architect",
    title: "Senior AI Agent Architect",
    department: "Autonomous Systems",
    location: "Remote (USA / UK / Germany / UAE / EU)",
    type: "Full-Time",
    summary: "Design multi-agent orchestration topologies, deterministic tool sandboxes, and real-time voice pipelines.",
    requirements: [
      "4+ years building production Python/TypeScript backend systems",
      "Hands-on experience with LLM tool calling, RAG, and state machines",
      "Strong understanding of RBAC, OAuth2, and zero-trust API security",
    ],
  },
  {
    id: "pos-fullstack-02",
    slug: "lead-fullstack-nextjs-engineer",
    title: "Lead Full-Stack Engineer (Next.js & Three.js)",
    department: "Platform Engineering",
    location: "Remote (Global)",
    type: "Full-Time",
    summary: "Architect high-performance Next.js App Router interfaces, WebGL visualizations, and WebRTC media rooms.",
    requirements: [
      "Deep mastery of React, Next.js App Router, TypeScript, and PostgreSQL",
      "Experience with Three.js / React Three Fiber or real-time WebSockets",
      "Commitment to WCAG accessibility and Core Web Vitals optimization",
    ],
  },
  {
    id: "pos-auto-03",
    slug: "enterprise-n8n-automation-engineer",
    title: "Enterprise AI Automation Engineer (n8n)",
    department: "Workflow Integration",
    location: "Remote (UK / EU / UAE)",
    type: "Full-Time / Contract",
    summary: "Build resilient, self-healing n8n workflows integrating CRMs, ERPs, WhatsApp Cloud API, and custom LLMs.",
    requirements: [
      "Proven track record deploying complex production n8n workflows",
      "Proficiency in REST/GraphQL webhooks, JSON transformations, and SQL",
      "Experience implementing retry queues and security compliance",
    ],
  },
];