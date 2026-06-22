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

const graphPath = "M 4 31 C 13 27 18 24 25 22 C 32 20 37 17 42 20 C 49 25 53 31 60 26 C 67 21 72 17 78 20 C 85 24 90 29 96 24";

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
            <stop offset="58%" stopColor="#f6e3a3" stopOpacity="0.86" />
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
        </defs>
        <path className="member-market-graph-base" d={graphPath} pathLength="100" />
        <path className="member-market-graph-runner" d={graphPath} pathLength="100" />
        <circle className="member-market-tracer" r="1.25">
          <animateMotion dur="8s" path={graphPath} repeatCount="indefinite" rotate="auto" />
        </circle>
      </svg>
      <span aria-hidden="true" className="member-market-frame" />
      <div aria-hidden="true" className="member-market-plate" />
      <span aria-hidden="true" className="member-market-baseline" />
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
