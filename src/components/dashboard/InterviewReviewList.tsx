"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ShieldAlert, FileText, UserCheck } from "lucide-react";
import { XavanButton } from "@/components/ui/XavanPrimitives";

export interface ReviewableInterview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  scheduledFor: string;
  aiRecommendation: string;
  humanApproved: boolean;
  reviewerNotes: string | null;
  emailStatus: string;
  categoryScores: unknown;
  integrityEvents: Array<{
    id: string;
    eventType: string;
    details: string;
    occurredAt: string;
  }>;
}

export function InterviewReviewList({
  interviews,
}: {
  interviews: ReviewableInterview[];
}) {
  const router = useRouter();
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [decisionMap, setDecisionMap] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  async function submitRecruiterDecision(
    interview: ReviewableInterview,
    sendEmail: boolean
  ) {
    setSubmittingId(interview.id);
    setStatusNotice(null);

    const chosenDecision =
      decisionMap[interview.id] ||
      (interview.aiRecommendation === "NOT_RECOMMENDED"
        ? "NOT_RECOMMENDED"
        : "RECOMMENDED_NEXT_STAGE");

    try {
      const res = await fetch(`/api/interview/${interview.id}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          finalDecision: chosenDecision,
          reviewerNotes: notesMap[interview.id] ?? interview.reviewerNotes ?? "",
          sendCandidateEmail: sendEmail,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatusNotice(
          `Recruiter approval recorded for ${interview.candidateName}. Email status: ${data.emailStatus}`
        );
        router.refresh();
      }
    } finally {
      setSubmittingId(null);
    }
  }

  if (interviews.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#101010] p-8 text-center">
        <FileText className="mx-auto h-8 w-8 text-[#F47735]" />
        <h2 className="mt-3 font-display text-lg font-bold text-white">
          No Completed Interview Sessions Yet
        </h2>
        <p className="mt-1 text-xs text-[#A1A1AA]">
          Completed 30-minute AI interviews appear here with 8-category
          evidence reports and integrity logs for human sign-off.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {statusNotice && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
          {statusNotice}
        </div>
      )}

      {interviews.map((item) => {
        const report = item.categoryScores as {
          categories?: Array<{
            category: string;
            scoreOutOf10: number;
            evidenceQuote: string;
            rationale: string;
          }>;
          interviewSummary?: string;
          strengths?: string[];
          improvementAreas?: string[];
        } | null;

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-[#101010] p-6 space-y-5"
          >
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="font-mono text-xs text-[#F47735]">
                  {item.jobTitle} • {item.scheduledFor}
                </span>
                <h2 className="mt-1 font-display text-xl font-bold text-white">
                  {item.candidateName} ({item.candidateEmail})
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 font-mono text-[11px] ${
                    item.humanApproved
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  {item.humanApproved
                    ? "HUMAN APPROVED"
                    : "AWAITING HUMAN REVIEW"}
                </span>
                <span className="rounded-full border border-white/10 bg-[#080808] px-3 py-1 font-mono text-[11px] text-[#A1A1AA]">
                  EMAIL: {item.emailStatus}
                </span>
              </div>
            </div>

            {/* Executive Summary & 8-Category Evidence Grid */}
            {report?.interviewSummary && (
              <p className="text-sm leading-relaxed text-white/90">
                <strong className="text-[#F47735]">AI Summary: </strong>
                {report.interviewSummary}
              </p>
            )}

            {report?.categories && (
              <div>
                <div className="mb-2 font-mono text-[11px] uppercase text-[#A1A1AA]">
                  8-Category Evidence-Linked Indicators (Decision Support Only)
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {report.categories.map((cat) => (
                    <div
                      key={cat.category}
                      className="rounded-xl border border-white/10 bg-[#080808] p-3.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-white">
                        <span>{cat.category}</span>
                        <span className="font-mono text-[#F47735]">
                          {cat.scoreOutOf10}/10
                        </span>
                      </div>
                      <p className="mt-1.5 italic text-[#A1A1AA]">
                        &ldquo;{cat.evidenceQuote}&rdquo;
                      </p>
                      <p className="mt-1 text-white/80">{cat.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclosed Integrity Events */}
            {item.integrityEvents.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
                <div className="flex items-center gap-1.5 font-mono uppercase text-amber-300">
                  <ShieldAlert className="h-4 w-4" />
                  Session Integrity Telemetry ({item.integrityEvents.length} Events)
                </div>
                <ul className="mt-2 space-y-1 text-amber-200/90">
                  {item.integrityEvents.map((ev) => (
                    <li key={ev.id}>
                      <strong>{ev.eventType}:</strong> {ev.details}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mandatory Human Recruiter Approval Controls */}
            <div className="rounded-xl border border-white/10 bg-[#080808] p-4 space-y-3">
              <div className="font-mono text-xs uppercase text-[#F47735]">
                Human Recruiter Sign-Off &amp; Email Dispatch
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-mono text-[11px] text-[#A1A1AA]">
                    Approved Hiring Outcome
                  </label>
                  <select
                    value={decisionMap[item.id] || item.aiRecommendation}
                    onChange={(e) =>
                      setDecisionMap({ ...decisionMap, [item.id]: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#101010] px-3 py-2 text-xs text-white"
                  >
                    <option value="RECOMMENDED_NEXT_STAGE">
                      Recommended for Next Stage
                    </option>
                    <option value="REQUIRES_HUMAN_REVIEW">
                      Hold — Requires Additional Human Review
                    </option>
                    <option value="NOT_RECOMMENDED">
                      Not Recommended for This Position
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-[#A1A1AA]">
                    Human Reviewer Notes
                  </label>
                  <input
                    type="text"
                    defaultValue={item.reviewerNotes || ""}
                    onChange={(e) =>
                      setNotesMap({ ...notesMap, [item.id]: e.target.value })
                    }
                    placeholder="Add architectural review observations..."
                    className="mt-1 w-full rounded-lg border border-white/10 bg-[#101010] px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <XavanButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={submittingId === item.id}
                  onClick={() => submitRecruiterDecision(item, false)}
                >
                  <UserCheck className="h-3.5 w-3.5 text-[#F47735]" />
                  Save Human Decision Only
                </XavanButton>

                <XavanButton
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={submittingId === item.id}
                  onClick={() => submitRecruiterDecision(item, true)}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Approve &amp; Send Candidate Status Email
                </XavanButton>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}