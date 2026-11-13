"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal wrapper.
 * - Server render & no-JS: content is fully visible (no hidden-content flash / SEO safe).
 * - Elements already in the viewport on load are left alone.
 * - Elements below the fold fade + rise in once, when scrolled into view.
 * - Respects prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"ssr" | "hidden" | "shown">("ssr");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setState("hidden");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("shown");
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stateClass =
    state === "ssr"
      ? ""
      : state === "hidden"
      ? "opacity-0 translate-y-6"
      : "opacity-100 translate-y-0";

  return (
    <div
      ref={ref}
      style={state === "ssr" ? undefined : { transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,transform] duration-700 ease-out will-change-[opacity,transform] ${stateClass} ${className}`}
    >
      {children}
    </div>
  );
}
