import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendApprovedCandidateEmail } from "@/lib/emailService";

const RecruiterDecisionSchema = z.object({
  finalDecision: z.enum([
    "RECOMMENDED_NEXT_STAGE",
    "REQUIRES_HUMAN_REVIEW",
    "NOT_RECOMMENDED",
  ]),
  reviewerNotes: z.string().max(4000).optional(),
  sendCandidateEmail: z.boolean(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession();
  const isRecruiter =
    session &&
    (session.role === "SUPER_ADMIN" ||
      session.role === "ADMIN" ||
      session.role === "RECRUITER");

  if (!isRecruiter) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { sessionId } = await params;

  try {
    const body = await req.json();
    const parsed = RecruiterDecisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid decision payload" }, { status: 400 });
    }

    const interview = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    // 1. Save human recruiter approval in DB first
    const updated = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        aiRecommendation: parsed.data.finalDecision,
        humanApproved: true,
        humanReviewerId: session.userId,
        reviewerNotes: parsed.data.reviewerNotes || null,
      },
    });

    let emailOutcome = "NOT_SENT";

    // 2. Dispatch email only if requested & decision is final
    if (
      parsed.data.sendCandidateEmail &&
      (parsed.data.finalDecision === "RECOMMENDED_NEXT_STAGE" ||
        parsed.data.finalDecision === "NOT_RECOMMENDED")
    ) {
      const emailRes = await sendApprovedCandidateEmail({
        toEmail: interview.application.candidate.email,
        candidateName: interview.application.candidate.fullName,
        positionTitle: interview.application.job.title,
        interviewDate: interview.scheduledFor.toISOString().split("T")[0],
        decision: parsed.data.finalDecision,
        approvedByUserId: session.userId,
        sessionId: interview.id,
      });

      emailOutcome = `${emailRes.status} — ${emailRes.message}`;
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "RECRUITER_DECISION_APPROVED",
        resource: `interview:${sessionId}`,
        metadata: {
          finalDecision: parsed.data.finalDecision,
          emailOutcome,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      humanApproved: updated.humanApproved,
      emailStatus: emailOutcome,
    });
  } catch (err) {
    console.error("[RECRUITER_DECISION_ERROR]", err);
    return NextResponse.json(
      { error: "Unable to save recruiter approval." },
      { status: 500 }
    );
  }
}