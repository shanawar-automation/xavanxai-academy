import React from "react";
import { Shield, Cpu, ArrowRight } from "lucide-react";
import { AUTONOMOUS_AGENTS } from "@/data/xavanData";
import { SectionHeader, XavanButton } from "@/components/ui/XavanPrimitives";

export const metadata = {
  title: "12 Autonomous AI Agents & Department Architecture",
  description:
    "Detailed technical specifications, tool permissions, and workflows for all 12 XavanXAI autonomous agents.",
};

export default function AiAgentsPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeader
            eyebrow="Agent Registry"
            title="12 Autonomous Department Agents"
            description="Every XavanXAI agent operates with explicit tool whitelists, isolated memory context, and mandatory human approval gates for external or sensitive actions."
          />
          <XavanButton variant="primary" href="/ai-headquarters">
            Launch 3D Headquarters
            <ArrowRight className="h-4 w-4" />
          </XavanButton>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {AUTONOMOUS_AGENTS.map((agent) => (
            <div
              key={agent.id}
              className="xavan-card flex flex-col justify-between p-7"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded bg-[#F47735]/15 px-2.5 py-1 font-mono text-xs font-semibold text-[#F47735]">
                    {agent.codeName}
                  </span>
                  <span className="font-mono text-xs text-[#A1A1AA]">
                    ORBIT 0{agent.orbitRing}
                  </span>
                </div>

                <h2 className="mt-4 font-display text-xl font-bold text-white">
                  {agent.role}
                </h2>
                <p className="mt-1 text-xs text-[#F47735]">
                  {agent.name} • {agent.department}
                </p>

                <ul className="mt-4 space-y-2 text-sm text-[#A1A1AA]">
                  {agent.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-2">
                      <Cpu className="mt-1 h-3.5 w-3.5 shrink-0 text-[#F47735]" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-[#A1A1AA]">
                  <Shield className="h-3 w-3 text-[#F47735]" />
                  Scoped Permissions
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {agent.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="rounded border border-white/10 bg-[#080808] px-2 py-0.5 font-mono text-[10px] text-white/80"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}