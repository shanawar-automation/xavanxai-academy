"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { XavanButton } from "@/components/ui/XavanPrimitives";
import { safeRedirectPath } from "@/lib/safeRedirect";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Network error connecting to XavanXAI Auth Gateway.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center py-16 px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#101010] p-8 shadow-glass">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#F47735]/30 bg-[#F47735]/10 px-3 py-1 font-mono text-xs text-[#F47735]">
          <ShieldCheck className="h-3.5 w-3.5" />
          ZERO-TRUST ACCESS PORTAL
        </div>

        <h1 className="mt-5 font-display text-2xl font-bold text-white sm:text-3xl">
          Sign In to XavanXAI
        </h1>
        <p className="mt-2 text-sm text-[#A1A1AA]">
          Access the AI Headquarters Control Center, Client Workspace, or
          Candidate Interview Portal.
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
          <div>
            <label
              htmlFor="email"
              className="block font-mono text-xs uppercase text-[#A1A1AA]"
            >
              Work or Candidate Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#F47735] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-mono text-xs uppercase text-[#A1A1AA]"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#080808] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#F47735] focus:outline-none"
            />
          </div>

          <XavanButton
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full mt-2"
          >
            <Lock className="h-4 w-4" />
            {loading ? "Verifying Credentials..." : "Authenticate Session"}
            <ArrowRight className="h-4 w-4" />
          </XavanButton>
        </form>

        <div className="mt-6 border-t border-white/10 pt-5 text-center text-xs text-[#A1A1AA]">
          New client or job applicant?{" "}
          <Link
            href="/register"
            className="font-semibold text-[#F47735] hover:underline"
          >
            Create a verified account
          </Link>
        </div>
      </div>
    </div>
  );
}
export default function LoginPage() {
  // useSearchParams() must sit inside a Suspense boundary or `next build` fails.
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <LoginForm />
    </Suspense>
  );
}
