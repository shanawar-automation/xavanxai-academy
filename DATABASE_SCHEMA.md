// prisma/schema.prisma (Foundation)
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  SUPER_ADMIN
  ADMIN
  RECRUITER
  CLIENT
  CANDIDATE
}

enum AgentStatus {
  IDLE
  EXECUTING
  AWAITING_APPROVAL
  ERROR
  PAUSED
}

enum HiringDecision {
  PENDING_REVIEW
  RECOMMENDED_NEXT_STAGE
  REQUIRES_HUMAN_REVIEW
  NOT_RECOMMENDED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?
  fullName      String
  role          UserRole  @default(CLIENT)
  gdprConsentAt DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  applications  Application[]
  auditLogs     AuditLog[]
}

model Department {
  id          String   @id @default(cuid())
  slug        String   @unique // e.g., "ceo-intelligence", "recruitment"
  name        String
  orbitRadius Float    @default(10.0)
  agents      Agent[]
}

model Agent {
  id             String      @id @default(cuid())
  codeName       String      @unique // e.g., "XVN-CEO-01"
  name           String
  roleTitle      String
  departmentId   String
  department     Department  @relation(fields: [departmentId], references: [id])
  status         AgentStatus @default(IDLE)
  llmProvider    String      @default("openai")
  llmModel       String      @default("gpt-4o")
  allowedTools   String[]    // Explicit RBAC tool whitelist
  tasksCompleted Int         @default(0)
  tasksFailed    Int         @default(0)
  executions     AgentExecution[]
  updatedAt      DateTime    @updatedAt
}

model AgentExecution {
  id               String   @id @default(cuid())
  agentId          String
  agent            Agent    @relation(fields: [agentId], references: [id])
  taskSummary      String
  inputPayload     Json
  outputPayload    Json?
  tokensUsed       Int      @default(0)
  estimatedCostUsd Float    @default(0.0)
  requiresApproval Boolean  @default(false)
  approvedByUserId String?
  status           String   // QUEUED, RUNNING, COMPLETED, FAILED, BLOCKED
  startedAt        DateTime @default(now())
  completedAt      DateTime?

  @@index([agentId, status])
}

model JobPosition {
  id           String        @id @default(cuid())
  slug         String        @unique
  title        String
  department   String
  location     String
  requirements Json
  isActive     Boolean       @default(true)
  applications Application[]
  createdAt    DateTime      @default(now())
}

model Application {
  id               String            @id @default(cuid())
  jobId            String
  job              JobPosition       @relation(fields: [jobId], references: [id])
  candidateId      String
  candidate        User              @relation(fields: [candidateId], references: [id])
  cvStorageKey     String            // Private S3 key
  linkedinUrl      String?
  parsedProfile    Json?
  matchScore       Float?
  matchRationale   Json?
  consentRecorded  Boolean           @default(false)
  interviewSession InterviewSession?
  createdAt        DateTime          @default(now())
}

model InterviewSession {
  id               String          @id @default(cuid())
  applicationId    String          @unique
  application      Application     @relation(fields: [applicationId], references: [id])
  scheduledFor     DateTime
  durationSeconds  Int             @default(1800) // 30 minutes
  silenceThreshold Int             @default(4)    // 4 seconds configurable
  transcript       Json?
  categoryScores   Json?           // Evidence-linked 8-category breakdown
  aiRecommendation HiringDecision  @default(PENDING_REVIEW)
  humanApproved    Boolean         @default(false)
  humanReviewerId  String?
  reviewerNotes    String?
  emailStatus      String          @default("NOT_QUEUED")
  integrityEvents  IntegrityEvent[]
  createdAt        DateTime        @default(now())
}

model IntegrityEvent {
  id         String           @id @default(cuid())
  sessionId  String
  session    InterviewSession @relation(fields: [sessionId], references: [id])
  eventType  String           // SCREEN_SHARE_STOPPED, TAB_FOCUS_LOST, MULTI_FACE_ALERT
  details    String
  occurredAt DateTime         @default(now())
}

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?
  actor      User?    @relation(fields: [actorId], references: [id])
  action     String
  resource   String
  ipAddress  String?
  metadata   Json?
  createdAt  DateTime @default(now())
}