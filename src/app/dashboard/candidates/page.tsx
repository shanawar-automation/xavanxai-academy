import React from "react";
import { redirect } from "next/navigation";
import { FileCheck2, Sparkles, AlertTriangle } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardCandidatesPage() {
  const session = await getServerSession();
  const allowed =
    session &&
    (session.role === "SUPER_ADMIN" ||
      session.role === "ADMIN" ||
      session.role === "RECRUITER");

  if (!allowed) redirect("/dashboard?error=forbidden");

  let applications: Array<{
    id: string;
    matchScore: number | null;
    linkedinUrl: string | null;
    parsedProfile: unknown;
    matchRationale: unknown;
    createdAt: Date;
    candidate: { fullName: string; email: string };
    job: { title: string; department: string };
  }> = [];

  try {
    applications = await prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        candidate: { select: { fullName: true, email: true } },
        job: { select: { title: true, department: true } },
      },
    });
  } catch {
    applications = [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Candidate &amp; CV Intelligence Database
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Evidence-extracted competency profiles and tailored technical
          interview questions. All scores require human recruiter review.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#101010] p-8 text-center">
          <FileCheck2 className="mx-auto h-8 w-8 text-[#F47735]" />
          <h2 className="mt-3 font-display text-lg font-bold text-white">
            No Candidate Applications Yet
          </h2>
          <p className="mt-1 text-xs text-[#A1A1AA]">
            Candidates applying via <code className="font-mono">/careers</code>{" "}
            appear here with their extracted competency profiles and match
            rationales.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const profile = app.parsedProfile as {
              technicalSkills?: string[];
              missingCompetencies?: string[];
              tailoredInterviewQuestions?: string[];
              matchRationale?: string;
            } | null;

            return (
              <div
                key={app.id}
                className="rounded-2xl border border-white/10 bg-[#101010] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="font-mono text-xs text-[#F47735]">
                      {app.job.title} • {app.job.department}
                    </span>
                    <h2 className="mt-1 font-display text-xl font-bold text-white">
                      {app.candidate.fullName}
                    </h2>
                    <p className="font-mono text-xs text-[#A1A1AA]">
                      {app.candidate.email}
                      {app.linkedinUrl ? ` • ${app.linkedinUrl}` : ""}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#F47735]/40 bg-[#080808] px-4 py-2 text-right">
                    <div className="font-mono text-[10px] uppercase text-[#A1A1AA]">
                      Competency Match
                    </div>
                    <div className="font-display text-2xl font-bold text-[#F47735]">
                      {app.matchScore !== null ? `${Math.round(app.matchScore)}%` : "Pending"}
                    </div>
                  </div>
                </div>

                {profile ? (
                  <div className="mt-4 space-y-4 text-xs">
                    {profile.matchRationale && (
                      <p className="leading-relaxed text-white/90">
                        <strong className="text-[#F47735]">
                          Evidence Rationale:{" "}
                        </strong>
                        {profile.matchRationale}
                      </p>
                    )}

                    {profile.technicalSkills && profile.technicalSkills.length > 0 && (
                      <div>
                        <span className="font-mono uppercase text-[#A1A1AA]">
                          Verified Skills:
                        </span>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {profile.technicalSkills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded border border-white/10 bg-[#080808] px-2.5 py-1 font-mono text-[11px] text-white"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {profile.tailoredInterviewQuestions &&
                      profile.tailoredInterviewQuestions.length > 0 && (
                        <div className="rounded-xl border border-white/10 bg-[#080808] p-4">
                          <div className="flex items-center gap-1.5 font-mono uppercase text-[#F47735]">
                            <Sparkles className="h-3.5 w-3.5" />
                            CV-Grounded Interview Questions
                          </div>
                          <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-white/90">
                            {profile.tailoredInterviewQuestions.map((q) => (
                              <li key={q}>{q}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="mt-4 flex items-center gap-2 text-xs text-amber-300">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      CV file stored in private vault; configure{" "}
                      <code className="font-mono">OPENAI_API_KEY</code> to run
                      automated competency extraction.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}