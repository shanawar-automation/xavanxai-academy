// src/app/api/projects/create/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ProjectSchema = z.object({
  title: z.string().min(4).max(150),
  serviceTrack: z.string().min(2).max(100),
  requirements: z.string().min(10).max(5000),
});

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = ProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid project brief" },
        { status: 400 }
      );
    }

    const projectCode = `PRJ-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "CLIENT_PROJECT_SUBMITTED",
        resource: `project:${projectCode}`,
        metadata: {
          projectCode,
          clientEmail: session.email,
          clientName: session.fullName,
          status: "DISCOVERY_REVIEW",
          ...parsed.data,
        },
      },
    });

    return NextResponse.json({ ok: true, projectCode }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to submit project brief. Verify PostgreSQL connection." },
      { status: 500 }
    );
  }
}