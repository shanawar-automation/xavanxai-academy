import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TurnSchema = z.object({
  candidateUtterance: z.string().max(6000),
  elapsedSeconds: z.number().min(0).max(3600),
  isSilencePrompt: z.boolean().optional(),
  transcriptHistory: z.array(
    z.object({
      speaker: z.enum(["AI", "CANDIDATE"]),
      text: z.string(),
      stage: z.string(),
      timestamp: z.string(),
    })
  ),
});

function resolveInterviewStage(elapsedSeconds: number): {
  stageName: string;
  stageGoal: string;
} {
  if (elapsedSeconds < 180) {
    return {
      stageName: "01. Introduction (0-3 min)",
      stageGoal:
        "Welcome the candidate warmly, briefly explain the 30-minute structure, and ask an ice-breaker question about their engineering background.",
    };
  }
  if (elapsedSeconds < 480) {
    return {
      stageName: "02. CV & Experience Discussion (3-8 min)",
      stageGoal:
        "Ask specific, evidence-grounded follow-up questions about projects and roles listed in their parsed CV.",
    };
  }
  if (elapsedSeconds < 1080) {
    return {
      stageName: "03. Technical Questions (8-18 min)",
      stageGoal:
        "Assess core technical depth required for the role. Adapt difficulty dynamically based on their previous answer; ask for clarification if an answer is incomplete.",
    };
  }
  if (elapsedSeconds < 1500) {
    return {
      stageName: "04. Practical Problem-Solving (18-25 min)",
      stageGoal:
        "Present a realistic system-design or debugging scenario relevant to the position and evaluate their architectural trade-offs.",
    };
  }
  if (elapsedSeconds < 1680) {
    return {
      stageName: "05. Communication & Situational (25-28 min)",
      stageGoal:
        "Explore cross-team collaboration, handling production incidents, and technical communication clarity.",
    };
  }
  return {
    stageName: "06. Candidate Questions & Closing (28-30 min)",
    stageGoal:
      "Invite the candidate to ask questions about XavanXAI, explain the human recruiter review timeline, and conclude professionally.",
  };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;

  try {
    const body = await req.json();
    const parsed = TurnSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid turn payload" }, { status: 400 });
    }

    // Lookup application or interview session
    const application = await prisma.application.findFirst({
      where: {
        OR: [{ id: sessionId }, { interviewSession: { id: sessionId } }],
        candidateId: session.userId,
      },
      include: {
        job: true,
        interviewSession: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Interview session not found for authenticated candidate." },
        { status: 404 }
      );
    }

    const stage = resolveInterviewStage(parsed.data.elapsedSeconds);

    // Handle gentle silence check-in without assuming inability
    if (parsed.data.isSilencePrompt) {
      return NextResponse.json({
        ok: true,
        stage: stage.stageName,
        aiMessage:
          "Take your time—there is no rush. Would you like me to rephrase the question, or are you ready to share your thoughts whenever you're comfortable?",
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is not configured on the server. Add your key in .env to enable live conversational AI interviewing.",
        },
        { status: 503 }
      );
    }

    const systemPrompt = [
      "You are Athena, Principal Technical Interviewer at XavanXAI.",
      `Position: ${application.job.title} (${application.job.department}).`,
      `Job Requirements: ${JSON.stringify(application.job.requirements)}`,
      `Verified Candidate CV Profile: ${JSON.stringify(application.parsedProfile || {})}`,
      `Current Interview Stage: ${stage.stageName} — ${stage.stageGoal}`,
      "STRICT INTERVIEWER CONDUCT:",
      "- Speak naturally like a senior human engineer: concise (2-4 sentences per turn), encouraging, and sharp.",
      "- Ask ONE clear question at a time. Never repeat questions already answered in transcriptHistory.",
      "- If an answer is partial or ambiguous, ask a targeted follow-up before moving on.",
      "- Never judge or comment on speech speed, accent, pauses, or personal background.",
    ].join("\n");

    const messages = [
      { role: "system", content: systemPrompt },
      ...parsed.data.transcriptHistory.slice(-14).map((t) => ({
        role: t.speaker === "AI" ? ("assistant" as const) : ("user" as const),
        content: t.text,
      })),
      ...(parsed.data.candidateUtterance.trim()
        ? [{ role: "user" as const, content: parsed.data.candidateUtterance }]
        : [
            {
              role: "user" as const,
              content:
                "[Session Started] Please introduce yourself and begin Stage 01.",
            },
          ]),
    ];

    const llmRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.35,
        max_tokens: 280,
        messages,
      }),
    });

    if (!llmRes.ok) {
      return NextResponse.json(
        { error: `AI Voice Reasoning Gateway error (${llmRes.status}).` },
        { status: 502 }
      );
    }

    const data = await llmRes.json();
    const aiMessage =
      data.choices?.[0]?.message?.content?.trim() ||
      "Could you walk me through your architectural approach to that problem?";

    // Persist running transcript in InterviewSession
    const updatedTranscript = [
      ...parsed.data.transcriptHistory,
      ...(parsed.data.candidateUtterance.trim()
        ? [
            {
              speaker: "CANDIDATE",
              text: parsed.data.candidateUtterance.trim(),
              stage: stage.stageName,
              timestamp: new Date().toISOString(),
            },
          ]
        : []),
      {
        speaker: "AI",
        text: aiMessage,
        stage: stage.stageName,
        timestamp: new Date().toISOString(),
      },
    ];

    await prisma.interviewSession.upsert({
      where: { applicationId: application.id },
      update: { transcript: updatedTranscript },
      create: {
        applicationId: application.id,
        scheduledFor: new Date(),
        transcript: updatedTranscript,
      },
    });

    return NextResponse.json({
      ok: true,
      stage: stage.stageName,
      aiMessage,
    });
  } catch (err) {
    console.error("[INTERVIEW_TURN_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to process interview turn." },
      { status: 500 }
    );
  }
}