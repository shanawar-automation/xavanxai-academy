import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Lightweight identity probe used by the navbar. Never exposes anything beyond name/role. */
export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(
    {
      authenticated: true,
      fullName: session.fullName,
      role: session.role,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
