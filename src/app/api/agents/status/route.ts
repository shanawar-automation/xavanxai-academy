import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AUTONOMOUS_AGENTS } from "@/data/xavanData";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbAgents = await prisma.agent.findMany({
      include: {
        department: true,
        executions: {
          orderBy: { startedAt: "desc" },
          take: 5,
        },
      },
      orderBy: { codeName: "asc" },
    });

    if (dbAgents.length === 0) {
      return NextResponse.json({
        mode: "SIMULATION",
        reason: "Database connected but agent registry is empty. Run `npx prisma db seed`.",
        agents: AUTONOMOUS_AGENTS.map((a) => ({
          ...a,
          status: "IDLE",
          tasksCompleted: 0,
          tasksFailed: 0,
          activeTask: null,
        })),
        recentLogs: [],
      });
    }

    const recentExecutions = await prisma.agentExecution.findMany({
      take: 15,
      orderBy: { startedAt: "desc" },
      include: { agent: true },
    });

    return NextResponse.json({
      mode: "LIVE_BACKEND",
      reason: "Connected to PostgreSQL Agent Registry & Execution Audit Log.",
      agents: dbAgents.map((dbA) => {
        const meta = AUTONOMOUS_AGENTS.find((m) => m.codeName === dbA.codeName);
        return {
          id: meta?.id || dbA.id,
          codeName: dbA.codeName,
          name: dbA.name,
          department: dbA.department.name,
          role: dbA.roleTitle,
          orbitRing: meta?.orbitRing || 1,
          capabilities: meta?.capabilities || [],
          permissions: dbA.allowedTools,
          sampleWorkflow: meta?.sampleWorkflow || "",
          status: dbA.status,
          tasksCompleted: dbA.tasksCompleted,
          tasksFailed: dbA.tasksFailed,
          activeTask:
            dbA.executions.find((e) => e.status === "RUNNING")?.taskSummary ||
            null,
        };
      }),
      recentLogs: recentExecutions.map((ex) => ({
        id: ex.id,
        agentCode: ex.agent.codeName,
        agentName: ex.agent.name,
        summary: ex.taskSummary,
        status: ex.status,
        tokensUsed: ex.tokensUsed,
        timestamp: ex.startedAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({
      mode: "SIMULATION",
      reason: "PostgreSQL unavailable. Displaying clearly labeled architectural simulation.",
      agents: AUTONOMOUS_AGENTS.map((a) => ({
        ...a,
        status: "IDLE",
        tasksCompleted: 0,
        tasksFailed: 0,
        activeTask: null,
      })),
      recentLogs: [],
    });
  }
}