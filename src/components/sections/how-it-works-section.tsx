import { BookOpenCheck, ChartNoAxesColumnIncreasing, MessageSquareText, NotebookPen } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";

const steps = [
  {
    title: "เรียนรู้โครงสร้าง",
    description: "เริ่มจากพื้นฐานตลาด ความเสี่ยง จิตวิทยา และกรอบคิดของการเป็นเทรดเดอร์",
    icon: BookOpenCheck,
  },
  {
    title: "บันทึกข้อมูลจริง",
    description: "ใช้ Trading Journal เพื่อเก็บผลลัพธ์ เหตุผลการเข้าเทรด และพฤติกรรมที่เกิดขึ้น",
    icon: NotebookPen,
  },
  {
    title: "รีวิวและปรับปรุง",
    description: "ดูสถิติและ pattern ของตัวเองเพื่อแยกสิ่งที่ควรทำซ้ำออกจากสิ่งที่ควรแก้",
    icon: ChartNoAxesColumnIncreasing,
  },
  {
    title: "เติบโตกับคอมมูนิตี้",
    description: "แลกเปลี่ยนมุมมองอย่างมีเหตุผลในพื้นที่ที่ให้คุณค่ากับวินัยและการพัฒนา",
    icon: MessageSquareText,
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <Container>
        <SectionHeading
          align="center"
          description="Elite Gold Community ไม่ได้เน้นสัญญาผลลัพธ์ระยะสั้น แต่เน้นกระบวนการที่ช่วยให้เทรดเดอร์วัดผลและปรับปรุงตัวเองได้"
          title="Learn. Journal. Grow."
        />
        <div className="relative mt-12 grid gap-5 lg:grid-cols-4">
          <div
            aria-hidden="true"
            className="absolute left-8 right-8 top-10 hidden h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent lg:block"
          />
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                className="relative rounded-lg border border-white/10 bg-black/42 p-6 transition-colors hover:border-gold/35 hover:bg-white/[0.035]"
                key={step.title}
              >
                <div className="flex items-center justify-between">
                  <span className="relative z-10 inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-black text-soft-gold shadow-[0_0_0_8px_rgba(5,5,5,0.85)]">
                    0{index + 1}
                  </span>
                  <Icon aria-hidden="true" className="h-5 w-5 text-soft-gold" />
                </div>
                <h3 className="mt-7 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">{step.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
