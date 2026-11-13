import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const N8nInboundSchema = z.object({
  eventId: z.string().min(4).max(120),
  workflowName: z.string().min(2).max(120),
  eventType: z.enum([
    "lead.captured",
    "booking.calendar_synced",
    "recruitment.stage_synced",
    "agent.task_completed",
    "system.health_ping",
  ]),
  payload: z.record(z.unknown()),
});

function verifyWebhookSecret(provided: string | null, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "XavanXAI n8n Automation Gateway",
    authHeader: "x-xavan-secret",
    configured: Boolean(process.env.N8N_WEBHOOK_SECRET),
  });
}

export async function POST(req: Request) {
  const configuredSecret = process.env.N8N_WEBHOOK_SECRET || "";
  if (!configuredSecret) {
    return NextResponse.json(
      { error: "N8N_WEBHOOK_SECRET is not configured on the server." },
      { status: 503 }
    );
  }

  const incomingSecret = req.headers.get("x-xavan-secret");
  if (!verifyWebhookSecret(incomingSecret, configuredSecret)) {
    return NextResponse.json(
      { error: "Invalid or missing x-xavan-secret signature." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const parsed = N8nInboundSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid n8n payload" },
        { status: 400 }
      );
    }

    const resourceKey = `n8n:${parsed.data.eventId}`;

    // Idempotency check: prevent duplicate webhook processing
    const existing = await prisma.auditLog.findFirst({
      where: {
        action: "N8N_WEBHOOK_INGESTED",
        resource: resourceKey,
      },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        eventId: parsed.data.eventId,
        message: "Event already processed idempotently.",
      });
    }

    await prisma.auditLog.create({
      data: {
        action: "N8N_WEBHOOK_INGESTED",
        resource: resourceKey,
        metadata: {
          workflowName: parsed.data.workflowName,
          eventType: parsed.data.eventType,
          payload: parsed.data.payload as object,
        },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        duplicate: false,
        eventId: parsed.data.eventId,
        processedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[N8N_INBOUND_WEBHOOK_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to ingest n8n webhook event." },
      { status: 500 }
    );
  }
}