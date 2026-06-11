import type { Metadata } from "next";
import { ShieldCheck, Target, TrendingUp, UsersRound } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";

export const metadata: Metadata = {
  title: "About Community",
  description: "รู้จัก Elite Gold Community และหลักการของคอมมูนิตี้เทรดเดอร์ที่เน้นการเรียนรู้ การเก็บสถิติ และวินัย",
};

const principles = [
  {
    title: "Focus on Process",
    description: "ให้ความสำคัญกับกระบวนการมากกว่าผลลัพธ์ระยะสั้น",
    icon: Target,
  },
  {
    title: "Data Before Opinion",
    description: "ใช้ข้อมูลจาก Trading Journal เพื่อทบทวนการตัดสินใจ",
    icon: TrendingUp,
  },
  {
    title: "Respectful Community",
    description: "พูดคุยอย่างมืออาชีพ มีเหตุผล และเคารพความเสี่ยงของแต่ละคน",
    icon: UsersRound,
  },
  {
    title: "Risk-Aware Growth",
    description: "พัฒนาทักษะโดยไม่ละเลยการจัดการความเสี่ยงและวินัย",
    icon: ShieldCheck,
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <PageHero
        description="Elite Gold Community ถูกวางให้เป็นพื้นที่สำหรับเทรดเดอร์ที่ต้องการพัฒนาตัวเองแบบเป็นระบบ ไม่ใช่พื้นที่ขายฝันหรือสัญญากำไรระยะสั้น"
        label="About Community"
        title="คอมมูนิตี้สำหรับเทรดเดอร์ที่จริงจังกับการเติบโตระยะยาว"
      />
      <section className="py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <SectionHeading title="Vision" />
              <p className="mt-4 text-base leading-8 text-text-secondary">
                สร้างคอมมูนิตี้ที่ช่วยให้เทรดเดอร์เข้าใจตัวเองผ่านการเรียนรู้ การบันทึกผล และการรีวิวอย่างสม่ำเสมอ
              </p>
            </div>
            <div>
              <SectionHeading title="Mission" />
              <p className="mt-4 text-base leading-8 text-text-secondary">
                เตรียมระบบ public website และ reusable foundation สำหรับต่อยอดไปสู่ Member Dashboard, Trading Education, Trading Journal และ Community Area ใน Phase ถัดไป
              </p>
            </div>
          </div>
        </Container>
      </section>
      <section className="border-y border-white/8 bg-white/[0.02] py-20">
        <Container>
          <SectionHeading
            align="center"
            description="เหมาะกับคนที่ต้องการวัดผลจริง ฝึกวินัย และค่อย ๆ สร้างความเข้าใจในตลาดด้วยระบบที่ชัดเจน"
            title="Who It Is For"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              "มือใหม่ที่ต้องการวางพื้นฐานการเทรดอย่างมีกรอบ",
              "เทรดเดอร์ที่มีประสบการณ์แต่ต้องการรีวิวผลลัพธ์ให้เป็นระบบ",
              "สมาชิกที่ต้องการคอมมูนิตี้ที่พูดเรื่องวินัย ความเสี่ยง และการพัฒนาอย่างจริงจัง",
            ].map((item) => (
              <Card key={item}>
                <CardDescription className="text-base leading-8">{item}</CardDescription>
              </Card>
            ))}
          </div>
        </Container>
      </section>
      <section className="py-20">
        <Container>
          <SectionHeading
            description="หลักการเหล่านี้จะเป็นตัวกำหนดโทนของเนื้อหา คอมมูนิตี้ และฟีเจอร์สมาชิกในอนาคต"
            title="Community Principles"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {principles.map((principle) => {
              const Icon = principle.icon;

              return (
                <Card key={principle.title}>
                  <CardHeader>
                    <Icon aria-hidden="true" className="h-6 w-6 text-soft-gold" />
                    <CardTitle>{principle.title}</CardTitle>
                    <CardDescription>{principle.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
