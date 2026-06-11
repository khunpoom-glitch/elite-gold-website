import type { Metadata } from "next";
import { Mail, MessageCircle, UsersRound } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { PageHero } from "@/components/sections/page-hero";
import { siteConfig } from "@/config/site";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/shared/section-heading";

export const metadata: Metadata = {
  title: "Contact",
  description: "ติดต่อ Elite Gold Community",
};

const channels = [
  {
    title: "Email Support",
    description: siteConfig.contactEmail,
    icon: Mail,
  },
  {
    title: "Community Inquiry",
    description: "สอบถามเกี่ยวกับ Membership และการเข้าร่วมคอมมูนิตี้",
    icon: UsersRound,
  },
  {
    title: "Support Channel",
    description: siteConfig.supportLine,
    icon: MessageCircle,
  },
] as const;

export default function ContactPage() {
  return (
    <>
      <PageHero
        description="ส่งข้อความหา Elite Gold Community เพื่อสอบถามเรื่องคอมมูนิตี้ การเรียนรู้ หรือ membership preview"
        label="Contact"
        title="ติดต่อทีม Elite Gold Community"
      />
      <section className="py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr]">
            <div>
              <SectionHeading
                description="ฟอร์มนี้เป็น placeholder success state สำหรับ Phase 1 และยังไม่ส่งข้อมูลไป backend"
                title="Contact Form"
              />
              <div className="mt-8 grid gap-4">
                {channels.map((channel) => {
                  const Icon = channel.icon;

                  return (
                    <Card key={channel.title}>
                      <CardHeader>
                        <Icon aria-hidden="true" className="h-5 w-5 text-soft-gold" />
                        <CardTitle className="text-lg">{channel.title}</CardTitle>
                        <CardDescription>{channel.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
            <ContactForm />
          </div>
        </Container>
      </section>
    </>
  );
}
