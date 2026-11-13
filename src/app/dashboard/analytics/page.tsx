import React from "react";
import { redirect } from "next/navigation";
import {
	BarChart3,
	Users,
	Briefcase,
	CheckCircle2,
	Cpu,
	Webhook,
} from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AUTONOMOUS_AGENTS } from "@/data/xavanData";

export const dynamic = "force-dynamic";

export default async function DashboardAnalyticsPage() {
	const session = await getServerSession();
	const allowed =
		session && (session.role === "SUPER_ADMIN" || session.role === "ADMIN");
	if (!allowed) redirect("/dashboard?error=forbidden");

	let metrics = {
		totalUsers: 0,
		activeJobs: 0,
		totalApplications: 0,
		completedInterviews: 0,
		humanApprovedInterviews: 0,
		aiToolRuns: 0,
		consultationsBooked: 0,
		n8nEvents: 0,
		dbConnected: true,
	};

	let recentAuditLogs: Array<{
		id: string;
		action: string;
		resource: string;
		createdAt: Date;
	}> = [];

	try {
		const [
			totalUsers,
			activeJobs,
			totalApplications,
			completedInterviews,
			humanApprovedInterviews,
			aiToolRuns,
			consultationsBooked,
			n8nEvents,
			logs,
		] = await Promise.all([
			prisma.user.count(),
			prisma.jobPosition.count({ where: { isActive: true } }),
			prisma.application.count(),
			prisma.interviewSession.count(),
			prisma.interviewSession.count({ where: { humanApproved: true } }),
			prisma.auditLog.count({ where: { action: "AI_TOOL_EXECUTED" } }),
			prisma.auditLog.count({ where: { action: "CONSULTATION_BOOKED" } }),
			prisma.auditLog.count({
				where: {
					action: { in: ["N8N_WEBHOOK_INGESTED", "N8N_OUTBOUND_DISPATCHED"] },
				},
			}),
			prisma.auditLog.findMany({
				orderBy: { createdAt: "desc" },
				take: 10,
				select: { id: true, action: true, resource: true, createdAt: true },
			}),
		]);

		metrics = {
			totalUsers,
			activeJobs,
			totalApplications,
			completedInterviews,
			humanApprovedInterviews,
			aiToolRuns,
			consultationsBooked,
			n8nEvents,
			dbConnected: true,
		};
		recentAuditLogs = logs;
	} catch {
		metrics.dbConnected = false;
	}

	const statCards = [
		{
			label: "Registered Accounts",
			value: metrics.totalUsers,
			icon: Users,
			sub: "PostgreSQL RBAC identities",
		},
		{
			label: "Candidate Applications",
			value: metrics.totalApplications,
			icon: Briefcase,
			sub: `${metrics.activeJobs} active open roles`,
		},
		{
			label: "Human-Approved Decisions",
			value: `${metrics.humanApprovedInterviews} / ${metrics.completedInterviews}`,
			icon: CheckCircle2,
			sub: "100% recruiter sign-off gate",
		},
		{
			label: "AI Tool Executions",
			value: metrics.aiToolRuns,
			icon: Cpu,
			sub: `${metrics.consultationsBooked} consultations booked`,
		},
		{
			label: "n8n Webhook Events",
			value: metrics.n8nEvents,
			icon: Webhook,
			sub: "Idempotent automation logs",
		},
		{
			label: "Autonomous Departments",
			value: AUTONOMOUS_AGENTS.length,
			icon: BarChart3,
			sub: "Orchestrated under Atlas Core",
		},
	];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-display text-2xl font-bold text-white">
					Enterprise Telemetry &amp; Operations Analytics
				</h1>
				<p className="mt-1 text-sm text-[#A1A1AA]">
					Live metrics queried directly from PostgreSQL—zero synthetic numbers
					or simulated traffic.
				</p>
			</div>

			{!metrics.dbConnected && (
				<div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
					PostgreSQL connection unavailable. Configure{" "}
					<code className="font-mono">DATABASE_URL</code> and run{" "}
					<code className="font-mono">npx prisma migrate dev</code> to display
					live database counts.
				</div>
			)}

			{/* KPI Grid */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{statCards.map((card) => {
					const Icon = card.icon;
					return (
						<div
							key={card.label}
							className="rounded-2xl border border-white/10 bg-[#101010] p-6">
							<div className="flex items-center justify-between">
								<span className="font-mono text-xs uppercase text-[#A1A1AA]">
									{card.label}
								</span>
								<Icon className="h-4 w-4 text-[#F47735]" />
							</div>
							<div className="mt-3 font-display text-3xl font-bold text-white">
								{card.value}
							</div>
							<div className="mt-1 font-mono text-[11px] text-[#A1A1AA]">
								{card.sub}
							</div>
						</div>
					);
				})}
			</div>

			{/* Live Audit Stream */}
			<div className="rounded-2xl border border-white/10 bg-[#101010] p-6">
				<h2 className="font-display text-lg font-bold text-white">
					Recent Immutable Audit Events
				</h2>
				{recentAuditLogs.length === 0 ? (
					<p className="mt-3 text-xs text-[#A1A1AA]">
						No audit events recorded yet. Actions across auth, recruitment, AI
						tools, bookings, and n8n webhooks appear here automatically.
					</p>
				) : (
					<div className="mt-4 overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead>
								<tr className="border-b border-white/10 font-mono text-[11px] uppercase text-[#A1A1AA]">
									<th className="py-2.5 pr-4">Action</th>
									<th className="py-2.5 pr-4">Resource</th>
									<th className="py-2.5">Timestamp (UTC)</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/5">
								{recentAuditLogs.map((log) => (
									<tr key={log.id}>
										<td className="py-2.5 pr-4 font-mono text-[#F47735]">
											{log.action}
										</td>
										<td className="py-2.5 pr-4 font-mono text-white/90">
											{log.resource}
										</td>
										<td className="py-2.5 font-mono text-[#A1A1AA]">
											{log.createdAt.toISOString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
