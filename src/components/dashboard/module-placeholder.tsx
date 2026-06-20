import type { LucideIcon } from "lucide-react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";

type ModulePlaceholderProps = {
  description: string;
  eyebrow: string;
  icon: LucideIcon;
  items: string[];
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
    <section className="grid gap-6">
      <div className="rounded-md border border-white/10 bg-black/70 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055),0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/24 bg-gold/10 px-3 py-1 text-xs font-bold uppercase text-soft-gold">
              <Icon aria-hidden="true" className="size-3.5" />
              {eyebrow}
            </span>
            <h1 className="elite-display-type mt-4 text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {description}
            </p>
          </div>

          <Link
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gold/30 bg-gold/10 px-4 text-sm font-bold text-soft-gold transition hover:border-soft-gold hover:bg-gold/16 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-gold/50"
            href={primaryHref}
          >
            {primaryLabel}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <article
            className="rounded-md border border-white/10 bg-black/72 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]"
            key={item}
          >
            <LockKeyhole aria-hidden="true" className="size-5 text-soft-gold" />
            <h2 className="mt-4 text-sm font-semibold text-white">{item}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Preview shell only in Phase 3. Full functionality is reserved for the mapped later phase.
            </p>
          </article>
        ))}
      </section>
    </section>
  );
}
