import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  extractDocumentText,
  analyzeCandidateApplication,
} from "@/lib/cvEngine";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required before submitting an application." },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const jobId = String(formData.get("jobId") || "");
    const linkedinUrl = String(formData.get("linkedinUrl") || "").trim();
    const linkedinProfileText = String(
      formData.get("linkedinProfileText") || ""
    ).trim();
    const consent = formData.get("consent") === "true";
    const file = formData.get("cvFile") as File | null;

    if (!consent) {
      return NextResponse.json(
        {
          error:
            "Explicit candidate data processing consent is required prior to CV analysis.",
        },
        { status: 400 }
      );
    }

    if (!file || !ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Please upload a valid PDF or DOCX resume." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "CV file size must not exceed 5 MB." },
        { status: 400 }
      );
    }

    const job = await prisma.jobPosition.findFirst({
      where: { OR: [{ id: jobId }, { slug: jobId }] },
    });
    if (!job || !job.isActive) {
      return NextResponse.json(
        {
          error:
            "This position is not available in the database. If you are the site owner, run `npm run db:seed` first.",
        },
        { status: 404 }
      );
    }

    const alreadyApplied = await prisma.application.findFirst({
      where: { jobId: job.id, candidateId: session.userId },
      select: { id: true },
    });
    if (alreadyApplied) {
      return NextResponse.json(
        {
          error: "You have already applied for this position.",
          applicationId: alreadyApplied.id,
        },
        { status: 409 }
      );
    }

    // Store CV in private non-public vault (swap adapter to S3/R2 in production)
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type === "application/pdf" ? "pdf" : "docx";
    const storageKey = `cvs/${session.userId}/${crypto.randomUUID()}.${ext}`;
    const privateVaultDir = path.join(process.cwd(), ".private-vault", "cvs", session.userId);
    await fs.mkdir(privateVaultDir, { recursive: true });
    await fs.writeFile(
      path.join(process.cwd(), ".private-vault", storageKey),
      buffer
    );

    // Extract text & run bias-shielded CV Intelligence Engine
    const cvText = await extractDocumentText(buffer, file.type);
    const requirements = Array.isArray(job.requirements)
      ? (job.requirements as string[])
      : [];

    const analysis = await analyzeCandidateApplication({
      cvText,
      linkedinUrl: linkedinUrl || undefined,
      linkedinProfileText: linkedinProfileText || undefined,
      jobTitle: job.title,
      jobRequirements: requirements,
    });

    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: session.userId,
        cvStorageKey: storageKey,
        linkedinUrl: linkedinUrl || null,
        parsedProfile: analysis.profile ? (analysis.profile as object) : undefined,
        matchScore: analysis.profile?.matchScore ?? null,
        matchRationale: analysis.profile
          ? {
              rationale: analysis.profile.matchRationale,
              missingCompetencies: analysis.profile.missingCompetencies,
              tailoredQuestions: analysis.profile.tailoredInterviewQuestions,
            }
          : { pendingReason: analysis.error },
        consentRecorded: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "CANDIDATE_APPLICATION_SUBMITTED",
        resource: `application:${application.id}`,
        metadata: {
          jobSlug: job.slug,
          aiParsed: analysis.ok,
        },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        applicationId: application.id,
        aiParsed: analysis.ok,
        notice: analysis.error || "CV analyzed and matched successfully.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[RECRUITMENT_APPLY_ERROR]", err);
    return NextResponse.json(
      { error: "Unable to process application. Verify PostgreSQL connection." },
      { status: 500 }
    );
  }
}