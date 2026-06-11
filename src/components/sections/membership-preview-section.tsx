import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, Crown, LockKeyhole, Sparkles } from "lucide-react";
import { membershipPlans } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { cn } from "@/lib/utils";

const roadmap = [
  ["Phase 1", "Website Foundation", "Live"],
  ["Phase 2", "Authentication", "Next"],
  ["Phase 3", "Journal Workspace", "Planned"],
  ["Phase 4-6", "Dashboard + Member Platform", "Future"],
] as const;

export function MembershipPreviewSection() {
  return (
    <section className="relative overflow-hidden border-y border-white/8 bg-white/[0.02] py-20">
      <div aria-hidden="true" className="market-grid absolute inset-0 opacity-35" />
      <Container>
        <div className="relative grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <div>
            <SectionHeading
              description="Phase นี้ยังไม่เปิดระบบชำระเงินหรือสิทธิ์สมาชิกจริง แต่เตรียมหน้าและโครงสร้างไว้สำหรับเชื่อมต่อ Dashboard, Education และ Journal ในอนาคต"
              eyebrow="Membership"
              title="สมาชิกภาพที่พร้อมต่อยอดเป็น Member Platform"
            />
            <div className="mt-8 rounded-lg border border-white/10 bg-black/42 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md border border-gold/25 bg-gold/10 text-soft-gold">
                  <LockKeyhole aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-white">Platform Roadmap</p>
                  <p className="mt-1 text-sm text-text-muted">6 phases สำหรับสร้างระบบสมาชิกเต็มรูปแบบ</p>
                </div>
              </div>
              <div className="mt-5 grid gap-2">
                {roadmap.map(([phase, label, status]) => (
                  <div
                    className="grid grid-cols-[4.8rem_1fr_auto] items-center gap-3 rounded-md border border-white/8 bg-white/[0.03] px-3 py-3 text-xs"
                    key={phase}
                  >
                    <span className="font-mono text-soft-gold">{phase}</span>
                    <span className="text-text-secondary">{label}</span>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-1 font-semibold",
                        status === "Live"
                          ? "border-success/25 bg-success/10 text-success"
                          : "border-white/10 bg-white/[0.03] text-text-muted",
                      )}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {membershipPlans.map((plan) => (
              <Card
                className={cn(
                  "relative flex min-h-full flex-col overflow-hidden p-0",
                  plan.highlighted && "border-gold/45 bg-gold/10",
                )}
                key={plan.name}
              >
                {plan.highlighted ? (
                  <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/12 px-2.5 py-1 text-xs font-semibold text-soft-gold">
                    <Crown aria-hidden="true" className="h-3.5 w-3.5" />
                    Recommended
                  </div>
                ) : null}
                <CardHeader className="p-6 pr-28">
                  <span className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-soft-gold">
                    {plan.highlighted ? (
                      <Sparkles aria-hidden="true" className="h-5 w-5" />
                    ) : (
                      <CircleDashed aria-hidden="true" className="h-5 w-5" />
                    )}
                  </span>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <p className="pt-3 text-lg font-semibold text-soft-gold">{plan.price}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col border-t border-white/8 p-6 pt-5">
                  <ul className="grid gap-3 text-sm text-text-secondary">
                    {plan.features.map((feature) => (
                      <li className="flex gap-2" key={feature}>
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 h-4 w-4 shrink-0 text-soft-gold"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    className={buttonVariants({
                      className: "mt-6 w-full",
                      variant: plan.highlighted ? "primary" : "outline",
                    })}
                    href="/membership"
                  >
                    View Membership
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
