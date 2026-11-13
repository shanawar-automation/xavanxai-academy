import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  InterviewReviewList,
  ReviewableInterview,
} from "@/components/dashboard/InterviewReviewList";

export const dynamic = "force-dynamic";

export default async function DashboardInterviewsPage() {
  const session = await getServerSession();
  const allowed =
    session &&
    (session.role === "SUPER_ADMIN" ||
      session.role === "ADMIN" ||
      session.role === "RECRUITER");

  if (!allowed) redirect("/dashboard?error=forbidden");

  let interviews: ReviewableInterview[] = [];

  try {
    const dbInterviews = await prisma.interviewSession.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        application: {
          include: {
            candidate: { select: { fullName: true, email: true } },
            job: { select: { title: true } },
          },
        },
        integrityEvents: {
          orderBy: { occurredAt: "asc" },
        },
      },
    });

    interviews = dbInterviews.map((iv) => ({
      id: iv.id,
      candidateName: iv.application.candidate.fullName,
      candidateEmail: iv.application.candidate.email,
      jobTitle: iv.application.job.title,
      scheduledFor: iv.scheduledFor.toISOString().split("T")[0],
      aiRecommendation: iv.aiRecommendation,
      humanApproved: iv.humanApproved,
      reviewerNotes: iv.reviewerNotes,
      emailStatus: iv.emailStatus,
      categoryScores: iv.categoryScores,
      integrityEvents: iv.integrityEvents.map((e) => ({
        id: e.id,
        eventType: e.eventType,
        details: e.details,
        occurredAt: e.occurredAt.toISOString(),
      })),
    }));
  } catch {
    interviews = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Human Recruiter Review &amp; Interview Reports
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Inspect 8-category evidence scorecards and session integrity logs.
          Candidate outcome emails cannot dispatch until a human recruiter
          approves the decision.
        </p>
      </div>

      <InterviewReviewList interviews={interviews} />
    </div>
  );
}