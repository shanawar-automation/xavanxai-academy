import { cookies } from "next/headers";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  type XavanSessionPayload,
} from "@/lib/session";

// Re-exports keep every existing `import ... from "@/lib/auth"` working.
export {
  signSessionToken,
  verifySessionToken,
  getSessionCookieConfig,
  isAdminRole,
  isRecruiterRole,
  type SessionRole,
  type XavanSessionPayload,
} from "@/lib/session";
export { hashPassword, verifyPassword } from "@/lib/password";

export async function getServerSession(): Promise<XavanSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
