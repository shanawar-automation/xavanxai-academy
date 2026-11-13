import { z } from "zod";
import { HiringDecision } from "@prisma/client";

const CategoryItemSchema = z.object({
  category: z.string(),
  scoreOutOf10: z.number().min(0).max(10),
  evidenceQuote: z.string(),
  rationale: z.string(),
});

export const EvaluationReportSchema = z.object({
  categories: z.array(CategoryItemSchema).length(8),
  strengths: z.array(z.string()),
  improvementAreas: z.array(z.string()),
  missingCompetencies: z.array(z.string()),
  interviewSummary: z.string(),
  recommendedFollowUpQuestions: z.array(z.string()),
  aiRecommendation: z.enum([
    "RECOMMENDED_NEXT_STAGE",
    "REQUIRES_HUMAN_REVIEW",
    "NOT_RECOMMENDED",
  ]),
});

export type EvaluationReport = z.infer<typeof EvaluationReportSchema>;

const REQUIRED_8_CATEGORIES = [
  "Technical knowledge",
  "Practical problem-solving",
  "Relevant experience",
  "Understanding of projects",
  "Role-specific skills",
  "Communication clarity",
  "Answer relevance",
  "Professional knowledge",
];

export async function generateInterviewEvaluation(params: {
  jobTitle: string;
  jobRequirements: string[];
  parsedProfile: unknown;
  transcript: Array<{ speaker: string; text: string; stage?: string }>;
}): Promise<{
  ok: boolean;
  report?: EvaluationReport;
  error?: string;
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "OPENAI_API_KEY is not configured. Transcript saved; automated scoring requires API credentials.",
    };
  }

  if (params.transcript.length === 0) {
    return {
      ok: false,
      error: "Transcript is empty; routed directly to REQUIRES_HUMAN_REVIEW.",
    };
  }

  const systemPrompt = [
    "You are the XavanXAI Recruitment Evaluation Analyst.",
    "Generate an explainable, evidence-linked evaluation across the EXACT 8 categories:",
    REQUIRED_8_CATEGORIES.join(", "),
    "STRICT ETHICAL RULES:",
    "1. Every category score (0-10) MUST quote or directly cite actual candidate statements from the transcript.",
    "2. Never treat numerical scores as scientifically objective; frame rationales around observable technical evidence.",
    "3. Never penalize speech speed, accent, pauses, or personal background.",
    "4. Output valid JSON only.",
  ].join("\n");

  const userPrompt = JSON.stringify({
    position: params.jobTitle,
    requirements: params.jobRequirements,
    verifiedCvProfile: params.parsedProfile || {},
    interviewTranscript: params.transcript,
    requiredOutputFormat: {
      categories: REQUIRED_8_CATEGORIES.map((c) => ({
        category: c,
        scoreOutOf10: "number 0-10",
        evidenceQuote: "direct quote or paraphrase from candidate transcript",
        rationale: "clear explanation tied to role requirements",
      })),
      strengths: ["string"],
      improvementAreas: ["string"],
      missingCompetencies: ["string"],
      interviewSummary: "concise executive summary for human recruiter",
      recommendedFollowUpQuestions: ["string"],
      aiRecommendation:
        "RECOMMENDED_NEXT_STAGE | REQUIRES_HUMAN_REVIEW | NOT_RECOMMENDED",
    },
  });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    return { ok: false, error: `Evaluation API error (${res.status}).` };
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;

  try {
    const parsed = EvaluationReportSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return {
        ok: false,
        error: "Evaluation schema validation failed; flagged for human review.",
      };
    }
    return { ok: true, report: parsed.data };
  } catch {
    return { ok: false, error: "Malformed evaluation JSON." };
  }
}

export function mapRecommendationEnum(
  rec?: EvaluationReport["aiRecommendation"]
): HiringDecision {
  if (rec === "RECOMMENDED_NEXT_STAGE") return HiringDecision.RECOMMENDED_NEXT_STAGE;
  if (rec === "NOT_RECOMMENDED") return HiringDecision.NOT_RECOMMENDED;
  return HiringDecision.REQUIRES_HUMAN_REVIEW;
}