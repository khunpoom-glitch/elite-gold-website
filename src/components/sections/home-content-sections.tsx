import type { HTMLAttributes, ReactNode } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  CircleDashed,
  Crown,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { AuthLink } from "@/components/layout/auth-link";
import { faqItems, membershipPlans } from "@/config/site";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

const aboutPrinciples = [
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

const whoItIsFor = [
  "มือใหม่ที่ต้องการวางพื้นฐานการเทรดอย่างมีกรอบ",
  "เทรดเดอร์ที่มีประสบการณ์แต่ต้องการรีวิวผลลัพธ์ให้เป็นระบบ",
  "สมาชิกที่ต้องการคอมมูนิตี้ที่พูดเรื่องวินัย ความเสี่ยง และการพัฒนาอย่างจริงจัง",
] as const;

const learningPath = [
  "Foundation",
  "Risk Framework",
  "Trade Planning",
  "Journal Review",
  "Community Session",
] as const;

const courseCategories = [
  "Market Structure",
  "Risk Management",
  "Trading Psychology",
  "Position Management",
  "Strategy Foundation",
] as const;

const featuredLessons = [
  "How to read market structure without overtrading",
  "Building a risk plan before entering a trade",
  "Using a journal review to identify recurring mistakes",
] as const;

const futureDashboardAccess = ["Dashboard", "Education", "Journal", "Community"] as const;

function HomeSection({
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-t border-white/8 py-20",
        className,
      )}
      {...props}
    />
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p className="elite-display-type text-xs font-semibold uppercase text-soft-gold sm:text-sm">
        {eyebrow}
      </p>
      <h2 className="elite-display-type mt-3 text-balance text-3xl font-semibold leading-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base font-light leading-8 text-muted-foreground sm:text-lg">
        {description}
      </p>
    </div>
  );
}

function HomeCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-md border border-white/10 bg-black/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_20px_64px_rgba(0,0,0,0.34)] transition-[border-color,background-color,box-shadow] duration-300 hover:border-soft-gold/35 hover:bg-[#050505] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_0_34px_rgba(212,175,55,0.1),0_24px_76px_rgba(0,0,0,0.42)]",
        className,
      )}
      {...props}
    />
  );
}

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-soft-gold/30 bg-soft-gold/10 text-soft-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      {children}
    </span>
  );
}

