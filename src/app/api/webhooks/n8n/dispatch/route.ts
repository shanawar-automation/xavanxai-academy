import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const OutboundDispatchSchema = z.object({
  workflowTarget: z.string().min(2).max(120),
  agentCode: z.string().min(2).max(40),
  objective: z.string().min(5).max(2000),
});

export async function POST(req: Request) {
  const session = await getServerSession();
  const isOperator =
    session &&
    (session.role === "SUPER_ADMIN" || session.role === "ADMIN");

  if (!isOperator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = OutboundDispatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid dispatch payload" }, { status: 400 });
    }

    const dispatchId = `DSP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const outboundUrl = process.env.N8N_OUTBOUND_WEBHOOK_URL;

    let remoteStatus = "QUEUED_LOCAL_ONLY";
    if (outboundUrl) {
      try {
        const res = await fetch(outboundUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-xavan-secret": process.env.N8N_WEBHOOK_SECRET || "",
          },
          body: JSON.stringify({
            dispatchId,
            triggeredBy: session.email,
            ...parsed.data,
          }),
        });
        remoteStatus = res.ok
          ? `DELIVERED (${res.status})`
          : `REMOTE_ERROR (${res.status})`;
      } catch {
        remoteStatus = "UNREACHABLE_ENDPOINT";
      }
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "N8N_OUTBOUND_DISPATCHED",
        resource: `dispatch:${dispatchId}`,
        metadata: {
          ...parsed.data,
          remoteStatus,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      dispatchId,
      remoteStatus,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to log n8n dispatch." },
      { status: 500 }
    );
  }
}