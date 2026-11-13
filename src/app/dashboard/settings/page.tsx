import React from "react";
import { redirect } from "next/navigation";
import { ShieldCheck, KeyRound, Download } from "lucide-react";
import { getServerSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
	const session = await getServerSession();
	if (!session) redirect("/login?redirect=/dashboard/settings");

	const integrations = [
		{
			name: "PostgreSQL Primary Database",
			configured: Boolean(process.env.DATABASE_URL),
		},
		{
			name: "Session Signing Secret (AUTH_SECRET)",
			configured: Boolean(process.env.AUTH_SECRET),
		},
		{
			name: "OpenAI LLM & CV Intelligence Runtime",
			configured: Boolean(process.env.OPENAI_API_KEY),
		},
		{
			name: "Resend Transactional Email Gateway",
			configured: Boolean(process.env.RESEND_API_KEY),
		},
		{
			name: "n8n Webhook HMAC Secret",
			configured: Boolean(process.env.N8N_WEBHOOK_SECRET),
		},
	];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="font-display text-2xl font-bold text-white">
					Workspace Security, Integrations &amp; GDPR Controls
				</h1>
				<p className="mt-1 text-sm text-[#A1A1AA]">
					Inspect your active RBAC session, verify server-side connector health,
					and exercise your GDPR right of data portability.
				</p>
			</div>

			{/* Identity Card */}
			<div className="rounded-2xl border border-white/10 bg-[#101010] p-6 space-y-3">
				<div className="flex items-center gap-2 font-mono text-xs text-[#F47735]">
					<ShieldCheck className="h-4 w-4" />
					VERIFIED SESSION IDENTITY
				</div>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
					<div>
						<span className="font-mono text-[#A1A1AA]">FULL NAME</span>
						<div className="mt-1 font-semibold text-white">
							{session.fullName}
						</div>
					</div>
					<div>
						<span className="font-mono text-[#A1A1AA]">EMAIL</span>
						<div className="mt-1 font-semibold text-white">{session.email}</div>
					</div>
					<div>
						<span className="font-mono text-[#A1A1AA]">ASSIGNED ROLE</span>
						<div className="mt-1 font-mono font-semibold text-[#F47735]">
							{session.role}
						</div>
					</div>
				</div>
			</div>

			{/* Integration Readiness (Admin/Developer view) */}
			{(session.role === "SUPER_ADMIN" || session.role === "ADMIN") && (
				<div className="rounded-2xl border border-white/10 bg-[#101010] p-6 space-y-4">
					<div className="flex items-center gap-2 font-mono text-xs text-[#F47735]">
						<KeyRound className="h-4 w-4" />
						SERVER ENVIRONMENT CONNECTOR STATUS
					</div>
					<div className="divide-y divide-white/5 text-xs">
						{integrations.map((item) => (
							<div
								key={item.name}
								className="flex items-center justify-between py-3">
								<span className="text-white/90">{item.name}</span>
								<span
									className={`rounded-full px-3 py-0.5 font-mono text-[10px] ${
										item.configured
											? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
											: "border border-amber-500/30 bg-amber-500/10 text-amber-300"
									}`}>
									{item.configured ? "CONFIGURED" : "MISSING IN .ENV"}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* GDPR Data Rights */}
			<div className="rounded-2xl border border-white/10 bg-[#101010] p-6 space-y-3">
				<h2 className="font-display text-lg font-bold text-white">
					GDPR Data Portability &amp; Candidate Rights
				</h2>
				<p className="text-xs leading-relaxed text-[#A1A1AA]">
					Download a complete JSON archive of your XavanXAI profile, submitted
					applications, and human-reviewed interview records, or contact{" "}
					<strong className="text-white">operations@xavanxai.com</strong> for
					erasure requests.
				</p>
				<div>
					<a
						href="/api/account/gdpr"
						download="xavanxai-personal-data.json"
						className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#181818] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:border-[#F47735]/50">
						<Download className="h-3.5 w-3.5 text-[#F47735]" />
						Export My Personal Data (JSON)
					</a>
				</div>
			</div>
		</div>
	);
}
