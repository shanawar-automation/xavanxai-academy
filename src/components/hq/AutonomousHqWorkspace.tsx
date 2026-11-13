"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  Cpu,
  Layers,
  Network,
  BarChart3,
  Terminal,
  ShieldCheck,
  Play,
  Pause,
  Smartphone,
} from "lucide-react";
import { AUTONOMOUS_AGENTS } from "@/data/xavanData";
import { TelemetryBadge, XavanButton } from "@/components/ui/XavanPrimitives";
import type { LiveAgentNode } from "./HqThreeCanvas";

const HqThreeCanvas = dynamic(
  () => import("./HqThreeCanvas").then((mod) => mod.HqThreeCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[520px] w-full items-center justify-center rounded-2xl border border-white/10 bg-[#080808] font-mono text-xs text-[#A1A1AA]">
        INITIALIZING 3D INTELLIGENCE CORE...
      </div>
    ),
  }
);

type OfficeMode =
  | "OVERVIEW"
  | "DEPARTMENT"
  | "AGENT_DETAILS"
  | "WORKFLOW"
  | "LIVE_ACTIVITY"
  | "ANALYTICS";

const SIMULATED_TRANSFERS = [
  { fromId: "ceo", toId: "research", label: "Market Benchmark Request" },
  { fromId: "lead-gen", toId: "client-comms", label: "Qualified Enterprise Lead" },
  { fromId: "recruitment", toId: "qa", label: "Verify Interview Evidence Schema" },
  { fromId: "development", toId: "security", label: "Audit PR Diff & RBAC Rules" },
  { fromId: "automation", toId: "finance", label: "Log Workflow Token Spend" },
];

