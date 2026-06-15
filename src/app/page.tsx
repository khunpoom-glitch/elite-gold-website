import type { Metadata } from "next";
import { HomePage } from "@/components/sections/home-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootHomePage() {
  return <HomePage />;
}
