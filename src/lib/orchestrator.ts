import { prisma } from "@/lib/prisma";
import { AgentStatus, Prisma } from "@prisma/client";

export interface DispatchTaskInput {
  agentCodeName: string;
  taskSummary: string;
  inputPayload: Record<string, unknown>;
  requestedTool?: string;
  actorUserId: string;
}

const SENSITIVE_TOOLS = new Set([
  "email:send_external",
  "hiring:send_decision_email",
  "session:revoke_suspicious",
  "n8n:trigger_production_webhook",
  "crm:bulk_update",
]);

// Approximate token pricing per 1M tokens for transparent cost tracking
const MODEL_RATES_USD_PER_1M: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "claude-3-5-sonnet-latest": { input: 3.0, output: 15.0 },
};

export function validateToolPermission(
  allowedTools: string[],
  requestedTool?: string
): { permitted: boolean; requiresApproval: boolean; reason?: string } {
  if (!requestedTool) {
    return { permitted: true, requiresApproval: false };
  }

  if (!allowedTools.includes(requestedTool)) {
    return {
      permitted: false,
      requiresApproval: false,
      reason: `SECURITY VIOLATION: Tool "${requestedTool}" is not in agent's explicit RBAC whitelist.`,
    };
  }

  return {
    permitted: true,
    requiresApproval: SENSITIVE_TOOLS.has(requestedTool),
  };
}

async function invokeLlmAdapter(params: {
  provider: string;
  model: string;
  systemPrompt: string;
  userContent: string;
}): Promise<{
  ok: boolean;
  outputText?: string;
  tokensUsed: number;
  estimatedCostUsd: number;
  error?: string;
}> {
  const { provider, model, systemPrompt, userContent } = params;

  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        ok: false,
        tokensUsed: 0,
        estimatedCostUsd: 0,
        error:
          "OPENAI_API_KEY is not configured in server environment variables. Execution halted safely without fabricating output.",
      };
    }

    let res: Response;
    try {
      res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || "gpt-4o",
          temperature: 0.2,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
        }),
        signal: AbortSignal.timeout(60_000),
      });
    } catch (err) {
      return {
        ok: false,
        tokensUsed: 0,
        estimatedCostUsd: 0,
        error: `OpenAI request failed: ${
          err instanceof Error ? err.message : "network error"
        }`,
      };
    }

    if (!res.ok) {
      const errText = await res.text();
      return {
        ok: false,
        tokensUsed: 0,
        estimatedCostUsd: 0,
        error: `OpenAI Provider Error (${res.status}): ${errText.slice(0, 240)}`,
      };
    }

    const data = await res.json();
    const promptTokens = data.usage?.prompt_tokens ?? 0;
    const completionTokens = data.usage?.completion_tokens ?? 0;
    const totalTokens = promptTokens + completionTokens;
    const rate = MODEL_RATES_USD_PER_1M[model] || MODEL_RATES_USD_PER_1M["gpt-4o"];
    const cost =
      (promptTokens / 1_000_000) * rate.input +
      (completionTokens / 1_000_000) * rate.output;

    return {
      ok: true,
      outputText: data.choices?.[0]?.message?.content ?? "",
      tokensUsed: totalTokens,
      estimatedCostUsd: Number(cost.toFixed(6)),
    };
  }

  return {
    ok: false,
    tokensUsed: 0,
    estimatedCostUsd: 0,
    error: `Unsupported or unconfigured LLM provider "${provider}".`,
  };
}

export async function dispatchAgentTask(input: DispatchTaskInput) {
  const agent = await prisma.agent.findUnique({
    where: { codeName: input.agentCodeName },
    include: { department: true },
  });

  if (!agent) {
    throw new Error(`Agent ${input.agentCodeName} not found in registry.`);
  }

  if (agent.status === AgentStatus.PAUSED) {
    throw new Error(
      `Agent ${agent.codeName} (${agent.name}) is currently PAUSED by an administrator.`
    );
  }

  // 1. Zero-Trust Tool Sandbox Check
  const permCheck = validateToolPermission(
    agent.allowedTools,
    input.requestedTool
  );

  if (!permCheck.permitted) {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorUserId,
        action: "AGENT_TOOL_PERMISSION_DENIED",
        resource: `agent:${agent.codeName}`,
        metadata: {
          requestedTool: input.requestedTool,
          reason: permCheck.reason,
        },
      },
    });
    throw new Error(permCheck.reason);
  }

  // 2. If action requires Human Approval Gate, queue in BLOCKED state first
  if (permCheck.requiresApproval) {
    const gatedExecution = await prisma.agentExecution.create({
      data: {
        agentId: agent.id,
        taskSummary: input.taskSummary,
        inputPayload: {
          ...input.inputPayload,
          requestedTool: input.requestedTool ?? null,
        } as Prisma.InputJsonObject,
        requiresApproval: true,
        status: "BLOCKED",
      },
    });

    await prisma.agent.update({
      where: { id: agent.id },
      data: { status: AgentStatus.AWAITING_APPROVAL },
    });

    await prisma.auditLog.create({
      data: {
        actorId: input.actorUserId,
        action: "AGENT_EXECUTION_QUEUED_FOR_APPROVAL",
        resource: `execution:${gatedExecution.id}`,
        metadata: { agentCode: agent.codeName, tool: input.requestedTool },
      },
    });

    return gatedExecution;
  }

  // 3. Create RUNNING execution record
  const execution = await prisma.agentExecution.create({
    data: {
      agentId: agent.id,
      taskSummary: input.taskSummary,
      inputPayload: input.inputPayload as Prisma.InputJsonObject,
      requiresApproval: false,
      status: "RUNNING",
    },
  });

  await prisma.agent.update({
    where: { id: agent.id },
    data: { status: AgentStatus.EXECUTING },
  });

  // 4. Execute LLM Reasoning inside Department Context
  const systemPrompt = [
    `You are ${agent.name} (${agent.codeName}), the ${agent.roleTitle} in the ${agent.department.name} department at XavanXAI.`,
    `Authorized tools: ${agent.allowedTools.join(", ")}.`,
    `Provide a concise, structured, enterprise-grade operational output. Never fabricate external facts or unverified metrics.`,
  ].join("\n");

  const llmResult = await invokeLlmAdapter({
    provider: agent.llmProvider,
    model: agent.llmModel,
    systemPrompt,
    userContent: `Task: ${input.taskSummary}\nContext Payload: ${JSON.stringify(
      input.inputPayload
    )}`,
  });

  if (!llmResult.ok) {
    const failed = await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: "FAILED",
        outputPayload: { error: llmResult.error },
        completedAt: new Date(),
      },
    });

    await prisma.agent.update({
      where: { id: agent.id },
      data: {
        status: AgentStatus.ERROR,
        tasksFailed: { increment: 1 },
      },
    });

    return failed;
  }

  const completed = await prisma.agentExecution.update({
    where: { id: execution.id },
    data: {
      status: "COMPLETED",
      outputPayload: { result: llmResult.outputText },
      tokensUsed: llmResult.tokensUsed,
      estimatedCostUsd: llmResult.estimatedCostUsd,
      completedAt: new Date(),
    },
  });

  await prisma.agent.update({
    where: { id: agent.id },
    data: {
      status: AgentStatus.IDLE,
      tasksCompleted: { increment: 1 },
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: input.actorUserId,
      action: "AGENT_EXECUTION_COMPLETED",
      resource: `execution:${completed.id}`,
      metadata: {
        agentCode: agent.codeName,
        tokensUsed: llmResult.tokensUsed,
        costUsd: llmResult.estimatedCostUsd,
      },
    },
  });

  return completed;
}