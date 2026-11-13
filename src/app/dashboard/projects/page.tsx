// src/app/dashboard/projects/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import { FolderKanban } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClientProjectSubmissionForm } from "@/components/dashboard/ClientProjectSubmissionForm";

export const dynamic = "force-dynamic";

export default async function DashboardProjectsPage() {
  const session = await getServerSession();
  if (!session) redirect("/login?redirect=/dashboard/projects");

  const isAdmin = session.role === "SUPER_ADMIN" || session.role === "ADMIN";

  let projects: Array<{
    id: string;
    createdAt: Date;
    metadata: unknown;
  }> = [];

  try {
    projects = await prisma.auditLog.findMany({
      where: {
        action: "CLIENT_PROJECT_SUBMITTED",
        ...(isAdmin ? {} : { actorId: session.userId }),
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    projects = [];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Projects, Requirements &amp; Deliverables
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Submit technical project specifications and track active XavanXAI
          engineering engagements.
        </p>
      </div>

      <ClientProjectSubmissionForm />

      <div className="space-y-4">
        <h2 className="font-display text-lg font-bold text-white">
          Submitted Project Briefs ({projects.length})
        </h2>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#101010] p-8 text-center">
            <FolderKanban className="mx-auto h-8 w-8 text-[#F47735]" />
            <p className="mt-3 text-xs text-[#A1A1AA]">
              No project briefs submitted yet. Use the form above to initialize
              a scoped workspace engagement.
            </p>
          </div>
        ) : (
          projects.map((p) => {
            const meta = (p.metadata || {}) as {
              projectCode?: string;
              title?: string;
              serviceTrack?: string;
              requirements?: string;
              status?: string;
              clientEmail?: string;
            };
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-white/10 bg-[#101010] p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#F47735]">
                    {meta.projectCode} • {meta.serviceTrack}
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-300">
                    {meta.status || "DISCOVERY_REVIEW"}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-bold text-white">
                  {meta.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                  {meta.requirements}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}