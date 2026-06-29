import type { LucideIcon } from "lucide-react";
import { ArrowRight, Clock3 } from "lucide-react";
import Link from "next/link";
import { MemberMarketVisual } from "@/components/dashboard/member-market-visual";

type ModulePlaceholderProps = {
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  items: Array<{
    description: string;
    label: string;
    status?: string;
  }>;
  primaryHref?: string;
  primaryLabel?: string;
  title: string;
};

export function ModulePlaceholder({
  description,
  eyebrow,
  icon: Icon,
  items,
  primaryHref = "/dashboard",
  primaryLabel = "Back to Dashboard",
  title,
}: ModulePlaceholderProps) {
  return (
    <section className="grid gap-5">
      <div className="member-surface overflow-hidden p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.52fr)] lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-between gap-8">
            <div>
              <span className="member-kicker">
                <Icon aria-hidden="true" className="size-3.5" />
                {eyebrow}
              </span>
              <h1 className="elite-display-type mt-5 text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58 sm:text-base">
                {description}
              </p>
            </div>

            <Link
              className="member-shimmer-action inline-flex h-11 w-fit items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              href={primaryHref}
            >
              {primaryLabel}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>

          <MemberMarketVisual className="min-h-[15rem]" label={`${eyebrow} market depth visual`} />
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <article className="member-surface-soft p-5" key={item.label}>
            <div className="flex items-start justify-between gap-3">
              <Clock3 aria-hidden="true" className="size-5 shrink-0 text-white/46" />
              {item.status ? (
                <span className="rounded-full border border-white/8 bg-[#171717] px-2 py-1 text-[0.6rem] font-bold uppercase text-white/34">
                  {item.status}
                </span>
              ) : null}
            </div>
            <h2 className="mt-4 text-sm font-semibold text-white">{item.label}</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">{item.description}</p>
          </article>
        ))}
      </section>
    </section>
  );
}
