import React from "react";
import { SectionHeader } from "@/components/ui/XavanPrimitives";
import { AutonomousHqWorkspace } from "@/components/hq/AutonomousHqWorkspace";

export const metadata = {
  title: "3D Autonomous AI Headquarters — Live Ecosystem",
  description:
    "Explore XavanXAI's solar-system-inspired autonomous headquarters with 12 department agents, real-time event bus telemetry, and zero-trust permission boundaries.",
};

export default function AiHeadquartersPage() {
  return (
    <div className="py-12 lg:py-20">
      <div className="xavan-container">
        <SectionHeader
          eyebrow="Signature Platform"
          title="XavanXAI Autonomous AI Headquarters"
          description="Inspect our central intelligence core and 12 specialized departments in interactive 3D. Click any department node to inspect its permission sandbox and execution logs."
        />

        <div className="mt-10">
          <AutonomousHqWorkspace />
        </div>
      </div>
    </div>
  );
}