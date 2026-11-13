import React from "react";
import { FolderKanban, ShieldCheck, FileText, ArrowRight } from "lucide-react";
import { SectionHeader, XavanButton } from "@/components/ui/XavanPrimitives";

export const metadata = {
  title: "Enterprise Client Portal — XavanXAI",
  description:
    "Submit project requirements, track multi-agent deployments, inspect automation reports, and download deliverables.",
};

export default function ClientsPortalLandingPage() {
  return (
    <div className="py-16 lg:py-24">
      <div className="xavan-container">
        <SectionHeader
          eyebrow="Client Workspace"
          title="Dedicated Enterprise Client Portal"
          description="Every XavanXAI client receives an isolated RBAC workspace to submit technical briefs, track live milestone progress, review automation logs, and manage deliverables."
        />

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="xavan-card p-7">
            <FolderKanban className="h-6 w-6 text-[#F47735]" />
            <h2 className="mt-4 font-display text-lg font-bold text-white">
              Project &amp; Sprint Tracking
            </h2>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Submit new automation briefs, monitor architectural milestones,
              and approve staging releases.
            </p>
          </div>

          <div className="xavan-card p-7">
            <FileText className="h-6 w-6 text-[#F47735]" />
            <h2 className="mt-4 font-display text-lg font-bold text-white">
              Deliverables &amp; n8n Blueprints
            </h2>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Access signed architecture documents, workflow JSON exports, and
              API integration guides.
            </p>
          </div>

          <div className="xavan-card p-7">
            <ShieldCheck className="h-6 w-6 text-[#F47735]" />
            <h2 className="mt-4 font-display text-lg font-bold text-white">
              Automation Telemetry &amp; Support
            </h2>
            <p className="mt-2 text-sm text-[#A1A1AA]">
              Inspect execution health reports and escalate support tickets
              directly to principal engineers.
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <XavanButton variant="primary" size="lg" href="/login?redirect=/dashboard/projects">
            Sign In to Client Portal
            <ArrowRight className="h-4 w-4" />
          </XavanButton>
          <XavanButton variant="secondary" size="lg" href="/register">
            Create Enterprise Client Account
          </XavanButton>
        </div>
      </div>
    </div>
  );
}