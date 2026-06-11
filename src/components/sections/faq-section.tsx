import Link from "next/link";
import { faqItems } from "@/config/site";
import type { FaqItem } from "@/types";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";

type FaqSectionProps = {
  items?: FaqItem[];
  preview?: boolean;
};

export function FaqSection({ items = faqItems, preview = false }: FaqSectionProps) {
  const visibleItems = preview ? items.slice(0, 3) : items;

  return (
    <section className="border-t border-white/8 py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.84fr_1.16fr]">
          <div>
            <SectionHeading
              description="คำตอบสั้น ๆ สำหรับผู้ที่กำลังสำรวจ Elite Gold Community ก่อนเปิดระบบสมาชิกจริง"
              eyebrow="FAQ"
              title="คำถามที่พบบ่อย"
            />
            {preview ? (
              <Link
                className={buttonVariants({ variant: "outline", className: "mt-8" })}
                href="/faq"
              >
                Read All FAQ
              </Link>
            ) : null}
          </div>
          <div className="grid gap-3">
            {visibleItems.map((item) => (
              <details
                className="group rounded-lg border border-border bg-surface/70 p-5 open:border-gold/35"
                key={item.question}
              >
                <summary className="cursor-pointer list-none text-base font-semibold text-white marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.question}
                    <span className="text-soft-gold transition-transform group-open:rotate-45">
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-text-secondary">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
