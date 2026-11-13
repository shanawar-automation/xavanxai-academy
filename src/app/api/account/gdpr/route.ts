import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        gdprConsentAt: true,
        createdAt: true,
        applications: {
          include: {
            job: { select: { title: true, department: true } },
            interviewSession: {
              select: {
                id: true,
                scheduledFor: true,
                aiRecommendation: true,
                humanApproved: true,
                emailStatus: true,
              },
            },
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: "GDPR_DATA_EXPORTED",
        resource: `user:${session.userId}`,
      },
    });

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      controller: "XavanXAI Operations (operations@xavanxai.com)",
      user,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to export personal data." },
      { status: 500 }
    );
  }
}