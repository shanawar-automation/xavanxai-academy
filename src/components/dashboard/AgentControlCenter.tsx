"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Play,
  Pause,
  Send,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Cpu,
  DollarSign,
} from "lucide-react";
import { XavanButton } from "@/components/ui/XavanPrimitives";

export interface ControlAgentRecord {
  id: string;
  codeName: string;
  name: string;
  roleTitle: string;
  departmentName: string;
  status: string;
  llmProvider: string;
  llmModel: string;
  allowedTools: string[];
  tasksCompleted: number;
  tasksFailed: number;
}

export interface ControlExecutionRecord {
  id: string;
  agentCode: string;
  agentName: string;
  taskSummary: string;
  status: string;
  requiresApproval: boolean;
  tokensUsed: number;
  estimatedCostUsd: number;
  outputPayload: unknown;
  startedAt: string;
}

export function AgentControlCenter({
  agents,
  executions,
}: {
  agents: ControlAgentRecord[];
  executions: ControlExecutionRecord[];
}) {
  const router = useRouter();
  const [selectedCode, setSelectedCode] = useState(
    agents[0]?.codeName || "XVN-CEO-01"
  );
  const [taskSummary, setTaskSummary] = useState("");
  const [contextNotes, setContextNotes] = useState("");
  const [requestedTool, setRequestedTool] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const selectedAgent = agents.find((a) => a.codeName === selectedCode);

  const totalTokens = executions.reduce((acc, e) => acc + e.tokensUsed, 0);
  const totalCost = executions.reduce((acc, e) => acc + e.estimatedCostUsd, 0);
  const approvalQueue = executions.filter(
    (e) => e.requiresApproval && e.status === "BLOCKED"
  );

  async function handleDispatch(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/agents/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentCodeName: selectedCode,
          taskSummary,
          contextNotes,
          requestedTool: requestedTool || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "err", text: data.error || "Dispatch failed." });
      } else {
        setFeedback({
          type: "ok",
          text:
            data.execution?.status === "BLOCKED"
              ? "Task queued in Human Approval Gate prior to sensitive tool execution."
              : `Task executed with status: ${data.execution?.status}.`,
        });
        setTaskSummary("");
        setContextNotes("");
        router.refresh();
      }
    } catch {
      setFeedback({ type: "err", text: "Network error dispatching task." });
    } finally {
      setSubmitting(false);
    }
  }

  async function togglePause(agent: ControlAgentRecord) {
    const nextStatus = agent.status === "PAUSED" ? "IDLE" : "PAUSED";
    await fetch(`/api/agents/${agent.codeName}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    router.refresh();
  }

  async function handleApprovalDecision(
    executionId: string,
    decision: "APPROVE" | "REJECT" | "RETRY"
  ) {
    await fetch(`/api/agents/executions/${executionId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      {/* Top Token & Cost Governance KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#101010] p-5">
          <div className="flex items-center justify-between font-mono text-xs text-[#A1A1AA]">
            <span>TOTAL TOKENS LOGGED</span>
            <Cpu className="h-4 w-4 text-[#F47735]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-white">
            {totalTokens.toLocaleString()}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101010] p-5">
          <div className="flex items-center justify-between font-mono text-xs text-[#A1A1AA]">
            <span>ESTIMATED LLM SPEND</span>
            <DollarSign className="h-4 w-4 text-[#F47735]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-white">
            ${totalCost.toFixed(4)}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#101010] p-5">
          <div className="flex items-center justify-between font-mono text-xs text-[#A1A1AA]">
            <span>HUMAN APPROVAL QUEUE</span>
            <ShieldAlert className="h-4 w-4 text-[#F47735]" />
          </div>
          <div className="mt-2 font-display text-2xl font-bold text-[#F47735]">
            {approvalQueue.length}
          </div>
        </div>
      </div>

      {/* Human-in-the-Loop Approval Gate Banner */}
      {approvalQueue.length > 0 && (
        <div className="rounded-2xl border border-[#F47735]/50 bg-[#F47735]/10 p-6">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
            <ShieldAlert className="h-5 w-5 text-[#F47735]" />
            Pending Human Approval Gates ({approvalQueue.length})
          </h2>
          <div className="mt-4 space-y-3">
            {approvalQueue.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-4 rounded-xl border border-white/10 bg-[#080808] p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <span className="font-mono text-xs text-[#F47735]">
                    {item.agentCode} • {item.agentName}
                  </span>
                  <p className="mt-1 text-sm font-medium text-white">
                    {item.taskSummary}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprovalDecision(item.id, "APPROVE")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-[#080808]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprovalDecision(item.id, "REJECT")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Dispatcher Form */}
      <div className="rounded-2xl border border-white/10 bg-[#101010] p-6">
        <h2 className="font-display text-xl font-bold text-white">
          Dispatch Orchestrated Agent Task
        </h2>
        <p className="mt-1 text-xs text-[#A1A1AA]">
          Tasks execute inside the selected agent&apos;s RBAC permission sandbox
          and write immutable audit logs.
        </p>

        {feedback && (
          <div
            className={`mt-4 rounded-xl border p-3.5 text-xs ${
              feedback.type === "ok"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleDispatch} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
              Target Autonomous Agent
            </label>
            <select
              value={selectedCode}
              onChange={(e) => {
                setSelectedCode(e.target.value);
                setRequestedTool("");
              }}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white focus:border-[#F47735] focus:outline-none"
            >
              {agents.map((a) => (
                <option key={a.codeName} value={a.codeName}>
                  {a.codeName} — {a.roleTitle} ({a.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
              Scoped Tool Invocation (Optional)
            </label>
            <select
              value={requestedTool}
              onChange={(e) => setRequestedTool(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white focus:border-[#F47735] focus:outline-none"
            >
              <option value="">Reasoning Only (No External Tool)</option>
              {selectedAgent?.allowedTools.map((tool) => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
              Task Directive
            </label>
            <input
              type="text"
              required
              value={taskSummary}
              onChange={(e) => setTaskSummary(e.target.value)}
              placeholder="e.g., Audit Q4 enterprise onboarding latency and synthesize 3 architectural recommendations"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white focus:border-[#F47735] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
              Structured Context Payload (Optional)
            </label>
            <textarea
              rows={2}
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="Provide JSON or structured context for the agent..."
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white focus:border-[#F47735] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2 flex justify-end">
            <XavanButton type="submit" variant="primary" disabled={submitting}>
              <Send className="h-4 w-4" />
              {submitting ? "Executing in Sandbox..." : "Dispatch Task"}
            </XavanButton>
          </div>
        </form>
      </div>

      {/* Agent Registry & Governance Table */}
      <div className="rounded-2xl border border-white/10 bg-[#101010] p-6">
        <h2 className="font-display text-xl font-bold text-white">
          Agent Registry &amp; Sandbox Controls
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 font-mono uppercase text-[#A1A1AA]">
              <tr>
                <th className="py-3 pr-4">Agent</th>
                <th className="py-3 pr-4">Model</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Done / Fail</th>
                <th className="py-3 text-right">Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {agents.map((agent) => (
                <tr key={agent.codeName}>
                  <td className="py-3.5 pr-4">
                    <div className="font-mono text-[#F47735]">
                      {agent.codeName}
                    </div>
                    <div className="font-semibold text-white">
                      {agent.roleTitle}
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-[#A1A1AA]">
                    {agent.llmProvider}/{agent.llmModel}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] ${
                        agent.status === "PAUSED"
                          ? "bg-amber-500/15 text-amber-300"
                          : agent.status === "ERROR"
                          ? "bg-red-500/15 text-red-300"
                          : "bg-emerald-500/15 text-emerald-300"
                      }`}
                    >
                      {agent.status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-white">
                    {agent.tasksCompleted} / {agent.tasksFailed}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => togglePause(agent)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#080808] px-3 py-1.5 font-mono text-xs text-white hover:border-[#F47735]"
                    >
                      {agent.status === "PAUSED" ? (
                        <>
                          <Play className="h-3 w-3 text-emerald-400" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="h-3 w-3 text-amber-400" />
                          Pause
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execution Audit Logs */}
      <div className="rounded-2xl border border-white/10 bg-[#101010] p-6">
        <h2 className="font-display text-xl font-bold text-white">
          Execution Audit Logs
        </h2>
        {executions.length === 0 ? (
          <p className="mt-3 text-xs text-[#A1A1AA]">
            No executions recorded yet. Dispatch a task above to create your
            first audited agent execution.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {executions.map((ex) => (
              <div
                key={ex.id}
                className="rounded-xl border border-white/10 bg-[#080808] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#F47735]">
                    {ex.agentCode} • {ex.status} • {ex.tokensUsed} tokens ($
                    {ex.estimatedCostUsd.toFixed(4)})
                  </span>
                  {ex.status === "FAILED" && (
                    <button
                      type="button"
                      onClick={() => handleApprovalDecision(ex.id, "RETRY")}
                      className="inline-flex items-center gap-1 rounded border border-white/10 px-2.5 py-1 font-mono text-[11px] text-white hover:border-[#F47735]"
                    >
                      <RotateCcw className="h-3 w-3 text-[#F47735]" />
                      Retry Task
                    </button>
                  )}
                </div>
                <p className="mt-1.5 text-sm font-medium text-white">
                  {ex.taskSummary}
                </p>
                {ex.outputPayload !== null && (
                  <pre className="mt-2.5 max-h-40 overflow-auto rounded-lg border border-white/5 bg-[#101010] p-3 font-mono text-[11px] text-[#A1A1AA]">
                    {JSON.stringify(ex.outputPayload, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}