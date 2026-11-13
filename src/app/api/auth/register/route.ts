import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import {
  hashPassword,
  signSessionToken,
  getSessionCookieConfig,
} from "@/lib/auth";

const RegisterSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Valid email address required").toLowerCase(),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters")
    .max(128),
  accountType: z.enum(["CLIENT", "CANDIDATE"]),
  gdprConsent: z.literal(true, {
    errorMap: () => ({ message: "Explicit GDPR privacy consent is required." }),
  }),
});

export async function POST(req: Request) {
  const rl = rateLimit(`register:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many sign-ups from this network. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { fullName, email, password, accountType } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashPassword(password),
        role: accountType,
        gdprConsentAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "USER_REGISTERED",
        resource: `user:${user.id}`,
        metadata: { role: user.role },
      },
    });

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    const response = NextResponse.json(
      { ok: true, role: user.role },
      { status: 201 }
    );
    response.cookies.set(getSessionCookieConfig(token));
    return response;
  } catch (err) {
    console.error("[AUTH_REGISTER_ERROR]", err);
    return NextResponse.json(
      {
        error:
          "Database connection unavailable. Verify PostgreSQL DATABASE_URL is running.",
      },
      { status: 503 }
    );
  }
}