import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CreateJobSchema = z.object({
  title: z.string().min(4).max(120),
  department: z.string().min(2).max(100),
  location: z.string().min(2).max(100),
  type: z.string().min(2).max(60),
  summary: z.string().min(15).max(1500),
  requirements: z.array(z.string().min(2)).min(2).max(15),
});

export async function POST(req: Request) {
  const session = await getServerSession();
  const canManageJobs =
    session &&
    (session.role === "SUPER_ADMIN" ||
      session.role === "ADMIN" ||
      session.role === "RECRUITER");

  if (!canManageJobs) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = CreateJobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid job fields" },
        { status: 400 }
      );
    }

    const slug = parsed.data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const job = await prisma.jobPosition.create({
      data: {
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        title: parsed.data.title,
        department: parsed.data.department,
        location: parsed.data.location,
        type: parsed.data.type,
        summary: parsed.data.summary,
        requirements: parsed.data.requirements,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "JOB_POSITION_CREATED",
        resource: `job:${job.id}`,
        metadata: { title: job.title, slug: job.slug },
      },
    });

    return NextResponse.json({ ok: true, job }, { status: 201 });
  } catch (err) {
    console.error("[CREATE_JOB_ERROR]", err);
    return NextResponse.json(
      { error: "Unable to create job position in PostgreSQL." },
      { status: 500 }
    );
  }
}