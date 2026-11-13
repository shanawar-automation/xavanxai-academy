"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Globe, CheckCircle2, AlertCircle } from "lucide-react";
import { SectionHeader, XavanButton } from "@/components/ui/XavanPrimitives";

const TIME_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "01:00 PM",
  "02:30 PM",
  "04:00 PM",
  "05:30 PM",
];

const PURPOSES = [
  "AI Consultation",
  "Automation Consultation",
  "Project Discovery",
  "Technical Discussion",
  "Partnership Meeting",
] as const;

export default function BookConsultationPage() {
  const [timezone, setTimezone] = useState("UTC");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [purpose, setPurpose] = useState<(typeof PURPOSES)[number]>("AI Consultation");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    bookingReference: string;
    calendarSynced: boolean;
    emailSent: boolean;
  } | null>(null);

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) setTimezone(detected);
    } catch {
      setTimezone("UTC");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/bookings/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          company,
          purpose,
          date,
          timeSlot,
          timezone,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Booking failed.");
      } else {
        setConfirmation({
          bookingReference: data.bookingReference,
          calendarSynced: data.calendarSynced,
          emailSent: data.emailSent,
        });
      }
    } catch {
      setError("Network error submitting booking.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container max-w-3xl">
        <SectionHeader
          eyebrow="Discovery & Architecture"
          title="Book a Consultation With XavanXAI"
          description="Select your consultation track, preferred date, and timezone-synced slot. Confirmations sync automatically with our operations calendar."
        />

        {confirmation ? (
          <div className="mt-10 rounded-3xl border border-emerald-500/35 bg-[#101010] p-8 space-y-4">
            <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            <h2 className="font-display text-2xl font-bold text-white">
              Consultation Confirmed
            </h2>
            <p className="text-sm text-[#A1A1AA]">
              Scheduled for <strong className="text-white">{date}</strong> at{" "}
              <strong className="text-white">{timeSlot}</strong> ({timezone}).
            </p>
            <div className="rounded-xl border border-white/10 bg-[#080808] p-4 font-mono text-xs space-y-1">
              <div className="text-[#F47735]">
                REFERENCE ID: {confirmation.bookingReference}
              </div>
              <div className="text-[#A1A1AA]">
                Email Confirmation:{" "}
                {confirmation.emailSent
                  ? "Dispatched via Resend"
                  : "Recorded (Configure RESEND_API_KEY for live email)"}
              </div>
              <div className="text-[#A1A1AA]">
                Google Calendar / n8n Sync:{" "}
                {confirmation.calendarSynced
                  ? "Synced"
                  : "Recorded (Configure N8N_BOOKING_WEBHOOK_URL for live Calendar invite)"}
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-5 rounded-3xl border border-white/10 bg-[#101010] p-7 sm:p-9"
          >
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-xs">
              <span className="flex items-center gap-2 text-[#A1A1AA]">
                <Globe className="h-4 w-4 text-[#F47735]" />
                Detected Timezone
              </span>
              <span className="font-mono font-semibold text-white">
                {timezone}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white focus:border-[#F47735] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white focus:border-[#F47735] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
                  Company / Organization *
                </label>
                <input
                  type="text"
                  required
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white focus:border-[#F47735] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
                  Meeting Purpose *
                </label>
                <select
                  value={purpose}
                  onChange={(e) =>
                    setPurpose(e.target.value as (typeof PURPOSES)[number])
                  }
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white focus:border-[#F47735] focus:outline-none"
                >
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
                  Preferred Date *
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white focus:border-[#F47735] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
                  Available Time Slot *
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white focus:border-[#F47735] focus:outline-none"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} ({timezone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
                Architecture Scope / Requirements (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe your target workflows, CRM/ERP stack, or AI agent goals..."
                className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white focus:border-[#F47735] focus:outline-none"
              />
            </div>

            <XavanButton
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              className="w-full"
            >
              <Calendar className="h-4 w-4" />
              {submitting ? "Confirming Slot..." : "Confirm Consultation Booking"}
            </XavanButton>
          </form>
        )}
      </div>
    </div>
  );
}