export interface BlogArticle {
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  readTime: string;
  author: string;
  excerpt: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: "orchestrating-12-autonomous-departments-with-atlas-core",
    title: "Orchestrating 12 Specialized AI Departments Under Deterministic Guardrails",
    category: "Multi-Agent Architecture",
    publishedAt: "2026-10-18",
    readTime: "6 min read",
    author: "XavanXAI Principal Architecture Team",
    excerpt:
      "Why single monolithic prompts fail in enterprise operations—and how separating planning, execution, security auditing, and human approval eliminates silent automation drift.",
    sections: [
      {
        heading: "1. Bounded Responsibility Over Monolithic Prompts",
        body: "When a single LLM agent is asked to qualify leads, write code, evaluate resumes, and dispatch emails simultaneously, context dilution and unverified tool calls inevitably follow. XavanXAI partitions enterprise operations across 12 bounded specialist agents—each constrained by explicit input schemas, role permissions, and audit trails.",
      },
      {
        heading: "2. Immutable Audit Logs & Human Escalation Gates",
        body: "Every agent execution at XavanXAI writes a structured record to PostgreSQL before and after external side effects occur. High-consequence actions—such as candidate hiring outcomes or production infrastructure deployments—are programmatically blocked until an authenticated human operator signs off.",
      },
      {
        heading: "3. Bidirectional n8n Execution Pipelines",
        body: "Rather than hardcoding fragile webhook glue inside UI components, XavanXAI routes external SaaS events through HMAC-verified, idempotent n8n workflows—ensuring retries never duplicate CRM records or calendar bookings.",
      },
    ],
  },
  {
    slug: "ethical-ai-recruitment-eliminating-demographic-and-gaze-bias",
    title: "Designing Consent-First AI Interviews Without Gaze or Emotion Scoring",
    category: "Talent Intelligence & Ethics",
    publishedAt: "2026-11-02",
    readTime: "7 min read",
    author: "XavanXAI Talent Intelligence Lab",
    excerpt:
      "How XavanXAI Talent Intelligence evaluates technical depth using direct transcript quotes, configurable thinking pauses, and mandatory human recruiter review.",
    sections: [
      {
        heading: "1. Rejecting Pseudoscientific Biometric Inference",
        body: "Many automated video interview tools penalize neurodivergent candidates, non-native speakers, or candidates referencing documentation by scoring eye gaze or facial micro-expressions. XavanXAI strictly prohibits emotion, accent, appearance, and gaze scoring.",
      },
      {
        heading: "2. Configurable Silence Thresholds (4s Default / 8s Accessibility)",
        body: "Deep architectural questions require reflection. Athena, our WebRTC voice interviewer, respects a configurable thinking pause before offering a gentle, non-judgmental check-in—and immediately yields if the candidate starts speaking.",
      },
      {
        heading: "3. Evidence-Linked 8-Category Scorecards",
        body: "Every category indicator in a XavanXAI evaluation report must cite a verbatim quote from the candidate's transcript. Candidate status emails remain locked in PostgreSQL until a human recruiter reviews the evidence and approves the decision.",
      },
    ],
  },
  {
    slug: "idempotent-webhook-architecture-for-enterprise-ai-workflows",
    title: "Building Idempotent, Timing-Safe Webhook Gateways in Next.js & PostgreSQL",
    category: "Systems Engineering",
    publishedAt: "2026-11-09",
    readTime: "5 min read",
    author: "XavanXAI Systems Engineering",
    excerpt:
      "A practical blueprint for defending AI automation endpoints against replay attacks, timing side-channels, and duplicate queue deliveries.",
    sections: [
      {
        heading: "1. Constant-Time Secret Verification",
        body: "Standard string equality checks leak byte-by-byte timing differences. XavanXAI verifies incoming webhook headers using Node's crypto.timingSafeEqual on fixed-length buffers before parsing request bodies.",
      },
      {
        heading: "2. Event-ID Deduplication Keys",
        body: "Distributed automation engines like n8n retry transient network timeouts. By indexing unique eventId keys inside PostgreSQL AuditLog records, duplicate deliveries return an idempotent 200 acknowledgement without re-triggering downstream workflows.",
      },
    ],
  },
];