export function HomeContentSections() {
  return (
    <>
      <HomeSection id="about-community">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
            <SectionIntro
              description="Elite Gold Community ถูกวางให้เป็นพื้นที่สำหรับเทรดเดอร์ที่ต้องการพัฒนาตัวเองแบบเป็นระบบ ไม่ใช่พื้นที่ขายฝันหรือสัญญากำไรระยะสั้น"
              eyebrow="About Community"
              title="คอมมูนิตี้สำหรับเทรดเดอร์ที่จริงจังกับการเติบโตระยะยาว"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <HomeCard className="p-5">
                <p className="elite-display-type text-xs font-semibold uppercase text-soft-gold">
                  Vision
                </p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  สร้างคอมมูนิตี้ที่ช่วยให้เทรดเดอร์เข้าใจตัวเองผ่านการเรียนรู้ การบันทึกผล และการรีวิวอย่างสม่ำเสมอ
                </p>
              </HomeCard>
              <HomeCard className="p-5">
                <p className="elite-display-type text-xs font-semibold uppercase text-soft-gold">
                  Mission
                </p>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  สร้างระบบเว็บไซต์และประสบการณ์สมาชิกให้เชื่อมต่อกับ Member Dashboard, Trading Education, Trading Journal และ Community Area อย่างเป็นระบบ
                </p>
              </HomeCard>
            </div>
          </div>

          <div className="mt-12">
            <SectionIntro
              align="center"
              description="เหมาะกับคนที่ต้องการวัดผลจริง ฝึกวินัย และค่อย ๆ สร้างความเข้าใจในตลาดด้วยระบบที่ชัดเจน"
              eyebrow="Audience"
              title="Who It Is For"
            />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {whoItIsFor.map((item) => (
                <HomeCard className="p-5" key={item}>
                  <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                </HomeCard>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <SectionIntro
              description="หลักการเหล่านี้จะเป็นตัวกำหนดโทนของเนื้อหา คอมมูนิตี้ และฟีเจอร์สมาชิกในอนาคต"
              eyebrow="Community Principles"
              title="Community Principles"
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {aboutPrinciples.map((principle) => {
                const Icon = principle.icon;

                return (
                  <HomeCard className="p-6" key={principle.title}>
                    <Icon aria-hidden="true" className="h-6 w-6 text-soft-gold" />
                    <h3 className="mt-5 text-xl font-semibold text-white">{principle.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {principle.description}
                    </p>
                  </HomeCard>
                );
              })}
            </div>
          </div>
        </Container>
      </HomeSection>

      <HomeSection id="trading-education">
        <Container>
          <SectionIntro
            align="center"
            description="เส้นทางการเรียนรู้ของ Elite Gold Community ถูกออกแบบให้ต่อยอดจากพื้นฐาน ไปสู่การวางแผน การจัดการความเสี่ยง และการรีวิวผลลัพธ์อย่างเป็นระบบ"
            eyebrow="Trading Education"
            title="เรียนรู้การเทรดผ่านโครงสร้างที่วัดผลและทบทวนได้"
          />
          <div className="mx-auto mt-6 max-w-3xl text-center text-sm leading-7 text-muted-foreground">
            Education จะเชื่อมกับ Trading Journal ในอนาคต เพื่อให้บทเรียนไม่หยุดอยู่ที่ทฤษฎี แต่กลับไปวัดผลกับการเทรดจริงของสมาชิก
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {learningPath.map((step, index) => (
              <HomeCard className="p-5" key={step}>
                <p className="font-mono text-sm text-soft-gold">0{index + 1}</p>
                <h3 className="mt-5 text-lg font-semibold text-white">{step}</h3>
              </HomeCard>
            ))}
          </div>

          <div className="mt-12">
            <SectionIntro
              align="center"
              description="หมวดหมู่หลักสำหรับสร้างพื้นฐานการเทรด วินัย และการจัดการความเสี่ยงให้ชัดเจนขึ้น"
              eyebrow="Education Library"
              title="Course Categories"
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {courseCategories.map((category) => (
                <HomeCard className="p-5" key={category}>
                  <BookOpenCheck aria-hidden="true" className="h-5 w-5 text-soft-gold" />
                  <h3 className="mt-5 text-lg font-semibold text-white">{category}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Structured learning track
                  </p>
                </HomeCard>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <SectionIntro
              description="บทเรียนที่ช่วยให้สมาชิกเชื่อมความรู้กับการลงมือวางแผนและรีวิวพฤติกรรมการเทรด"
              eyebrow="Lessons"
              title="Featured Lessons"
            />
            <div className="grid gap-3">
              {featuredLessons.map((lesson) => (
                <HomeCard className="flex items-center gap-3 p-4" key={lesson}>
                  <PlayCircle aria-hidden="true" className="h-5 w-5 shrink-0 text-soft-gold" />
                  <p className="text-sm font-medium leading-6 text-white">{lesson}</p>
                </HomeCard>
              ))}
            </div>
          </div>

          <HomeCard className="mt-10 p-5 sm:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-start gap-3">
                <IconTile>
                  <LockKeyhole aria-hidden="true" className="h-5 w-5" />
                </IconTile>
                <div>
                  <h3 className="text-xl font-semibold text-white">Member Content Access</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Full Education Library เปิดให้เข้าถึงผ่านระบบสมาชิกและ Member Dashboard
                  </p>
                </div>
              </div>
              <AuthLink
                className={buttonVariants({
                  className: "w-full rounded-lg lg:w-auto",
                  size: "lg",
                })}
                mode="signup"
              >
                <LockKeyhole aria-hidden="true" className="h-4 w-4" />
                Sign Up to Access Full Education
              </AuthLink>
            </div>
          </HomeCard>
        </Container>
      </HomeSection>

      <HomeSection className="border-y" id="membership">
        <Container>
          <SectionIntro
            align="center"
            description="Membership เชื่อม Education, Journal และ Community เข้ากับเส้นทางการพัฒนาของสมาชิกในที่เดียว"
            eyebrow="Membership"
            title="เลือกเส้นทางสมาชิกสำหรับ Education, Journal และ Community"
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {membershipPlans.map((plan) => (
              <HomeCard
                className={cn(
                  "flex min-h-full flex-col p-7",
                  plan.highlighted && "border-soft-gold/45 bg-[#070604]",
                )}
                key={plan.name}
              >
                <div className="flex items-start justify-between gap-4">
                  <IconTile>
                    {plan.highlighted ? (
                      <Sparkles aria-hidden="true" className="h-5 w-5" />
                    ) : (
                      <CircleDashed aria-hidden="true" className="h-5 w-5" />
                    )}
                  </IconTile>
                  {plan.highlighted ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-soft-gold/30 bg-soft-gold/10 px-2.5 py-1 text-xs font-semibold text-soft-gold">
                      <Crown aria-hidden="true" className="h-3.5 w-3.5" />
                      Recommended
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-5 text-2xl font-semibold text-white">{plan.name}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{plan.description}</p>
                <p className="pt-4 text-xl font-semibold text-soft-gold">{plan.price}</p>
                <ul className="mt-6 grid gap-4 text-sm text-muted-foreground">
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
                <AuthLink
                  className={buttonVariants({
                    className: "mt-8 w-full rounded-lg",
                    size: "lg",
                    variant: plan.highlighted ? "primary" : "outline",
                  })}
                  mode="signup"
                >
                  Sign Up
                </AuthLink>
              </HomeCard>
            ))}
          </div>

          <div className="mt-12">
            <SectionIntro
              description="พื้นที่สมาชิกถูกวางให้รองรับการเรียนรู้ การบันทึกผล และการรีวิวพัฒนาการอย่างต่อเนื่อง"
              eyebrow="Member Platform"
              title="Future Dashboard Access"
            />
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {futureDashboardAccess.map((item) => (
                <HomeCard className="p-5" key={item}>
                  <p className="text-lg font-semibold text-white">{item}</p>
                  <p className="mt-2 text-sm text-muted-foreground">Planned member area</p>
                </HomeCard>
              ))}
            </div>
          </div>
        </Container>
      </HomeSection>

      <HomeSection id="faq">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
            <SectionIntro
              description="รวมคำถามสำคัญเกี่ยวกับ Membership, Trading Education, Trading Journal, Community และ Access Code"
              eyebrow="FAQ"
              title="คำถามที่พบบ่อยเกี่ยวกับ Elite Gold Community"
            />
            <div>
              <p className="elite-display-type text-xs font-semibold uppercase text-soft-gold sm:text-sm">
                คำถามที่พบบ่อย
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                คำตอบสั้น ๆ สำหรับผู้ที่กำลังสำรวจ Elite Gold Community ก่อนเปิดระบบสมาชิกจริง
              </p>
              <div className="mt-6 grid gap-3">
                {faqItems.map((item) => (
                  <details
                    className="group rounded-md border border-white/10 bg-black/80 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_18px_54px_rgba(0,0,0,0.3)] open:border-soft-gold/35"
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
                    <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </HomeSection>

    </>
  );
}
