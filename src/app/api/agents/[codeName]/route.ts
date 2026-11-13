import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UpdateAgentSchema = z.object({
  status: z.enum(["IDLE", "PAUSED"]).optional(),
  llmProvider: z.enum(["openai", "anthropic"]).optional(),
  llmModel: z.string().min(2).max(60).optional(),
  allowedTools: z.array(z.string().min(2)).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ codeName: string }> }
) {
  const session = await getServerSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { codeName } = await params;

  try {
    const body = await req.json();
    const parsed = UpdateAgentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update payload" }, { status: 400 });
    }

    const updated = await prisma.agent.update({
      where: { codeName },
      data: parsed.data,
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "AGENT_CONFIG_UPDATED",
        resource: `agent:${codeName}`,
        metadata: parsed.data,
      },
    });

    return NextResponse.json({ ok: true, agent: updated });
  } catch (err) {
    console.error("[AGENT_PATCH_ERROR]", err);
    return NextResponse.json(
      { error: "Unable to update agent configuration." },
      { status: 500 }
    );
  }
}