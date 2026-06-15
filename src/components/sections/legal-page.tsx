import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PublicFooter } from "@/components/layout/public-footer";
import { EliteGoldNavbarLogo } from "@/components/shared/elite-gold-navbar-logo";
import { Container } from "@/components/ui/container";
import type { LegalPageData } from "@/config/legal";

type LegalPageProps = {
  page: LegalPageData;
};

export function LegalPage({ page }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-black text-foreground">
      <header className="border-b border-white/8 bg-black/95">
        <Container className="flex min-h-20 items-center justify-between gap-4 py-4">
          <Link aria-label="Elite Gold Community home" href="/">
            <EliteGoldNavbarLogo priority />
          </Link>
          <Link
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm font-medium text-text-secondary transition-colors hover:border-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-soft-gold"
            href="/"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Home
          </Link>
        </Container>
      </header>

      <main>
        <section className="border-b border-white/8 py-16 sm:py-20">
          <Container>
            <div className="max-w-3xl">
              <p className="elite-display-type text-xs font-semibold uppercase text-soft-gold sm:text-sm">
                {page.eyebrow}
              </p>
              <h1 className="elite-display-type mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                {page.title}
              </h1>
              <p className="mt-5 text-base leading-8 text-muted-foreground sm:text-lg">
                {page.description}
              </p>
              <p className="mt-5 text-sm text-text-muted">Last updated: {page.updatedAt}</p>
            </div>
          </Container>
        </section>

        <section className="py-14 sm:py-16">
          <Container>
            <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
              <aside className="hidden lg:block">
                <div className="sticky top-28 border-l border-white/10 pl-5">
                  <p className="elite-display-type text-xs font-semibold uppercase text-soft-gold">
                    On This Page
                  </p>
                  <nav aria-label={`${page.title} sections`} className="mt-5 grid gap-3">
                    {page.sections.map((section) => (
                      <a
                        className="text-sm text-text-secondary transition-colors hover:text-white"
                        href={`#${section.title.toLowerCase().replaceAll(" ", "-")}`}
                        key={section.title}
                      >
                        {section.title}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              <div className="grid gap-6">
                {page.sections.map((section) => (
                  <section
                    className="rounded-md border border-white/10 bg-black/80 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_20px_64px_rgba(0,0,0,0.34)] sm:p-7"
                    id={section.title.toLowerCase().replaceAll(" ", "-")}
                    key={section.title}
                  >
                    <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                    <div className="mt-4 grid gap-4">
                      {section.paragraphs.map((paragraph) => (
                        <p className="text-sm leading-7 text-muted-foreground" key={paragraph}>
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </main>

      <PublicFooter logo={<EliteGoldNavbarLogo />} />
    </div>
  );
}
