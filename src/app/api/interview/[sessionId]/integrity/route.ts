import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const IntegritySchema = z.object({
  eventType: z.enum([
    "SCREEN_SHARE_STARTED",
    "SCREEN_SHARE_STOPPED",
    "WINDOW_FOCUS_LOST",
    "CAMERA_DISCONNECTED",
    "CANDIDATE_PAUSED",
    "TECHNICAL_ISSUE_REPORTED",
  ]),
  details: z.string().max(500),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;

  try {
    const body = await req.json();
    const parsed = IntegritySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid integrity event" }, { status: 400 });
    }

    const application = await prisma.application.findFirst({
      where: {
        OR: [{ id: sessionId }, { interviewSession: { id: sessionId } }],
        candidateId: session.userId,
      },
      include: { interviewSession: true },
    });

    if (!application) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const interviewSession =
      application.interviewSession ||
      (await prisma.interviewSession.create({
        data: {
          applicationId: application.id,
          scheduledFor: new Date(),
        },
      }));

    await prisma.integrityEvent.create({
      data: {
        sessionId: interviewSession.id,
        eventType: parsed.data.eventType,
        details: parsed.data.details,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to record integrity telemetry." },
      { status: 500 }
    );
  }
}