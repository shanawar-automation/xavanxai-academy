import React from "react";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InterviewRoomClient } from "@/components/interview/InterviewRoomClient";

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect(`/login?redirect=/interview/${sessionId}`);
  }

  let application = null;
  try {
    application = await prisma.application.findFirst({
      where: {
        OR: [{ id: sessionId }, { interviewSession: { id: sessionId } }],
        candidateId: session.userId,
      },
      include: {
        job: true,
      },
    });
  } catch {
    application = null;
  }

  if (!application) return notFound();

  return (
    <div className="py-10 lg:py-16">
      <div className="xavan-container max-w-6xl">
        <InterviewRoomClient
          sessionId={application.id}
          candidateName={session.fullName}
          jobTitle={application.job.title}
        />
      </div>
    </div>
  );
}