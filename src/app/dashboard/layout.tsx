import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  Users,
  FileCheck2,
  Video,
  FolderKanban,
  BarChart3,
  Settings,
} from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  const isAdmin = session.role === "SUPER_ADMIN" || session.role === "ADMIN";
  const isRecruiter = isAdmin || session.role === "RECRUITER";

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard, show: true },
    { label: "Agent Control Center", href: "/dashboard/agents", icon: Cpu, show: isAdmin },
    { label: "Recruitment Pipeline", href: "/dashboard/recruitment", icon: Users, show: isRecruiter },
    { label: "Candidates & CVs", href: "/dashboard/candidates", icon: FileCheck2, show: isRecruiter },
    { label: "Interview Reviews", href: "/dashboard/interviews", icon: Video, show: isRecruiter },
    { label: "Projects & Deliverables", href: "/dashboard/projects", icon: FolderKanban, show: true },
    { label: "Live Analytics", href: "/dashboard/analytics", icon: BarChart3, show: isAdmin },
    { label: "Security & Settings", href: "/dashboard/settings", icon: Settings, show: isAdmin },
  ].filter((item) => item.show);

  return (
    <div className="xavan-container py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar */}
        <aside className="lg:col-span-3">
          <div className="rounded-2xl border border-white/10 bg-[#101010] p-5">
            <div className="border-b border-white/10 pb-4">
              <span className="rounded bg-[#F47735]/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#F47735]">
                ROLE: {session.role}
              </span>
              <div className="mt-2 font-display text-base font-bold text-white">
                {session.fullName}
              </div>
              <div className="truncate font-mono text-xs text-[#A1A1AA]">
                {session.email}
              </div>
            </div>

            <nav aria-label="Dashboard Navigation" className="mt-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-[#A1A1AA] transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="h-4 w-4 text-[#F47735]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-white/10 pt-4">
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* Main Workspace */}
        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}