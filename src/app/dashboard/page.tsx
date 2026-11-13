import React from "react";
import { redirect } from "next/navigation";
import { Database, ShieldCheck, Cpu, AlertTriangle } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TelemetryBadge, XavanButton } from "@/components/ui/XavanPrimitives";

export default async function DashboardOverviewPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");

  // Query real PostgreSQL counts safely (never fake numbers if DB is offline)
  let dbConnected = false;
  let agentCount = 0;
  let executionCount = 0;
  let applicationCount = 0;

  try {
    [agentCount, executionCount, applicationCount] = await Promise.all([
      prisma.agent.count(),
      prisma.agentExecution.count(),
      prisma.application.count(),
    ]);
    dbConnected = true;
  } catch {
    dbConnected = false;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#101010] p-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            XavanXAI Operations Command
          </h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Authenticated workspace for {session.fullName} ({session.role}).
          </p>
        </div>
        <TelemetryBadge
          label={
            dbConnected
              ? "PostgreSQL Telemetry Online"
              : "PostgreSQL Disconnected • Run Prisma Migrate & Seed"
          }
          status={dbConnected ? "live" : "warning"}
        />
      </div>

      {!dbConnected && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-semibold">Database Initialization Required</p>
            <p className="mt-1 text-xs text-amber-200/80">
              Configure <code className="font-mono">DATABASE_URL</code> in{" "}
              <code className="font-mono">.env</code> and run{" "}
              <code className="font-mono">npx prisma db push &amp;&amp; npx prisma db seed</code>{" "}
              to activate persistent agent logs, recruitment pipelines, and
              RBAC records.
            </p>
          </div>
        </div>
      )}

      {/* Real Database Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#101010] p-6">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span className="font-mono text-xs uppercase">Registered Agents</span>
            <Cpu className="h-4 w-4 text-[#F47735]" />
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-white">
            {dbConnected ? agentCount : "—"}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101010] p-6">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span className="font-mono text-xs uppercase">Audit Executions</span>
            <Database className="h-4 w-4 text-[#F47735]" />
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-white">
            {dbConnected ? executionCount : "—"}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101010] p-6">
          <div className="flex items-center justify-between text-[#A1A1AA]">
            <span className="font-mono text-xs uppercase">Talent Applications</span>
            <ShieldCheck className="h-4 w-4 text-[#F47735]" />
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-white">
            {dbConnected ? applicationCount : "—"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#101010] p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-white">
            Launch 3D Autonomous AI Headquarters
          </h2>
          <p className="text-xs text-[#A1A1AA]">
            Inspect department orbits, active execution queues, and agent
            permission boundaries.
          </p>
        </div>
        <XavanButton variant="primary" href="/ai-headquarters">
          Enter 3D AI Headquarters
        </XavanButton>
      </div>
    </div>
  );
}