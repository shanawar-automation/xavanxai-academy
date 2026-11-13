/**
 * Edge-runtime-safe session helpers.
 * IMPORTANT: this file is imported by `middleware.ts`, which runs on the Edge runtime.
 * Do NOT import Node-only modules (`crypto`, `fs`) or `next/headers` here.
 */
import { SignJWT, jwtVerify } from "jose";

export type SessionRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "RECRUITER"
  | "CLIENT"
  | "CANDIDATE";

export interface XavanSessionPayload {
  userId: string;
  email: string;
  fullName: string;
  role: SessionRole;
}

export const SESSION_COOKIE_NAME = "xavan_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET must be configured in production (min 32 chars).");
    }
    return new TextEncoder().encode("dev-only-xavanxai-secret-key-change-me");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  payload: XavanSessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string
): Promise<XavanSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as XavanSessionPayload;
  } catch {
    return null;
  }
}

export function getSessionCookieConfig(token: string) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export const isAdminRole = (role?: SessionRole | null) =>
  role === "SUPER_ADMIN" || role === "ADMIN";

export const isRecruiterRole = (role?: SessionRole | null) =>
  isAdminRole(role) || role === "RECRUITER";
