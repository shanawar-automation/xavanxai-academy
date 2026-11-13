import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { dispatchAgentTask } from "@/lib/orchestrator";

const DispatchSchema = z.object({
  agentCodeName: z.string().min(3),
  taskSummary: z.string().min(5).max(500),
  contextNotes: z.string().max(4000).optional(),
  requestedTool: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = DispatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid task payload" },
        { status: 400 }
      );
    }

    const execution = await dispatchAgentTask({
      agentCodeName: parsed.data.agentCodeName,
      taskSummary: parsed.data.taskSummary,
      inputPayload: { notes: parsed.data.contextNotes || "" },
      requestedTool: parsed.data.requestedTool || undefined,
      actorUserId: session.userId,
    });

    return NextResponse.json({ ok: true, execution }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to dispatch agent task.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}