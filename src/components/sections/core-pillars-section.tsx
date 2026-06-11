import { GraduationCap, NotebookPen, UsersRound } from "lucide-react";
import { corePillars } from "@/config/site";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";

const icons = [GraduationCap, NotebookPen, UsersRound] as const;

const pillarPreviews = [
  {
    label: "Module path",
    rows: ["Market Structure", "Risk Framework", "Trading Psychology"],
  },
  {
    label: "Journal fields",
    rows: ["Setup Quality", "Risk / R", "Emotion State"],
  },
  {
    label: "Review rooms",
    rows: ["Weekly Review", "Trade Breakdown", "Community Q&A"],
  },
] as const;

export function CorePillarsSection() {
  return (
    <section className="relative py-20">
      <Container>
        <SectionHeading
          description="ทุกส่วนของ Elite Gold Community ถูกออกแบบให้ช่วยเทรดเดอร์กลับมาเห็นข้อมูลจริงของตัวเอง และตัดสินใจบนพื้นฐานที่ชัดเจนขึ้น"
          eyebrow="Core Pillars"
          title="3 แกนหลักสำหรับการพัฒนาเทรดเดอร์"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {corePillars.map((pillar, index) => {
            const Icon = icons[index];
            const preview = pillarPreviews[index];

            return (
              <Card className="group relative overflow-hidden p-0" key={pillar.title}>
                <div
                  aria-hidden="true"
                  className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent opacity-70"
                />
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-gold/25 bg-gold/10 text-soft-gold">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="font-mono text-xs text-text-muted">0{index + 1}</span>
                  </div>
                  <CardTitle className="pt-3">{pillar.title}</CardTitle>
                  <CardDescription>{pillar.description}</CardDescription>
                </CardHeader>
                <div className="border-t border-white/8 bg-black/30 p-5">
                  <p className="text-xs font-semibold uppercase text-soft-gold">
                    {preview.label}
                  </p>
                  <div className="mt-4 grid gap-2">
                    {preview.rows.map((row, rowIndex) => (
                      <div
                        className="flex items-center justify-between rounded-md border border-white/8 bg-white/[0.03] px-3 py-2.5 text-xs text-text-secondary"
                        key={row}
                      >
                        <span>{row}</span>
                        <span
                          aria-hidden="true"
                          className="h-1.5 rounded-full bg-soft-gold/70"
                          style={{ width: `${48 + rowIndex * 18}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
