export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] flex-col items-center justify-center gap-5"
    >
      <div className="relative h-14 w-14">
        <span className="absolute inset-0 rounded-2xl border border-[#F47735]/30" />
        <span className="absolute inset-0 animate-spin rounded-2xl border-2 border-transparent border-t-[#F47735]" />
        <span className="absolute inset-3 rounded-lg bg-[#F47735]/20 animate-glow-pulse" />
      </div>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#A1A1AA]">
        Loading
      </p>
    </div>
  );
}
