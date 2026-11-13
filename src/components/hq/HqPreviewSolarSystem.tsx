"use client";

import React, { useState } from "react";
import { Cpu, ArrowUpRight, Terminal, Sparkles } from "lucide-react";
import { AUTONOMOUS_AGENTS, DepartmentAgent } from "@/data/xavanData";
import { TelemetryBadge, XavanButton } from "@/components/ui/XavanPrimitives";

export function HqPreviewSolarSystem() {
  const [selectedAgent, setSelectedAgent] = useState<DepartmentAgent>(
    AUTONOMOUS_AGENTS[0]
  );
  const [activeRingFilter, setActiveRingFilter] = useState<number | "ALL">("ALL");

  const visibleAgents =
    activeRingFilter === "ALL"
      ? AUTONOMOUS_AGENTS
      : AUTONOMOUS_AGENTS.filter((a) => a.orbitRing === activeRingFilter);

  return (
    <div className="rounded-3xl border border-white/10 bg-[#101010] p-4 sm:p-8 shadow-glass">
      {/* Top Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <TelemetryBadge
            label="Simulation Preview • Connect Redis/PostgreSQL for Live Events"
            status="simulation"
          />
          <span className="font-mono text-xs text-[#A1A1AA]">
            12 DEPARTMENTS REGISTERED
          </span>
        </div>

        <div className="flex items-center gap-2">
          {(["ALL", 1, 2, 3] as const).map((ring) => (
            <button
              key={String(ring)}
              type="button"
              onClick={() => setActiveRingFilter(ring)}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
                activeRingFilter === ring
                  ? "bg-[#F47735] text-[#080808] font-semibold"
                  : "bg-[#181818] text-[#A1A1AA] hover:text-white border border-white/10"
              }`}
            >
              {ring === "ALL" ? "All Orbits" : `Orbit ${ring}`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Orbital Solar System Visualization */}
        <div className="relative flex min-h-[440px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#080808] bg-grid-pattern p-6 lg:col-span-7">
          {/* Concentric Orbit Rings */}
          <div className="pointer-events-none absolute h-[220px] w-[220px] rounded-full border border-[#F47735]/25" />
          <div className="pointer-events-none absolute h-[340px] w-[340px] rounded-full border border-white/10 border-dashed" />
          <div className="pointer-events-none absolute h-[450px] w-[450px] rounded-full border border-white/5 hidden sm:block" />

          {/* Central Intelligence Core */}
          <div className="relative z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full border-2 border-[#F47735] bg-[#101010] text-center shadow-orange-glow">
            <Cpu className="h-7 w-7 text-[#F47735]" />
            <span className="mt-1 font-display text-[10px] font-bold tracking-widest text-white">
              XAVANXAI
            </span>
            <span className="font-mono text-[8px] uppercase text-[#F47735]">
              CORE BUS
            </span>
          </div>

          {/* Interactive Department Nodes Grid */}
          <div className="relative z-20 mt-8 grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
            {visibleAgents.map((agent) => {
              const isSelected = selectedAgent.id === agent.id;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgent(agent)}
                  className={`group flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                    isSelected
                      ? "border-[#F47735] bg-[#F47735]/15 shadow-orange-subtle"
                      : "border-white/10 bg-[#101010]/90 hover:border-white/25"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-mono text-[10px] text-[#F47735]">
                      {agent.codeName}
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isSelected ? "bg-[#F47735] animate-ping" : "bg-emerald-400/70"
                      }`}
                    />
                  </div>
                  <span className="mt-1.5 line-clamp-1 font-display text-xs font-semibold text-white">
                    {agent.role.replace(" Agent", "")}
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-[11px] text-[#A1A1AA]">
                    {agent.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Agent Inspector Panel */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#181818] p-6 lg:col-span-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-md border border-[#F47735]/30 bg-[#F47735]/10 px-2.5 py-1 font-mono text-xs text-[#F47735]">
                {selectedAgent.codeName}
              </span>
              <span className="font-mono text-xs text-[#A1A1AA]">
                ORBIT RING 0{selectedAgent.orbitRing}
              </span>
            </div>

            <h3 className="mt-4 font-display text-2xl font-bold text-white">
              {selectedAgent.role}
            </h3>
            <p className="mt-1 text-sm text-[#F47735]">
              Codename: {selectedAgent.name} • {selectedAgent.department}
            </p>

            {/* Sample Orchestration Flow */}
            <div className="mt-5 rounded-xl border border-white/10 bg-[#080808] p-4">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#A1A1AA]">
                <Terminal className="h-3.5 w-3.5 text-[#F47735]" />
                Orchestration Blueprint
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/90">
                {selectedAgent.sampleWorkflow}
              </p>
            </div>

            {/* Core Capabilities */}
            <div className="mt-5">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#A1A1AA]">
                Autonomous Capabilities
              </h4>
              <ul className="mt-2.5 space-y-2">
                {selectedAgent.capabilities.map((cap) => (
                  <li
                    key={cap}
                    className="flex items-start gap-2 text-xs text-white/90"
                  >
                    <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#F47735]" />
                    <span>{cap}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Permission Sandbox */}
            <div className="mt-5">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#A1A1AA]">
                Scoped Tool Permissions (Zero-Trust RBAC)
              </h4>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedAgent.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="rounded-md border border-white/10 bg-[#101010] px-2 py-1 font-mono text-[11px] text-[#A1A1AA]"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <XavanButton
              variant="primary"
              href="/ai-headquarters"
              className="w-full"
            >
              Launch Full 3D AI Headquarters
              <ArrowUpRight className="h-4 w-4" />
            </XavanButton>
          </div>
        </div>
      </div>
    </div>
  );
}