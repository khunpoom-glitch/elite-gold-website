import type { Metadata } from "next";
import Link from "next/link";
import { LockKeyhole, PlayCircle } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Trading Education",
  description: "ตัวอย่างโครงสร้าง Trading Education สำหรับ Elite Gold Community",
};

const categories = [
  "Market Structure",
  "Risk Management",
  "Trading Psychology",
  "Position Management",
  "Strategy Foundation",
] as const;

const learningPath = [
  "Foundation",
  "Risk Framework",
  "Trade Planning",
  "Journal Review",
  "Community Session",
] as const;

export default function EducationPage() {
  return (
    <>
      <PageHero
        description="หน้า public preview สำหรับเส้นทางการเรียนรู้ของ Elite Gold Community โดยยังไม่เปิด locked content หรือระบบสมาชิกจริงใน Phase นี้"
        label="Trading Education"
        title="เรียนรู้การเทรดผ่านโครงสร้างที่วัดผลและทบทวนได้"
      />
      <section className="py-20">
        <Container>
          <SectionHeading
            description="Education จะเชื่อมกับ Trading Journal ในอนาคต เพื่อให้บทเรียนไม่หยุดอยู่ที่ทฤษฎี แต่กลับไปวัดผลกับการเทรดจริงของสมาชิก"
            title="Education Overview"
          />
          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {learningPath.map((step, index) => (
              <div className="rounded-lg border border-white/10 bg-black/35 p-5" key={step}>
                <p className="font-mono text-sm text-soft-gold">0{index + 1}</p>
                <h2 className="mt-5 text-lg font-semibold text-white">{step}</h2>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <section className="border-y border-white/8 bg-white/[0.02] py-20">
        <Container>
          <SectionHeading
            align="center"
            description="หมวดหมู่เหล่านี้เป็น placeholder สำหรับ Education Library ที่จะต่อยอดใน Phase ถัดไป"
            title="Course Categories"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-lg">{category}</CardTitle>
                  <CardDescription>Public preview category</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>
      <section className="py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <SectionHeading
              description="ตัวอย่างบทเรียนยังเป็น preview เพื่อสื่อสารทิศทางของแพลตฟอร์ม โดยยังไม่เปิดเนื้อหาเต็ม"
              title="Preview Lessons"
            />
            <div className="grid gap-3">
              {[
                "How to read market structure without overtrading",
                "Building a risk plan before entering a trade",
                "Using a journal review to identify recurring mistakes",
              ].map((lesson) => (
                <div
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface/70 p-4"
                  key={lesson}
                >
                  <PlayCircle aria-hidden="true" className="h-5 w-5 text-soft-gold" />
                  <p className="text-sm font-medium text-white">{lesson}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10">
            <EmptyState
              description="Full Education Library จะเปิดผ่านระบบสมาชิกและ Dashboard ในอนาคต"
              title="Locked Content Preview"
            />
            <Link className={buttonVariants({ className: "mt-6", size: "lg" })} href="/signup">
              <LockKeyhole aria-hidden="true" className="h-4 w-4" />
              Sign Up to Access Full Education
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
