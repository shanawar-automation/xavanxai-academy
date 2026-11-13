"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
    >
      <LogOut className="h-4 w-4" />
      Terminate Session
    </button>
  );
}