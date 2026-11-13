// src/components/dashboard/ClientProjectSubmissionForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { SERVICES_CATALOG } from "@/data/xavanData";
import { XavanButton } from "@/components/ui/XavanPrimitives";

export function ClientProjectSubmissionForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [serviceTrack, setServiceTrack] = useState(SERVICES_CATALOG[0].title);
  const [requirements, setRequirements] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, serviceTrack, requirements }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Project brief ${data.projectCode} submitted to XavanXAI.`);
        setTitle("");
        setRequirements("");
        router.refresh();
      } else {
        setMessage(data.error || "Submission failed.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-white/10 bg-[#101010] p-6"
    >
      <h2 className="font-display text-lg font-bold text-white">
        Submit New Project Requirements
      </h2>

      {message && (
        <div className="rounded-xl border border-[#F47735]/40 bg-[#F47735]/10 p-3 text-xs text-white">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
            Project Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Multi-Agent Customer Support & n8n CRM Sync"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
            Primary Solution Track
          </label>
          <select
            value={serviceTrack}
            onChange={(e) => setServiceTrack(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white"
          >
            {SERVICES_CATALOG.map((s) => (
              <option key={s.slug} value={s.title}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
          Technical Specifications, APIs &amp; Timeline
        </label>
        <textarea
          rows={3}
          required
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Outline existing systems, data privacy requirements, and target deliverables..."
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white"
        />
      </div>

      <div className="flex justify-end">
        <XavanButton type="submit" variant="primary" disabled={submitting}>
          <PlusCircle className="h-4 w-4" />
          {submitting ? "Submitting..." : "Submit Project Brief"}
        </XavanButton>
      </div>
    </form>
  );
}