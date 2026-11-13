import { z } from "zod";

export const ParsedCvProfileSchema = z.object({
  education: z.array(z.string()),
  technicalSkills: z.array(z.string()),
  workExperience: z.array(
    z.object({
      role: z.string(),
      organization: z.string(),
      duration: z.string(),
      verifiedHighlights: z.array(z.string()),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      summary: z.string(),
      technologies: z.array(z.string()),
    })
  ),
  certifications: z.array(z.string()),
  missingCompetencies: z.array(z.string()),
  tailoredInterviewQuestions: z.array(z.string()).min(3).max(8),
  matchScore: z.number().min(0).max(100),
  matchRationale: z.string(),
});

export type ParsedCvProfile = z.infer<typeof ParsedCvProfileSchema>;

/**
 * Extracts text from PDF or DOCX buffers safely on the server.
 */
export async function extractDocumentText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    // Dynamic import avoids Next.js edge/build bundling issues
    const pdfParse = (await import("pdf-parse")).default;
    const parsed = await pdfParse(buffer);
    return parsed.text.trim();
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  throw new Error("Unsupported document format. Upload PDF or DOCX only.");
}

/**
 * Analyzes extracted CV text + user-supplied LinkedIn summary against job requirements.
 * Enforces strict anti-hallucination and ethical non-discrimination rules.
 */
export async function analyzeCandidateApplication(params: {
  cvText: string;
  linkedinUrl?: string;
  linkedinProfileText?: string;
  jobTitle: string;
  jobRequirements: string[];
}): Promise<{
  ok: boolean;
  profile?: ParsedCvProfile;
  error?: string;
}> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      error:
        "OPENAI_API_KEY is not configured. CV stored securely; AI competency extraction awaiting API key.",
    };
  }

  const systemPrompt = [
    "You are Athena Talent (XVN-REC-05), the XavanXAI CV Intelligence Engine.",
    "STRICT ETHICAL & FACTUAL RULES:",
    "1. Extract ONLY facts explicitly present in the provided CV text or user-supplied LinkedIn text. NEVER invent degrees, employers, dates, or skills.",
    "2. Evaluate strictly against role competencies, technical skills, and project depth.",
    "3. NEVER infer or penalize based on name, nationality, gender, age, accent, disability, or gaps unrelated to role competence.",
    "4. Return valid JSON matching the exact requested schema.",
  ].join("\n");

  const userPrompt = JSON.stringify({
    targetRole: params.jobTitle,
    requiredCompetencies: params.jobRequirements,
    candidateCvText: params.cvText.slice(0, 18000),
    userProvidedLinkedinUrl: params.linkedinUrl || null,
    userProvidedLinkedinSummary: params.linkedinProfileText?.slice(0, 6000) || null,
    outputSchema: {
      education: ["string"],
      technicalSkills: ["string"],
      workExperience: [
        {
          role: "string",
          organization: "string",
          duration: "string",
          verifiedHighlights: ["string"],
        },
      ],
      projects: [
        { name: "string", summary: "string", technologies: ["string"] },
      ],
      certifications: ["string"],
      missingCompetencies: ["string"],
      tailoredInterviewQuestions: ["5 role-specific technical questions grounded in this CV"],
      matchScore: "number 0-100 based strictly on verified competency overlap",
      matchRationale: "transparent evidence-linked explanation",
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
    return {
      ok: false,
      error: `CV Intelligence LLM error (${res.status}).`,
    };
  }

  const data = await res.json();
  const rawJson = data.choices?.[0]?.message?.content;

  try {
    const parsed = ParsedCvProfileSchema.safeParse(JSON.parse(rawJson));
    if (!parsed.success) {
      return {
        ok: false,
        error: "AI CV parser returned malformed schema; queued for human review.",
      };
    }
    return { ok: true, profile: parsed.data };
  } catch {
    return {
      ok: false,
      error: "Failed to parse structured CV output JSON.",
    };
  }
}