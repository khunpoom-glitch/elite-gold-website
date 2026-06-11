import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, NotebookPen } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const ctaItems = [
  {
    title: "Education",
    description: "เรียนรู้โครงสร้างและ risk framework",
    icon: BookOpenCheck,
  },
  {
    title: "Journal",
    description: "บันทึกผลเทรดและพฤติกรรมที่เกิดขึ้น",
    icon: NotebookPen,
  },
  {
    title: "Review",
    description: "ใช้ข้อมูลจริงเพื่อพัฒนาวินัยระยะยาว",
    icon: BarChart3,
  },
] as const;

export function FinalCtaSection() {
  return (
    <section className="py-20">
      <Container>
        <div className="premium-surface relative overflow-hidden rounded-lg border border-gold/30 bg-black/58 p-8 sm:p-10 lg:p-12">
          <div aria-hidden="true" className="market-grid absolute inset-0 opacity-30" />
          <div aria-hidden="true" className="gold-hairline absolute inset-x-8 top-0 h-px" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.86fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase text-soft-gold">
                Build your trading discipline
              </p>
              <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
                เริ่มสร้างระบบการเรียนรู้และการรีวิวผลเทรดของคุณ
              </h2>
              <p className="mt-4 text-base leading-8 text-text-secondary sm:text-lg">
                Phase 1 เตรียมพื้นที่ public website ให้พร้อมสำหรับระบบสมาชิก Education, Journal และ Community ในเฟสถัดไป
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link className={buttonVariants({ size: "lg" })} href="/signup">
                  Sign Up
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link className={buttonVariants({ variant: "secondary", size: "lg" })} href="/contact">
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="grid gap-3">
              {ctaItems.map((item) => {
                const Icon = item.icon;

                return (
                <div
                  className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] p-4"
                  key={item.title}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gold/25 bg-gold/10 text-soft-gold">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">{item.description}</p>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
