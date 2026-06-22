import { cn } from "@/lib/utils";

type MemberMarketVisualProps = {
  className?: string;
  label?: string;
};

const bars = [
  { accent: false, height: "36%", left: "16%" },
  { accent: false, height: "58%", left: "27%" },
  { accent: true, height: "76%", left: "39%" },
  { accent: false, height: "48%", left: "52%" },
  { accent: false, height: "64%", left: "64%" },
  { accent: true, height: "42%", left: "76%" },
];

const nodes = [
  { left: "22%", top: "39%" },
  { left: "42%", top: "24%" },
  { left: "61%", top: "34%" },
  { left: "78%", top: "27%" },
];

export function MemberMarketVisual({
  className,
  label = "Member dashboard market depth visual",
}: MemberMarketVisualProps) {
  return (
    <div aria-label={label} className={cn("member-market-visual", className)} role="img">
      <div aria-hidden="true" className="member-market-plate" />
      {bars.map((bar) => (
        <span
          aria-hidden="true"
          className={cn("member-market-bar", bar.accent ? "is-accent" : null)}
          key={`${bar.left}-${bar.height}`}
          style={{
            height: bar.height,
            left: bar.left,
          }}
        />
      ))}
      {nodes.map((node) => (
        <span
          aria-hidden="true"
          className="member-market-node"
          key={`${node.left}-${node.top}`}
          style={{
            left: node.left,
            top: node.top,
          }}
        />
      ))}
      <div aria-hidden="true" className="absolute inset-x-8 bottom-7 flex items-center justify-between text-[0.62rem] font-semibold uppercase text-white/26">
        <span>Discipline</span>
        <span>Journal</span>
        <span>Growth</span>
      </div>
    </div>
  );
}
