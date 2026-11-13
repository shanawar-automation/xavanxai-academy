import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import {
  verifyPassword,
  signSessionToken,
  getSessionCookieConfig,
} from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  // Brute-force protection: 8 attempts / 10 minutes per IP
  const rl = rateLimit(`login:${clientIp(req)}`, 8, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfterSeconds / 60)} min.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please enter a valid email and password." },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: "USER_LOGIN",
        resource: `user:${user.id}`,
      },
    });

    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    const response = NextResponse.json({ ok: true, role: user.role });
    response.cookies.set(getSessionCookieConfig(token));
    return response;
  } catch (err) {
    console.error("[AUTH_LOGIN_ERROR]", err);
    return NextResponse.json(
      {
        error:
          "Authentication service unavailable. Ensure PostgreSQL is connected.",
      },
      { status: 503 }
    );
  }
}