export function AutonomousHqWorkspace() {
  const [mode, setMode] = useState<OfficeMode>("OVERVIEW");
  const [telemetryMode, setTelemetryMode] = useState<"LIVE_BACKEND" | "SIMULATION">("SIMULATION");
  const [telemetryReason, setTelemetryReason] = useState<string>(
    "Checking backend telemetry stream..."
  );
  const [agents, setAgents] = useState<LiveAgentNode[]>(() =>
    AUTONOMOUS_AGENTS.map((a) => ({
      ...a,
      status: "IDLE",
      tasksCompleted: 0,
      tasksFailed: 0,
      activeTask: null,
    }))
  );
  const [selectedAgentId, setSelectedAgentId] = useState<string>("ceo");
  const [recentLogs, setRecentLogs] = useState<
    Array<{
      id: string;
      agentCode: string;
      agentName: string;
      summary: string;
      status: string;
      timestamp: string;
    }>
  >([]);
  const [transferIdx, setTransferIdx] = useState(0);
  const [pausedOrbit, setPausedOrbit] = useState(false);
  const [use2DFallback, setUse2DFallback] = useState(false);

  // Detect low-power devices for lightweight fallback
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      navigator.hardwareConcurrency &&
      navigator.hardwareConcurrency <= 4
    ) {
      setUse2DFallback(true);
    }
  }, []);

  // Fetch initial status & subscribe to SSE stream
  useEffect(() => {
    let active = true;

    async function loadInitialStatus() {
      try {
        const res = await fetch("/api/agents/status");
        if (!res.ok || !active) return;
        const data = await res.json();
        setTelemetryMode(data.mode);
        setTelemetryReason(data.reason);
        if (Array.isArray(data.agents) && data.agents.length > 0) {
          setAgents(data.agents);
        }
        if (Array.isArray(data.recentLogs)) {
          setRecentLogs(data.recentLogs);
        }
      } catch {
        if (active) {
          setTelemetryMode("SIMULATION");
          setTelemetryReason("Offline preview mode active.");
        }
      }
    }

    loadInitialStatus();

    const eventSource = new EventSource("/api/agents/stream");
    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (!active) return;
        if (payload.mode) setTelemetryMode(payload.mode);
        if (payload.latestEvent) {
          setRecentLogs((prev) => {
            if (prev.some((p) => p.id === payload.latestEvent.id)) return prev;
            return [
              {
                id: payload.latestEvent.id,
                agentCode: payload.latestEvent.agentCode,
                agentName: payload.latestEvent.agentCode,
                summary: payload.latestEvent.summary,
                status: payload.latestEvent.status,
                timestamp: payload.timestamp,
              },
              ...prev.slice(0, 14),
            ];
          });
        }
      } catch {
        // Ignore malformed heartbeat
      }
    };

    return () => {
      active = false;
      eventSource.close();
    };
  }, []);

  // Rotate visual task transfer demonstration when in Simulation Mode
  useEffect(() => {
    if (pausedOrbit) return;
    const timer = setInterval(() => {
      setTransferIdx((prev) => (prev + 1) % SIMULATED_TRANSFERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [pausedOrbit]);

  const selectedAgent =
    agents.find((a) => a.id === selectedAgentId) || agents[0];

  const activeTransfer =
    telemetryMode === "SIMULATION" ? SIMULATED_TRANSFERS[transferIdx] : null;

  const MODES: Array<{ id: OfficeMode; label: string; icon: React.ElementType }> = [
    { id: "OVERVIEW", label: "Overview", icon: Cpu },
    { id: "DEPARTMENT", label: "Departments", icon: Layers },
    { id: "AGENT_DETAILS", label: "Agent Details", icon: ShieldCheck },
    { id: "WORKFLOW", label: "Workflow Bus", icon: Network },
    { id: "LIVE_ACTIVITY", label: "Live Activity", icon: Activity },
    { id: "ANALYTICS", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Command & Transparency Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#101010] p-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <TelemetryBadge
              label={
                telemetryMode === "LIVE_BACKEND"
                  ? "LIVE TELEMETRY • POSTGRESQL + SSE CONNECTED"
                  : "SIMULATION MODE • DEMO VISUALIZATION ONLY"
              }
              status={telemetryMode === "LIVE_BACKEND" ? "live" : "simulation"}
            />
            <span className="font-mono text-xs text-[#A1A1AA]">
              {telemetryReason}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setUse2DFallback(!use2DFallback)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#080808] px-3 py-2 font-mono text-xs text-[#A1A1AA] hover:text-white"
          >
            <Smartphone className="h-3.5 w-3.5 text-[#F47735]" />
            {use2DFallback ? "Switch to 3D WebGL" : "2D Lite Mode"}
          </button>

          <button
            type="button"
            onClick={() => setPausedOrbit(!pausedOrbit)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#080808] px-3 py-2 font-mono text-xs text-[#A1A1AA] hover:text-white"
          >
            {pausedOrbit ? (
              <>
                <Play className="h-3.5 w-3.5 text-[#F47735]" />
                Resume Bus
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 text-[#F47735]" />
                Pause Bus
              </>
            )}
          </button>
        </div>
      </div>

      {/* 6 Interactive Office Mode Switcher */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = mode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all ${
                active
                  ? "bg-[#F47735] text-[#080808] font-semibold shadow-orange-subtle"
                  : "border border-white/10 bg-[#101010] text-[#A1A1AA] hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left 8 Cols: 3D Solar System or 2D Lite Grid */}
        <div className="lg:col-span-8">
          {!use2DFallback ? (
            <HqThreeCanvas
              agents={agents}
              selectedAgentId={selectedAgent.id}
              onSelectAgent={(a) => setSelectedAgentId(a.id)}
              activeTransfer={activeTransfer}
              pausedOrbit={pausedOrbit}
            />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#080808] p-6">
              <div className="mb-4 font-mono text-xs text-[#F47735]">
                LIGHTWEIGHT 2D TACTICAL VIEW (BATTERY / MOBILE OPTIMIZED)
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      agent.id === selectedAgent.id
                        ? "border-[#F47735] bg-[#F47735]/15"
                        : "border-white/10 bg-[#101010]"
                    }`}
                  >
                    <div className="font-mono text-[10px] text-[#F47735]">
                      {agent.codeName}
                    </div>
                    <div className="mt-1 font-display text-sm font-bold text-white">
                      {agent.role}
                    </div>
                    <div className="text-xs text-[#A1A1AA]">{agent.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode-Specific Bottom Drawer */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#101010] p-6">
            {mode === "OVERVIEW" && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <div className="font-mono text-[11px] text-[#A1A1AA]">
                    TOTAL DEPARTMENTS
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold text-white">
                    {agents.length}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-[#A1A1AA]">
                    COMPLETED TASKS (DB)
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold text-white">
                    {agents.reduce((acc, a) => acc + a.tasksCompleted, 0)}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-[#A1A1AA]">
                    FAILED TASKS (DB)
                  </div>
                  <div className="mt-1 font-display text-2xl font-bold text-white">
                    {agents.reduce((acc, a) => acc + a.tasksFailed, 0)}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[11px] text-[#A1A1AA]">
                    TELEMETRY SOURCE
                  </div>
                  <div className="mt-1 font-mono text-sm font-bold text-[#F47735]">
                    {telemetryMode}
                  </div>
                </div>
              </div>
            )}

            {mode === "DEPARTMENT" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((ring) => (
                  <div
                    key={ring}
                    className="rounded-xl border border-white/10 bg-[#080808] p-4"
                  >
                    <div className="font-mono text-xs text-[#F47735]">
                      ORBIT RING 0{ring}
                    </div>
                    <ul className="mt-2 space-y-1.5 text-xs text-white/90">
                      {agents
                        .filter((a) => a.orbitRing === ring)
                        .map((a) => (
                          <li key={a.id}>• {a.department}</li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {mode === "AGENT_DETAILS" && (
              <div>
                <div className="font-mono text-xs text-[#F47735]">
                  FULL CAPABILITY &amp; SANDBOX MATRIX — {selectedAgent.codeName}
                </div>
                <p className="mt-2 text-sm text-white/90">
                  {selectedAgent.sampleWorkflow}
                </p>
              </div>
            )}

            {mode === "WORKFLOW" && (
              <div className="space-y-2">
                <div className="font-mono text-xs text-[#F47735]">
                  EVENT BUS ROUTING TOPOLOGY
                </div>
                {SIMULATED_TRANSFERS.map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-[#080808] px-3 py-2 font-mono text-xs"
                  >
                    <span className="text-white">
                      {t.fromId.toUpperCase()} → {t.toId.toUpperCase()}
                    </span>
                    <span className="text-[#A1A1AA]">{t.label}</span>
                  </div>
                ))}
              </div>
            )}

            {mode === "LIVE_ACTIVITY" && (
              <div>
                <div className="font-mono text-xs text-[#F47735]">
                  EXECUTION AUDIT STREAM
                </div>
                {recentLogs.length === 0 ? (
                  <p className="mt-2 text-xs text-[#A1A1AA]">
                    No live `AgentExecution` records found in PostgreSQL yet.
                    Dispatch a task from the Admin Agent Control Center in Phase
                    5 to populate real-time execution logs here.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {recentLogs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between rounded-lg border border-white/10 bg-[#080808] px-3 py-2 font-mono text-xs"
                      >
                        <span className="text-[#F47735]">{log.agentCode}</span>
                        <span className="truncate px-3 text-white">
                          {log.summary}
                        </span>
                        <span className="text-emerald-400">{log.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mode === "ANALYTICS" && (
              <div className="text-xs text-[#A1A1AA]">
                <span className="font-mono text-[#F47735]">
                  GOVERNANCE METRICS:
                </span>{" "}
                All token usage, inference latency, and task completion rates
                are aggregated strictly from verified PostgreSQL{" "}
                <code className="font-mono text-white">AgentExecution</code>{" "}
                rows. Zero synthetic KPIs are displayed.
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Selected Agent Profile & Control Inspector */}
        <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#101010] p-6 lg:col-span-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="rounded border border-[#F47735]/35 bg-[#F47735]/10 px-2.5 py-1 font-mono text-xs text-[#F47735]">
                {selectedAgent.codeName}
              </span>
              <span className="font-mono text-xs text-emerald-400">
                STATUS: {selectedAgent.status}
              </span>
            </div>

            <h2 className="mt-4 font-display text-2xl font-bold text-white">
              {selectedAgent.role}
            </h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">
              {selectedAgent.name} • {selectedAgent.department}
            </p>

            <div className="mt-5 rounded-xl border border-white/10 bg-[#080808] p-4">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase text-[#F47735]">
                <Terminal className="h-3.5 w-3.5" />
                Active / Sample Pipeline
              </div>
              <p className="mt-2 text-xs leading-relaxed text-white/90">
                {selectedAgent.activeTask || selectedAgent.sampleWorkflow}
              </p>
            </div>

            <div className="mt-5">
              <h3 className="font-mono text-xs uppercase text-[#A1A1AA]">
                Authorized Capabilities
              </h3>
              <ul className="mt-2 space-y-2 text-xs text-white/90">
                {selectedAgent.capabilities.map((c) => (
                  <li key={c} className="flex items-start gap-2">
                    <span className="text-[#F47735]">→</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5">
              <h3 className="font-mono text-xs uppercase text-[#A1A1AA]">
                Tool Permission Boundaries
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {selectedAgent.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="rounded border border-white/10 bg-[#080808] px-2 py-1 font-mono text-[11px] text-[#A1A1AA]"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5 space-y-2.5">
            <XavanButton
              variant="primary"
              href="/dashboard/agents"
              className="w-full"
            >
              Open Agent Control Center
            </XavanButton>
            <XavanButton
              variant="secondary"
              href="/ai-agents"
              className="w-full"
            >
              View All 12 Department Specs
            </XavanButton>
          </div>
        </div>
      </div>
    </div>
  );
}