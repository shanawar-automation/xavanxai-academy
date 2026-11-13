import React from "react";

/** Pure-CSS infinite marquee (no JS). Pauses on hover; the duplicate track is hidden from assistive tech. */
export function Marquee({ items }: { items: string[] }) {
  const track = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-3 pr-3"
    >
      {items.map((item) => (
        <li
          key={`${hidden ? "b" : "a"}-${item}`}
          className="whitespace-nowrap rounded-full border border-white/10 bg-[#101010] px-4 py-1.5 font-mono text-xs text-[#A1A1AA]"
        >
          {item}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]"
      role="list"
      aria-label="Production engineering stack"
    >
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {track(false)}
        {track(true)}
      </div>
    </div>
  );
}
