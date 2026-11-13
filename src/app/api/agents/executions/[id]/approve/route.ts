import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dispatchAgentTask } from "@/lib/orchestrator";

const DecisionSchema = z.object({
  decision: z.enum(["APPROVE", "REJECT", "RETRY"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession();
  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = DecisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }
    const { decision } = parsed.data;

    const execution = await prisma.agentExecution.findUnique({
      where: { id },
      include: { agent: true },
    });

    if (!execution) {
      return NextResponse.json({ error: "Execution not found" }, { status: 404 });
    }

    // ── Approve / Reject only apply to executions waiting at the human gate ──
    if (decision === "APPROVE" || decision === "REJECT") {
      if (execution.status !== "BLOCKED") {
        return NextResponse.json(
          { error: `Only BLOCKED executions can be ${decision.toLowerCase()}d (current: ${execution.status}).` },
          { status: 409 }
        );
      }
    }

    // ── Retry only applies to failed executions ──
    if (decision === "RETRY" && execution.status !== "FAILED") {
      return NextResponse.json(
        { error: `Only FAILED executions can be retried (current: ${execution.status}).` },
        { status: 409 }
      );
    }

    if (decision === "REJECT") {
      await prisma.agentExecution.update({
        where: { id },
        data: {
          status: "FAILED",
          approvedByUserId: session.userId,
          requiresApproval: false,
          outputPayload: { rejectedByAdmin: true, rejectedBy: session.email },
          completedAt: new Date(),
        },
      });

      await prisma.agent.update({
        where: { id: execution.agentId },
        data: { status: "IDLE" },
      });
    }

    if (decision === "APPROVE") {
      await prisma.agentExecution.update({
        where: { id },
        data: {
          approvedByUserId: session.userId,
          requiresApproval: false,
          status: "COMPLETED",
          outputPayload: {
            humanApprovedBy: session.email,
            approvedAt: new Date().toISOString(),
            note: "Human approval recorded. Sensitive external tool execution is delegated to the connected n8n workflow.",
          },
          completedAt: new Date(),
        },
      });

      await prisma.agent.update({
        where: { id: execution.agentId },
        data: { status: "IDLE", tasksCompleted: { increment: 1 } },
      });
    }

    let retryExecution = null;
    if (decision === "RETRY") {
      // Re-run as a brand-new execution; the failed record stays in the audit trail untouched.
      retryExecution = await dispatchAgentTask({
        agentCodeName: execution.agent.codeName,
        taskSummary: execution.taskSummary,
        inputPayload: (execution.inputPayload as Record<string, unknown>) || {},
        actorUserId: session.userId,
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: `AGENT_EXECUTION_${decision}`,
        resource: `execution:${id}`,
      },
    });

    return NextResponse.json({
      ok: true,
      status: decision === "REJECT" ? "REJECTED" : decision === "APPROVE" ? "APPROVED" : "RETRIED",
      retryExecutionId: retryExecution?.id ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Action failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
