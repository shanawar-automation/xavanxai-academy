import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const BookingSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email().toLowerCase(),
  company: z.string().min(1).max(120),
  purpose: z.enum([
    "AI Consultation",
    "Automation Consultation",
    "Project Discovery",
    "Technical Discussion",
    "Partnership Meeting",
  ]),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date.")
    .refine((d) => {
      const picked = new Date(`${d}T00:00:00Z`).getTime();
      const todayUtc = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z").getTime();
      return picked >= todayUtc - 24 * 60 * 60 * 1000; // allow for timezone offset
    }, "Consultation date cannot be in the past."),
  timeSlot: z.string().min(3),
  timezone: z.string().min(2),
  notes: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  const rl = rateLimit(`booking:${clientIp(req)}`, 6, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many booking requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
    );
  }

  try {
    const body = await req.json();
    const parsed = BookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid booking details" },
        { status: 400 }
      );
    }

    const bookingReference = `XVN-BK-${crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase()}`;

    // Persist consultation record in PostgreSQL AuditLog
    try {
      await prisma.auditLog.create({
        data: {
          action: "CONSULTATION_BOOKED",
          resource: `booking:${bookingReference}`,
          metadata: {
            ...parsed.data,
            bookingReference,
            status: "CONFIRMED",
          },
        },
      });
    } catch {
      // Continue cleanly if DB is temporarily offline while returning confirmation ref
    }

    // Forward to n8n Google Calendar & CRM webhook if configured
    const n8nBookingWebhook = process.env.N8N_BOOKING_WEBHOOK_URL;
    let calendarSynced = false;
    if (n8nBookingWebhook) {
      try {
        const hookRes = await fetch(n8nBookingWebhook, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-xavan-secret": process.env.N8N_WEBHOOK_SECRET || "",
          },
          body: JSON.stringify({
            event: "consultation.booked",
            bookingReference,
            ...parsed.data,
          }),
        });
        calendarSynced = hookRes.ok;
      } catch {
        calendarSynced = false;
      }
    }

    // Send confirmation email via Resend if configured
    const resendKey = process.env.RESEND_API_KEY;
    let emailSent = false;
    if (resendKey) {
      try {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from:
              process.env.EMAIL_FROM_ADDRESS ||
              "XavanXAI Operations <operations@xavanxai.com>",
            to: [parsed.data.email],
            subject: `XavanXAI Consultation Confirmed — ${bookingReference}`,
            text: [
              `Dear ${parsed.data.fullName},`,
              "",
              `Your ${parsed.data.purpose} with XavanXAI has been scheduled.`,
              `Reference ID: ${bookingReference}`,
              `Date & Time: ${parsed.data.date} at ${parsed.data.timeSlot} (${parsed.data.timezone})`,
              "",
              "To reschedule or cancel, reply to this message or contact operations@xavanxai.com with your Reference ID.",
              "",
              "XavanXAI Principal Architecture Team",
            ].join("\n"),
          }),
        });
        emailSent = emailRes.ok;
      } catch {
        emailSent = false;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        bookingReference,
        calendarSynced,
        emailSent,
        details: parsed.data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[CONSULTATION_BOOKING_ERROR]", err);
    return NextResponse.json(
      { error: "Unable to schedule consultation." },
      { status: 500 }
    );
  }
}