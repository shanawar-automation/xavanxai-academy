import { NextResponse } from "next/server";
import { z } from "zod";
import { AUTONOMOUS_AGENTS, SERVICES_CATALOG } from "@/data/xavanData";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .min(1)
    .max(40),
});

export async function POST(req: Request) {
  const rl = rateLimit(`chat:${clientIp(req)}`, 20, 5 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "You're sending messages quickly — please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = ChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid chat message" }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        ok: true,
        reply:
          "I am Lyra Concierge (XVN-COM-04), XavanXAI's Client Communication Agent. Live LLM inference requires OPENAI_API_KEY in .env, but you can explore our 12 Autonomous Departments at /ai-headquarters, test Talent Intelligence at /recruitment, or schedule a discovery session at /book-consultation.",
      });
    }

    const systemPrompt = [
      "You are Lyra Concierge (XVN-COM-04), the official AI Voice & Chat Company Assistant for XavanXAI.",
      "Your role: explain XavanXAI's autonomous multi-agent architecture, services, AI tools, and XavanXAI Talent Intelligence recruitment platform; qualify project needs; and guide visitors to /book-consultation or human specialists (operations@xavanxai.com) for complex enterprise RFPs.",
      `Services: ${SERVICES_CATALOG.map((s) => s.title).join(", ")}.`,
      `12 Agent Departments: ${AUTONOMOUS_AGENTS.map((a) => `${a.role} (${a.department})`).join(", ")}.`,
      "Keep answers concise (2-4 sentences), authoritative, and helpful.",
    ].join("\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 260,
        messages: [
          { role: "system", content: systemPrompt },
          ...parsed.data.messages.slice(-10),
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Assistant inference temporarily unavailable." },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      ok: true,
      reply: data.choices?.[0]?.message?.content || "",
    });
  } catch {
    return NextResponse.json(
      { error: "Assistant request failed." },
      { status: 500 }
    );
  }
}