import type { Metadata } from "next";
import { SignupForm } from "@/components/forms/signup-form";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Sign Up placeholder พร้อม Referral Code สำหรับ Elite Gold Community",
};

type SignupPageProps = {
  searchParams: Promise<{
    ref?: string | string[];
    refCode?: string | string[];
    referral?: string | string[];
    referralCode?: string | string[];
  }>;
};

function getFirstSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const referralCode =
    getFirstSearchParam(params.ref) ??
    getFirstSearchParam(params.refCode) ??
    getFirstSearchParam(params.referral) ??
    getFirstSearchParam(params.referralCode);

  return (
    <>
      <PageHero
        description="หน้า Sign Up นี้เตรียม field สำคัญสำหรับ Phase Authentication และ future affiliate/referral workflow"
        label="Sign Up"
        title="สมัครเข้าร่วม Elite Gold Community"
      />
      <section className="py-16">
        <Container>
          <SignupForm key={referralCode ?? "default-referral"} referralCode={referralCode} />
        </Container>
      </section>
    </>
  );
}
