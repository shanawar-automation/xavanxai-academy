"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus, AlertCircle } from "lucide-react";
import { XavanButton } from "@/components/ui/XavanPrimitives";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<"CLIENT" | "CANDIDATE">(
    "CLIENT"
  );
  const [gdprConsent, setGdprConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          password,
          accountType,
          gdprConsent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      router.push(accountType === "CANDIDATE" ? "/careers" : "/dashboard");
      router.refresh();
    } catch {
      setError("Unable to reach XavanXAI registration service.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center py-16 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#101010] p-8 shadow-glass">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Create XavanXAI Account
        </h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          Select your workspace role to initialize isolated permissions.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Role Switcher */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#080808] p-1">
            {(["CLIENT", "CANDIDATE"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAccountType(type)}
                className={`rounded-lg py-2 font-mono text-xs transition-colors ${
                  accountType === type
                    ? "bg-[#F47735] text-[#080808] font-semibold"
                    : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                {type === "CLIENT" ? "Enterprise Client" : "Job Candidate"}
              </button>
            ))}
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Morgan"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white focus:border-[#F47735] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@enterprise.com"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white focus:border-[#F47735] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-xs uppercase text-[#A1A1AA]">
              Password (Min 10 Characters)
            </label>
            <input
              type="password"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white focus:border-[#F47735] focus:outline-none"
            />
          </div>

          <label className="flex items-start gap-2.5 pt-1 text-xs text-[#A1A1AA] cursor-pointer">
            <input
              type="checkbox"
              required
              checked={gdprConsent}
              onChange={(e) => setGdprConsent(e.target.checked)}
              className="mt-0.5 rounded border-white/20 bg-[#080808] accent-[#F47735]"
            />
            <span>
              I consent to XavanXAI processing my account data in accordance
              with GDPR and the XavanXAI Privacy &amp; Data Retention Policy.
            </span>
          </label>

          <XavanButton
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full"
          >
            <UserPlus className="h-4 w-4" />
            {loading ? "Provisioning Account..." : "Create Account"}
          </XavanButton>
        </form>

        <div className="mt-6 border-t border-white/10 pt-5 text-center text-xs text-[#A1A1AA]">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#F47735] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}