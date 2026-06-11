import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { membershipPlans } from "@/config/site";
import { PageHero } from "@/components/sections/page-hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Membership",
  description: "Membership preview สำหรับ Elite Gold Community",
};

export default function MembershipPage() {
  return (
    <>
      <PageHero
        description="Membership page ใน Phase นี้เป็น pricing และ access preview เท่านั้น ยังไม่ต่อ payment, dashboard permission หรือ affiliate tracking"
        label="Membership"
        title="เลือกเส้นทางสมาชิกสำหรับ Education, Journal และ Community"
      />
      <section className="py-20">
        <Container>
          <div className="grid gap-5 lg:grid-cols-2">
            {membershipPlans.map((plan) => (
              <Card
                className={cn(
                  "flex min-h-full flex-col p-7",
                  plan.highlighted && "border-gold/45 bg-gold/10",
                )}
                key={plan.name}
              >
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <p className="pt-4 text-xl font-semibold text-soft-gold">{plan.price}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="grid gap-4 text-sm text-text-secondary">
                    {plan.features.map((feature) => (
                      <li className="flex gap-3" key={feature}>
                        <CheckCircle2
                          aria-hidden="true"
                          className="mt-0.5 h-5 w-5 shrink-0 text-soft-gold"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    className={buttonVariants({
                      className: "mt-8 w-full",
                      size: "lg",
                      variant: plan.highlighted ? "primary" : "outline",
                    })}
                    href="/signup"
                  >
                    Sign Up
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>
      <section className="border-y border-white/8 bg-white/[0.02] py-20">
        <Container>
          <SectionHeading
            description="Membership access จะเชื่อมกับ Member Dashboard หลังจาก Phase Authentication พร้อมใช้งาน"
            title="Future Dashboard Access"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {["Dashboard", "Education", "Journal", "Community"].map((item) => (
              <div className="rounded-lg border border-white/10 bg-black/35 p-5" key={item}>
                <p className="text-lg font-semibold text-white">{item}</p>
                <p className="mt-2 text-sm text-text-muted">Future member area</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
