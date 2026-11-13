// src/app/dashboard/recruitment/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateJobPositionForm } from "@/components/dashboard/CreateJobPositionForm";

export const dynamic = "force-dynamic";

export default async function DashboardRecruitmentPage() {
  const session = await getServerSession();
  const allowed =
    session &&
    (session.role === "SUPER_ADMIN" ||
      session.role === "ADMIN" ||
      session.role === "RECRUITER");

  if (!allowed) redirect("/dashboard?error=forbidden");

  let jobs: Array<{
    id: string;
    slug: string;
    title: string;
    department: string;
    location: string;
    isActive: boolean;
    _count: { applications: number };
  }> = [];

  try {
    jobs = await prisma.jobPosition.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } },
    });
  } catch {
    jobs = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Recruitment Operations &amp; Open Roles
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Manage active positions evaluated by XavanXAI Talent Intelligence and
          track incoming applicant volume.
        </p>
      </div>

      <CreateJobPositionForm />

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-white">
          Database Job Positions ({jobs.length})
        </h2>

        {jobs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#101010] p-8 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-[#F47735]" />
            <p className="mt-3 text-xs text-[#A1A1AA]">
              No database positions yet. Create one above or run{" "}
              <code className="font-mono">npx prisma db seed</code>.
            </p>
          </div>
        ) : (
          jobs.map((job) => (
            <div
              key={job.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#101010] p-5"
            >
              <div>
                <div className="font-mono text-xs text-[#F47735]">
                  {job.department} • {job.location}
                </div>
                <h3 className="mt-1 font-display text-lg font-bold text-white">
                  {job.title}
                </h3>
                <div className="font-mono text-[11px] text-[#A1A1AA]">
                  /apply/{job.slug}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-lg border border-white/10 bg-[#080808] px-3 py-1.5 font-mono text-xs text-white">
                  {job._count.applications} Applications
                </span>
                <span
                  className={`rounded-full px-3 py-1 font-mono text-[10px] ${
                    job.isActive
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border border-white/10 bg-white/5 text-[#A1A1AA]"
                  }`}
                >
                  {job.isActive ? "ACTIVE" : "CLOSED"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}