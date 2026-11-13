# XAVANXAI — MASTER ARCHITECTURE & CONTEXT

## 1. Platform Identity
- **Entity:** XavanXAI Autonomous AI Headquarters
- **Core Capabilities:** Multi-Agent Enterprise Automation, Custom AI SaaS, and XavanXAI Talent Intelligence (AI Recruitment & 30-Minute WebRTC Voice Interviewer).
- **Target Markets:** USA, UK, Germany, UAE, EU (GDPR-compliant data isolation).

## 2. System Topology
[Client Browser: Next.js 15 + R3F 3D HQ + WebRTC]
       │
       ├──► [Next.js API / Server Actions] ──► [PostgreSQL (Prisma) + S3 Private Storage]
       │           │
       │           └──► [Redis Pub/Sub & BullMQ] ──► [12 Autonomous Department Workers]
       │
       ├──► [FastAPI AI & Voice Gateway] ──► [OpenAI Realtime / LLM Router + CV Parser]
       │
       └──► [n8n Automation Engine] ──► [Google Calendar / Resend Email / CRM]

## 3. Non-Negotiable Engineering Guardrails
1. **Zero Simulated Production Data:** The 3D Headquarters must explicitly display a `[SIMULATION MODE — TELEMETRY DISCONNECTED]` badge unless connected to live Redis/PostgreSQL `AgentExecution` streams.
2. **Ethical AI Recruitment:** Zero emotion scoring, zero gaze-tracking auto-fails, and mandatory human recruiter sign-off before any hiring status email is dispatched.
3. **Strict Secret Isolation:** All LLM, WebRTC ephemeral tokens, S3, and SMTP keys reside strictly on the server.