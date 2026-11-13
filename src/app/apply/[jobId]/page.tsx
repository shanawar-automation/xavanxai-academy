// src/app/apply/[jobId]/page.tsx
import React from "react";
import { redirect, notFound } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OPEN_POSITIONS } from "@/data/xavanData";
import { SectionHeader } from "@/components/ui/XavanPrimitives";
import { CandidateApplyForm } from "@/components/recruitment/CandidateApplyForm";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const session = await getServerSession();

  if (!session) {
    redirect(`/login?redirect=/apply/${jobId}`);
  }

  // Support lookup by slug or database ID
  let dbJob = null;
  try {
    dbJob = await prisma.jobPosition.findFirst({
      where: { OR: [{ id: jobId }, { slug: jobId }] },
    });
  } catch {
    dbJob = null;
  }

  const staticFallback = OPEN_POSITIONS.find(
    (p) => p.id === jobId || p.slug === jobId
  );

  if (!dbJob && !staticFallback) return notFound();

  const resolvedJob = {
    id: dbJob?.id || staticFallback!.id,
    title: dbJob?.title || staticFallback!.title,
    department: dbJob?.department || staticFallback!.department,
    location: dbJob?.location || staticFallback!.location,
    dbSeeded: Boolean(dbJob),
  };

  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container max-w-3xl">
        <SectionHeader
          eyebrow="Candidate Application"
          title={`Apply: ${resolvedJob.title}`}
          description={`${resolvedJob.department} • ${resolvedJob.location}`}
        />

        <div className="mt-10">
          <CandidateApplyForm
            jobId={resolvedJob.id}
            candidateName={session.fullName}
            candidateEmail={session.email}
            dbSeeded={resolvedJob.dbSeeded}
          />
        </div>
      </div>
    </div>
  );
}