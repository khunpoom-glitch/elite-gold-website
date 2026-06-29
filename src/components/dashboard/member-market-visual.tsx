import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

type MemberMarketVisualProps = {
  className?: string;
  label?: string;
};

const bars = [
  { accent: false, delay: "0s", height: "28%", left: "15%" },
  { accent: false, delay: "0.45s", height: "42%", left: "26%" },
  { accent: true, delay: "0.9s", height: "58%", left: "38%" },
  { accent: false, delay: "1.35s", height: "34%", left: "51%" },
  { accent: false, delay: "1.8s", height: "46%", left: "63%" },
  { accent: true, delay: "2.25s", height: "31%", left: "75%" },
];

const nodes = [
  { delay: "0.2s", left: "23%", top: "42%" },
  { delay: "1s", left: "39%", top: "33%" },
  { delay: "1.8s", left: "61%", top: "39%" },
  { delay: "2.6s", left: "77%", top: "34%" },
];

const graphPath = "M 4 30 C 13 27 18 23 25 22 C 33 21 38 16 45 19 C 53 23 56 30 64 26 C 72 22 77 18 84 21 C 89 23 93 27 96 24";
const graphAreaPath = `${graphPath} L 96 42 L 4 42 Z`;

type MotionStyle = CSSProperties & Record<`--${string}`, string>;

export function MemberMarketVisual({
  className,
  label = "Member dashboard market depth visual",
}: MemberMarketVisualProps) {
  return (
    <div aria-label={label} className={cn("member-market-visual", className)} role="img">
      <span aria-hidden="true" className="member-market-chrome" />
      <svg
        aria-hidden="true"
        className="member-market-graph"
        focusable="false"
        preserveAspectRatio="none"
        viewBox="0 0 100 48"
      >
        <defs>
          <linearGradient
            gradientUnits="userSpaceOnUse"
            id="member-market-line"
            x1="-90"
            x2="-12"
            y1="0"
            y2="0"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="28%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="58%" stopColor="#fcfdff" stopOpacity="0.72" />
            <stop offset="82%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            <animate
              attributeName="x1"
              dur="8s"
              keyTimes="0;0.08;0.9;1"
              repeatCount="indefinite"
              values="-90;-90;126;126"
            />
            <animate
              attributeName="x2"
              dur="8s"
              keyTimes="0;0.08;0.9;1"
              repeatCount="indefinite"
              values="-12;-12;204;204"
            />
          </linearGradient>
          <linearGradient id="member-market-area" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#fcfdff" stopOpacity="0.10" />
            <stop offset="48%" stopColor="#9aa4b8" stopOpacity="0.055" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="member-market-graph-area" d={graphAreaPath} fill="url(#member-market-area)" />
        <path className="member-market-graph-base" d={graphPath} pathLength="100" />
        <path className="member-market-graph-runner" d={graphPath} pathLength="100" />
        <circle className="member-market-tracer" r="1.25">
          <animateMotion dur="8s" path={graphPath} repeatCount="indefinite" rotate="auto" />
        </circle>
      </svg>
      <span aria-hidden="true" className="member-market-frame" />
      <div aria-hidden="true" className="member-market-plate" />
      <span aria-hidden="true" className="member-market-baseline" />
      <span aria-hidden="true" className="member-market-depth" />
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
    </div>
  );
}
