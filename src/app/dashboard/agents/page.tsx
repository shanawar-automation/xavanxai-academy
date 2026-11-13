import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AgentControlCenter } from "@/components/dashboard/AgentControlCenter";

export const dynamic = "force-dynamic";

export default async function DashboardAgentsPage() {
  const session = await getServerSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    redirect("/dashboard?error=forbidden");
  }

  let agents: Array<{
    id: string;
    codeName: string;
    name: string;
    roleTitle: string;
    departmentName: string;
    status: string;
    llmProvider: string;
    llmModel: string;
    allowedTools: string[];
    tasksCompleted: number;
    tasksFailed: number;
  }> = [];

  let executions: Array<{
    id: string;
    agentCode: string;
    agentName: string;
    taskSummary: string;
    status: string;
    requiresApproval: boolean;
    tokensUsed: number;
    estimatedCostUsd: number;
    outputPayload: unknown;
    startedAt: string;
  }> = [];

  try {
    const [dbAgents, dbExecutions] = await Promise.all([
      prisma.agent.findMany({
        include: { department: true },
        orderBy: { codeName: "asc" },
      }),
      prisma.agentExecution.findMany({
        take: 25,
        orderBy: { startedAt: "desc" },
        include: { agent: true },
      }),
    ]);

    agents = dbAgents.map((a) => ({
      id: a.id,
      codeName: a.codeName,
      name: a.name,
      roleTitle: a.roleTitle,
      departmentName: a.department.name,
      status: a.status,
      llmProvider: a.llmProvider,
      llmModel: a.llmModel,
      allowedTools: a.allowedTools,
      tasksCompleted: a.tasksCompleted,
      tasksFailed: a.tasksFailed,
    }));

    executions = dbExecutions.map((e) => ({
      id: e.id,
      agentCode: e.agent.codeName,
      agentName: e.agent.name,
      taskSummary: e.taskSummary,
      status: e.status,
      requiresApproval: e.requiresApproval,
      tokensUsed: e.tokensUsed,
      estimatedCostUsd: e.estimatedCostUsd,
      outputPayload: e.outputPayload,
      startedAt: e.startedAt.toISOString(),
    }));
  } catch {
    // Handled cleanly with empty arrays when DB is not yet migrated
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          AI Agent Control Center
        </h1>
        <p className="mt-1 text-sm text-[#A1A1AA]">
          Configure permissions, dispatch isolated tasks, inspect execution
          logs, and approve sensitive agent actions.
        </p>
      </div>

      <AgentControlCenter agents={agents} executions={executions} />
    </div>
  );
}