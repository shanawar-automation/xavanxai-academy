// src/app/contact/page.tsx
import React from "react";
import { Mail, Globe, Calendar } from "lucide-react";
import { SectionHeader, XavanButton } from "@/components/ui/XavanPrimitives";

export const metadata = {
  title: "Contact XavanXAI Operations",
  description: "Connect with XavanXAI engineering and advisory teams across the USA, UK, Germany, UAE, and Europe.",
};

export default function ContactPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container">
        <SectionHeader
          eyebrow="Global Operations"
          title="Connect With XavanXAI"
          description="For technical consultations, partnership inquiries, or GDPR data governance requests, reach our operations desk directly."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="xavan-card p-7">
            <Calendar className="h-6 w-6 text-[#F47735]" />
            <h2 className="mt-4 font-display text-lg font-bold text-white">
              Technical Consultation
            </h2>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Book a timezone-synced discovery session directly with our
              solutions architects.
            </p>
            <XavanButton
              variant="primary"
              size="sm"
              href="/book-consultation"
              className="mt-5"
            >
              Open Booking Calendar
            </XavanButton>
          </div>

          <div className="xavan-card p-7">
            <Mail className="h-6 w-6 text-[#F47735]" />
            <h2 className="mt-4 font-display text-lg font-bold text-white">
              Direct Operations Desk
            </h2>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Enterprise RFPs, security questionnaires, and recruitment support.
            </p>
            <p className="mt-4 font-mono text-xs text-[#F47735]">
              operations@xavanxai.com
            </p>
          </div>

          <div className="xavan-card p-7">
            <Globe className="h-6 w-6 text-[#F47735]" />
            <h2 className="mt-4 font-display text-lg font-bold text-white">
              Active Markets
            </h2>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Serving enterprise clients across the USA, United Kingdom,
              Germany, UAE, and European Union.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}