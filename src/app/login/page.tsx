import type { Metadata } from "next";
import { HomePage } from "@/components/sections/home-page";

export const metadata: Metadata = {
  title: "Login",
  description: "Login สำหรับ Elite Gold Community",
};

export default function LoginPage() {
  return <HomePage initialAuthMode="login" />;
}
