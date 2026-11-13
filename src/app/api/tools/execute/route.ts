import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AI_TOOLS_MARKETPLACE } from "@/data/xavanData";
import { rateLimit } from "@/lib/rateLimit";

const ToolExecuteSchema = z.object({
  toolId: z.string().min(2),
  promptInput: z.string().min(5, "Please provide input details.").max(8000),
});

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      { error: "Please sign in to your XavanXAI workspace to execute AI tools." },
      { status: 401 }
    );
  }

  const rl = rateLimit(`tool:${session.userId}`, 15, 10 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Tool rate limit reached. Please wait a few minutes." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = ToolExecuteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid tool input" },
        { status: 400 }
      );
    }

    const tool = AI_TOOLS_MARKETPLACE.find((t) => t.id === parsed.data.toolId);
    if (!tool) {
      return NextResponse.json({ error: "Tool not found." }, { status: 404 });
    }

    if (tool.status !== "LIVE_API_READY") {
      return NextResponse.json(
        { error: `${tool.name} is scheduled for an upcoming release.` },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is not configured in server .env. Add your API key to run live tool inference.",
        },
        { status: 503 }
      );
    }

    const systemPrompt = [
      `You are the XavanXAI ${tool.name} (${tool.category}).`,
      `Purpose: ${tool.description}`,
      "Deliver clear, structured, actionable Markdown output tailored for enterprise execution. Never invent external facts or unverified metrics.",
    ].join("\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.25,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: parsed.data.promptInput },
        ],
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream AI provider error (${res.status}).` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const output = data.choices?.[0]?.message?.content || "";
    const tokensUsed = data.usage?.total_tokens ?? 0;

    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "AI_TOOL_EXECUTED",
          resource: `tool:${tool.id}`,
          metadata: { toolName: tool.name, tokensUsed },
        },
      });
    } catch {
      // Non-blocking audit write
    }

    return NextResponse.json({
      ok: true,
      toolName: tool.name,
      output,
      tokensUsed,
    });
  } catch (err) {
    console.error("[AI_TOOL_EXECUTE_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to execute AI tool." },
      { status: 500 }
    );
  }
}