import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
  isAdminRole,
  isRecruiterRole,
} from "@/lib/session";

const ADMIN_ONLY_PREFIXES = [
  "/dashboard/agents",
  "/dashboard/analytics",
  "/dashboard/settings",
];

const RECRUITER_PREFIXES = [
  "/dashboard/recruitment",
  "/dashboard/candidates",
  "/dashboard/interviews",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p)) && !isAdminRole(session.role)) {
    return NextResponse.redirect(new URL("/dashboard?error=forbidden", request.url));
  }

  if (RECRUITER_PREFIXES.some((p) => pathname.startsWith(p)) && !isRecruiterRole(session.role)) {
    return NextResponse.redirect(new URL("/dashboard?error=forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/interview/:path*"],
};
