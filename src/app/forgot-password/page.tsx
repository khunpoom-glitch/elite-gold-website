import type { Metadata } from "next";
import { HomePage } from "@/components/sections/home-page";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "รีเซ็ตรหัสผ่านสำหรับสมาชิก Elite Gold Community",
  alternates: {
    canonical: "/forgot-password",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgotPasswordPage() {
  return <HomePage initialAuthMode="forgotPassword" />;
}
