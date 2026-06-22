import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type MemberMarketVisualProps = {
  className?: string;
  label?: string;
};

const bars = [
  { accent: false, delay: "0s", height: "36%", left: "16%" },
  { accent: false, delay: "0.45s", height: "58%", left: "27%" },
  { accent: true, delay: "0.9s", height: "76%", left: "39%" },
  { accent: false, delay: "1.35s", height: "48%", left: "52%" },
  { accent: false, delay: "1.8s", height: "64%", left: "64%" },
  { accent: true, delay: "2.25s", height: "42%", left: "76%" },
];

const nodes = [
  { delay: "0.2s", left: "22%", top: "39%" },
  { delay: "1s", left: "42%", top: "24%" },
  { delay: "1.8s", left: "61%", top: "34%" },
  { delay: "2.6s", left: "78%", top: "27%" },
];

const graphPath = "M 4 35 C 12 29 17 33 24 23 S 35 11 42 16 S 53 39 60 25 S 70 9 77 17 S 87 37 96 24";

type MotionStyle = CSSProperties & Record<`--${string}`, string>;

export function MemberMarketVisual({
  className,
  label = "Member dashboard market depth visual",
}: MemberMarketVisualProps) {
  return (
    <div aria-label={label} className={cn("member-market-visual", className)} role="img">
      <svg
        aria-hidden="true"
        className="member-market-graph"
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 100 48"
      >
        <defs>
          <linearGradient id="member-market-line" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="42%" stopColor="rgba(255,255,255,0.48)" />
            <stop offset="68%" stopColor="rgba(246,227,163,0.92)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <path className="member-market-graph-base" d={graphPath} pathLength="100" />
        <path className="member-market-graph-runner" d={graphPath} pathLength="100" />
        <circle className="member-market-tracer" r="1.25">
          <animateMotion dur="7.2s" path={graphPath} repeatCount="indefinite" rotate="auto" />
        </circle>
      </svg>
      <div aria-hidden="true" className="member-market-plate" />
      {bars.map((bar) => (
        <span
          aria-hidden="true"
          className={cn("member-market-bar", bar.accent ? "is-accent" : null)}
          key={`${bar.left}-${bar.height}`}
          style={{
            "--bar-delay": bar.delay,
            height: bar.height,
            left: bar.left,
          } as MotionStyle}
        />
      ))}
      {nodes.map((node) => (
        <span
          aria-hidden="true"
          className="member-market-node"
          key={`${node.left}-${node.top}`}
          style={{
            "--node-delay": node.delay,
            left: node.left,
            top: node.top,
          } as MotionStyle}
        />
      ))}
      <span aria-hidden="true" className="member-market-scan" />
      <div aria-hidden="true" className="absolute inset-x-8 bottom-7 z-10 flex items-center justify-between text-[0.62rem] font-semibold uppercase text-white/26">
        <span>Discipline</span>
        <span>Journal</span>
        <span>Growth</span>
      </div>
    </div>
  );
}
