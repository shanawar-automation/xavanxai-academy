import { prisma } from "@/lib/prisma";

export interface CandidateEmailPayload {
  toEmail: string;
  candidateName: string;
  positionTitle: string;
  interviewDate: string;
  decision: "RECOMMENDED_NEXT_STAGE" | "NOT_RECOMMENDED";
  approvedByUserId: string;
  sessionId: string;
}

export function buildCandidateDecisionEmail(params: {
  candidateName: string;
  positionTitle: string;
  interviewDate: string;
  decision: "RECOMMENDED_NEXT_STAGE" | "NOT_RECOMMENDED";
}) {
  const { candidateName, positionTitle, interviewDate, decision } = params;

  if (decision === "RECOMMENDED_NEXT_STAGE") {
    return {
      subject: "XavanXAI — Interview Update",
      text: [
        `Dear ${candidateName},`,
        "",
        `Position: ${positionTitle}`,
        `Interview Date: ${interviewDate}`,
        "",
        "Thank you for completing your interview with XavanXAI. We are pleased to inform you that your application has been selected to proceed to the next stage. Our recruitment team will contact you with further details.",
        "",
        "If you have any questions or require accommodations for the next stage, contact recruitment@xavanxai.com.",
        "",
        "Sincerely,",
        "XavanXAI Talent Intelligence & Recruitment Team",
      ].join("\n"),
    };
  }

  return {
    subject: "XavanXAI — Application Status Update",
    text: [
      `Dear ${candidateName},`,
      "",
      `Position: ${positionTitle}`,
      `Interview Date: ${interviewDate}`,
      "",
      "Thank you for your interest in XavanXAI and for taking the time to complete the interview. After reviewing your application, we regret to inform you that we will not be progressing with your application for this particular position at this time.",
      "",
      "You may request a human review or exercise your GDPR data rights at any time by contacting recruitment@xavanxai.com.",
      "",
      "Sincerely,",
      "XavanXAI Talent Intelligence & Recruitment Team",
    ].join("\n"),
  };
}

export async function sendApprovedCandidateEmail(
  payload: CandidateEmailPayload
): Promise<{ ok: boolean; status: string; message: string }> {
  // Verify human approval directly in database prior to dispatch
  const sessionRecord = await prisma.interviewSession.findUnique({
    where: { id: payload.sessionId },
  });

  if (!sessionRecord || !sessionRecord.humanApproved || !sessionRecord.humanReviewerId) {
    throw new Error(
      "SECURITY GATE BLOCKED: Hiring outcome emails cannot be sent without explicit human recruiter approval."
    );
  }

  const emailContent = buildCandidateDecisionEmail({
    candidateName: payload.candidateName,
    positionTitle: payload.positionTitle,
    interviewDate: payload.interviewDate,
    decision: payload.decision,
  });

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress =
    process.env.EMAIL_FROM_ADDRESS || "XavanXAI Recruitment <recruitment@xavanxai.com>";

  if (!resendApiKey) {
    await prisma.interviewSession.update({
      where: { id: payload.sessionId },
      data: { emailStatus: "QUEUED_AWAITING_RESEND_KEY" },
    });

    return {
      ok: true,
      status: "QUEUED_AWAITING_RESEND_KEY",
      message:
        "Decision approved and email queued. Configure RESEND_API_KEY in .env to dispatch live emails.",
    };
  }

  // Send with 1 automatic retry
  let lastError = "";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: fromAddress,
          to: [payload.toEmail],
          subject: emailContent.subject,
          text: emailContent.text,
        }),
      });

      if (res.ok) {
        await prisma.interviewSession.update({
          where: { id: payload.sessionId },
          data: { emailStatus: "SENT_APPROVED" },
        });

        await prisma.auditLog.create({
          data: {
            actorId: payload.approvedByUserId,
            action: "CANDIDATE_DECISION_EMAIL_SENT",
            resource: `interview:${payload.sessionId}`,
            metadata: {
              decision: payload.decision,
              recipient: payload.toEmail,
              attempt,
            },
          },
        });

        return {
          ok: true,
          status: "SENT_APPROVED",
          message: `Approved candidate notification dispatched to ${payload.toEmail}.`,
        };
      }

      lastError = `Resend HTTP ${res.status}: ${await res.text()}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Network error";
    }
  }

  await prisma.interviewSession.update({
    where: { id: payload.sessionId },
    data: { emailStatus: "FAILED_RETRY_EXHAUSTED" },
  });

  return {
    ok: false,
    status: "FAILED_RETRY_EXHAUSTED",
    message: `Email delivery failed after retry: ${lastError.slice(0, 180)}`,
  };
}