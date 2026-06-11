import type { Metadata } from "next";
import { FaqSection } from "@/components/sections/faq-section";
import { PageHero } from "@/components/sections/page-hero";

export const metadata: Metadata = {
  title: "FAQ",
  description: "คำถามที่พบบ่อยเกี่ยวกับ Elite Gold Community",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        description="รวมคำถามสำคัญเกี่ยวกับ Membership, Trading Education, Trading Journal, Community และ Referral Code ใน Phase foundation"
        label="FAQ"
        title="คำถามที่พบบ่อยเกี่ยวกับ Elite Gold Community"
      />
      <FaqSection />
    </>
  );
}
