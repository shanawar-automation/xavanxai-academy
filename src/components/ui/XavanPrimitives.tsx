import React from "react";
import Link from "next/link";
import {  } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: React.ReactNode;
}

export function XavanButton({
  variant = "primary",
  size = "md",
  href,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F47735] disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "bg-[#F47735] text-[#080808] font-semibold hover:bg-[#FF884B] shadow-orange-subtle hover:shadow-orange-glow",
    secondary:
      "bg-[#181818] text-white border border-white/10 hover:border-[#F47735]/50 hover:bg-[#1E1E1E]",
    ghost: "text-[#A1A1AA] hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "px-3.5 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export function TelemetryBadge({
  label,
  status = "live",
}: {
  label: string;
  status?: "live" | "simulation" | "warning";
}) {
  const styles = {
    live: {
      dot: "bg-emerald-400",
      border: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    },
    simulation: {
      dot: "bg-[#F47735]",
      border: "border-[#F47735]/35 bg-[#F47735]/10 text-[#F47735]",
    },
    warning: {
      dot: "bg-amber-400",
      border: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${styles.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${styles.dot}`} />
      {label}
    </span>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`max-w-3xl ${
        align === "center" ? "mx-auto text-center" : "text-left"
      }`}
    >
      <div className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#F47735]">
        <span className="h-[1px] w-6 bg-[#F47735]" />
        {eyebrow}
      </div>
      <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-[#A1A1AA] sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

export function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`xavan-glass rounded-2xl p-6 shadow-glass ${className}`}>
      {children}
    </div>
  );
}