import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  description: string;
  label?: string;
  className?: string;
};

export function PageHero({ title, description, label, className }: PageHeroProps) {
  return (
    <section className={cn("border-b border-white/8 py-16 sm:py-20", className)}>
      <Container>
        <div className="max-w-4xl">
          {label ? (
            <p className="mb-3 text-sm font-semibold uppercase text-soft-gold">
              {label}
            </p>
          ) : null}
          <h1 className="text-balance text-4xl font-semibold leading-tight text-white sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-9 text-text-secondary">
            {description}
          </p>
        </div>
      </Container>
    </section>
  );
}
