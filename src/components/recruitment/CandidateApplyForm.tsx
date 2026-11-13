// src/components/recruitment/CandidateApplyForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { XavanButton } from "@/components/ui/XavanPrimitives";

export function CandidateApplyForm({
  jobId,
  candidateName,
  candidateEmail,
  dbSeeded,
}: {
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  dbSeeded: boolean;
}) {
  const router = useRouter();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinProfileText, setLinkedinProfileText] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    applicationId: string;
    notice: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cvFile) {
      setError("Please attach your PDF or DOCX resume.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("cvFile", cvFile);
      formData.append("linkedinUrl", linkedinUrl);
      formData.append("linkedinProfileText", linkedinProfileText);
      formData.append("consent", String(consent));

      const res = await fetch("/api/recruitment/apply", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Application submission failed.");
        setSubmitting(false);
        return;
      }

      setResult({
        applicationId: data.applicationId,
        notice: data.notice,
      });
    } catch {
      setError("Network error uploading CV.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-3xl border border-emerald-500/35 bg-[#101010] p-8">
        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        <h2 className="mt-4 font-display text-2xl font-bold text-white">
          Application Received &amp; Encrypted
        </h2>
        <p className="mt-2 text-sm text-[#A1A1AA]">{result.notice}</p>
        <div className="mt-6 rounded-xl border border-white/10 bg-[#080808] p-4 font-mono text-xs text-[#F47735]">
          APPLICATION ID: {result.applicationId}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <XavanButton
            variant="primary"
            onClick={() =>
              router.push(`/interview/${result.applicationId}?setup=true`)
            }
          >
            Proceed to Hardware Check &amp; Interview Room
          </XavanButton>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-white/10 bg-[#101010] p-7 sm:p-9"
    >
      {!dbSeeded && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
          Database seed notice: Run <code className="font-mono">npx prisma db seed</code> so this job ID exists in PostgreSQL before submitting.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-white/10 bg-[#080808] p-4 sm:grid-cols-2 text-xs">
        <div>
          <span className="font-mono text-[#A1A1AA]">APPLICANT</span>
          <div className="mt-1 font-semibold text-white">{candidateName}</div>
        </div>
        <div>
          <span className="font-mono text-[#A1A1AA]">VERIFIED EMAIL</span>
          <div className="mt-1 font-semibold text-white">{candidateEmail}</div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* CV Upload */}
      <div>
        <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
          Upload CV / Resume (PDF or DOCX, Max 5 MB) *
        </label>
        <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-[#080808] p-6 text-center transition-colors hover:border-[#F47735]">
          <UploadCloud className="h-7 w-7 text-[#F47735]" />
          <span className="mt-2 text-sm font-medium text-white">
            {cvFile ? cvFile.name : "Select PDF or DOCX Document"}
          </span>
          <span className="mt-1 text-xs text-[#A1A1AA]">
            Stored in encrypted private storage; never publicly indexed
          </span>
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
          />
        </label>
      </div>

      {/* LinkedIn URL + Optional Authorized Profile Text */}
      <div>
        <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
          LinkedIn Profile URL (Optional)
        </label>
        <input
          type="url"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://www.linkedin.com/in/your-profile"
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white focus:border-[#F47735] focus:outline-none"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
          LinkedIn About / Experience Summary (Optional — Recommended if profile is private)
        </label>
        <textarea
          rows={3}
          value={linkedinProfileText}
          onChange={(e) => setLinkedinProfileText(e.target.value)}
          placeholder="Paste public headline, featured projects, or additional experience notes (we never bypass LinkedIn login walls)..."
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white focus:border-[#F47735] focus:outline-none"
        />
      </div>

      {/* Explicit Candidate Processing Consent */}
      <div className="rounded-2xl border border-[#F47735]/30 bg-[#080808] p-4">
        <label className="flex items-start gap-3 text-xs leading-relaxed text-[#A1A1AA] cursor-pointer">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 accent-[#F47735]"
          />
          <span>
            <strong className="text-white block mb-1">
              Explicit Data &amp; AI Evaluation Consent
            </strong>
            I consent to XavanXAI extracting my professional qualifications from
            my uploaded CV solely for evaluating my fit for this role. I
            understand that XavanXAI does not use demographic proxies, facial
            emotion inference, or automated rejections without human recruiter
            review.
          </span>
        </label>
      </div>

      <XavanButton
        type="submit"
        variant="primary"
        disabled={submitting}
        className="w-full"
      >
        <ShieldCheck className="h-4 w-4" />
        {submitting
          ? "Extracting Competencies & Matching..."
          : "Submit Application & Analyze CV"}
      </XavanButton>
    </form>
  );
}