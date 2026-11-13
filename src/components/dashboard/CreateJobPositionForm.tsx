// src/components/dashboard/CreateJobPositionForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { XavanButton } from "@/components/ui/XavanPrimitives";

export function CreateJobPositionForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Autonomous Agent Engineering");
  const [location, setLocation] = useState("Remote (Global)");
  const [type, setType] = useState("Full-Time");
  const [summary, setSummary] = useState("");
  const [requirementsRaw, setRequirementsRaw] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);

    const requirements = requirementsRaw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/recruitment/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          department,
          location,
          type,
          summary,
          requirements,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotice(`Published position "${data.job.title}" (${data.job.slug}).`);
        setTitle("");
        setSummary("");
        setRequirementsRaw("");
        router.refresh();
      } else {
        setNotice(data.error || "Failed to publish role.");
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
        Publish New Position to Talent Intelligence
      </h2>

      {notice && (
        <div className="rounded-xl border border-[#F47735]/40 bg-[#F47735]/10 p-3 text-xs text-white">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
            Role Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Senior Voice & WebRTC AI Engineer"
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
            Department *
          </label>
          <input
            type="text"
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
            Location *
          </label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white"
          />
        </div>

        <div>
          <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
            Employment Type *
          </label>
          <input
            type="text"
            required
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white"
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
          Role Summary *
        </label>
        <textarea
          rows={2}
          required
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white"
        />
      </div>

      <div>
        <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
          Competency Requirements (One per line, min 2) *
        </label>
        <textarea
          rows={3}
          required
          value={requirementsRaw}
          onChange={(e) => setRequirementsRaw(e.target.value)}
          placeholder={"3+ years TypeScript & Next.js\nProduction PostgreSQL & Prisma schema design"}
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-3.5 py-2.5 text-sm text-white"
        />
      </div>

      <div className="flex justify-end">
        <XavanButton type="submit" variant="primary" disabled={submitting}>
          <PlusCircle className="h-4 w-4" />
          {submitting ? "Publishing..." : "Create Open Position"}
        </XavanButton>
      </div>
    </form>
  );
}