import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";
import { PageHero } from "@/components/sections/page-hero";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = {
  title: "Login",
  description: "Login placeholder สำหรับ Elite Gold Community",
};

export default function LoginPage() {
  return (
    <>
      <PageHero
        description="หน้า Login นี้เป็น UI placeholder สำหรับเตรียม Phase Authentication ยังไม่มีการตรวจสอบบัญชีหรือ session จริง"
        label="Login"
        title="เข้าสู่ระบบสมาชิก"
      />
      <section className="py-16">
        <Container>
          <LoginForm />
        </Container>
      </section>
    </>
  );
}
