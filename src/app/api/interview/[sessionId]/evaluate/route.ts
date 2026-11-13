import { NextResponse } from "next/server";
import { getServerSession, isRecruiterRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateInterviewEvaluation,
  mapRecommendationEnum,
} from "@/lib/interviewEvaluator";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;

  try {
    const application = await prisma.application.findFirst({
      where: {
        OR: [{ id: sessionId }, { interviewSession: { id: sessionId } }],
      },
      include: {
        job: true,
        interviewSession: true,
      },
    });

    // Only the candidate who owns the interview, or staff, may trigger evaluation.
    const isOwner = application?.candidateId === session.userId;
    if (application && !isOwner && !isRecruiterRole(session.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!application || !application.interviewSession) {
      return NextResponse.json(
        { error: "Interview session not found." },
        { status: 404 }
      );
    }

    const transcript = Array.isArray(application.interviewSession.transcript)
      ? (application.interviewSession.transcript as Array<{
          speaker: string;
          text: string;
          stage?: string;
        }>)
      : [];

    const requirements = Array.isArray(application.job.requirements)
      ? (application.job.requirements as string[])
      : [];

    const evalResult = await generateInterviewEvaluation({
      jobTitle: application.job.title,
      jobRequirements: requirements,
      parsedProfile: application.parsedProfile,
      transcript,
    });

    const updated = await prisma.interviewSession.update({
      where: { id: application.interviewSession.id },
      data: {
        categoryScores: evalResult.report
          ? (evalResult.report as object)
          : { pendingReason: evalResult.error },
        aiRecommendation: mapRecommendationEnum(
          evalResult.report?.aiRecommendation
        ),
        humanApproved: false,
        emailStatus: "AWAITING_RECRUITER_APPROVAL",
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "INTERVIEW_EVALUATION_GENERATED",
        resource: `interview:${updated.id}`,
        metadata: { aiRecommendation: updated.aiRecommendation },
      },
    });

    return NextResponse.json({
      ok: true,
      recommendation: updated.aiRecommendation,
      notice:
        evalResult.error ||
        "8-category evidence report generated and queued for human recruiter review.",
    });
  } catch (err) {
    console.error("[INTERVIEW_EVALUATE_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to generate interview evaluation." },
      { status: 500 }
    );
  }
}