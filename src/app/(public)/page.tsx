import { ArrowUpRight, ClipboardCheck, LineChart, RotateCw, ShieldCheck } from "lucide-react";
import { CorePillarsSection } from "@/components/sections/core-pillars-section";
import { FaqSection } from "@/components/sections/faq-section";
import { FinalCtaSection } from "@/components/sections/final-cta-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { MembershipPreviewSection } from "@/components/sections/membership-preview-section";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";

const operatingRhythm = [
  {
    title: "Plan",
    description: "วางแผนก่อนเข้าเทรด พร้อมกำหนด setup, risk และเงื่อนไขที่วัดผลได้",
    icon: ClipboardCheck,
  },
  {
    title: "Record",
    description: "บันทึกผลลัพธ์และพฤติกรรมจริงลง Trading Journal หลังจบการเทรด",
    icon: LineChart,
  },
  {
    title: "Review",
    description: "อ่านสถิติและ pattern ของตัวเองเพื่อเห็นจุดแข็ง จุดพลาด และสิ่งที่ต้องแก้",
    icon: RotateCw,
  },
] as const;

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <section className="relative overflow-hidden pb-20 pt-12 sm:pt-14">
        <div aria-hidden="true" className="gold-hairline absolute inset-x-0 top-0 h-px opacity-70" />
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <SectionHeading
              description="Elite Gold Community ถูกออกแบบให้เป็นพื้นที่ฝึกซ้ำ ทบทวนซ้ำ และพัฒนาซ้ำ โดยใช้ข้อมูลจาก Trading Journal เป็นแกนกลางของการเติบโต"
              eyebrow="Trader Operating Rhythm"
              title="เปลี่ยนการเทรดจากความรู้สึก ให้เป็นระบบที่ตรวจสอบได้"
            />
            <div className="grid gap-4 md:grid-cols-3">
              {operatingRhythm.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] p-5 transition-colors hover:border-gold/35 hover:bg-white/[0.055]"
                    key={item.title}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gold/25 bg-gold/10 text-soft-gold">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-lg font-semibold text-white">{item.title}</p>
                    <p className="mt-3 text-sm leading-7 text-text-secondary">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-10 rounded-lg border border-white/10 bg-black/42 p-4 sm:p-5 lg:mt-12">
            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-soft-gold/30 bg-soft-gold/10 text-soft-gold">
                  <ShieldCheck aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">Phase 1: Website Foundation</p>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    เฟสนี้วาง public website, brand structure และพื้นที่นำทางสู่ระบบสมาชิกในอนาคต
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {["Education Library", "Trading Journal", "Member Dashboard"].map((label) => (
                  <div
                    className="flex items-center justify-between rounded-md border border-white/8 bg-white/[0.03] px-3 py-3 text-sm text-text-secondary"
                    key={label}
                  >
                    {label}
                    <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-soft-gold" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>
      <CorePillarsSection />
      <MembershipPreviewSection />
      <HowItWorksSection />
      <FaqSection preview />
      <FinalCtaSection />
    </>
  );
}
