import { Prompt } from "next/font/google";
import { HeroSection } from "@/components/blocks/hero-section-1";
import { AuthRouteModal } from "@/components/layout/auth-route-modal";
import type { AuthMode } from "@/components/layout/auth-modal";
import { PublicFooter } from "@/components/layout/public-footer";
import { HomeContentSections } from "@/components/sections/home-content-sections";
import { HomeScrollController } from "@/components/sections/home-scroll-controller";
import { EliteGoldNavbarLogo } from "@/components/shared/elite-gold-navbar-logo";
import { TOP_SECTION_ID, type HomeSectionId } from "@/config/home-sections";

const prompt = Prompt({
  display: "swap",
  subsets: ["latin", "thai"],
  variable: "--font-airova-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export function HomePage({
  initialAuthMode = null,
  initialReferralCode,
  initialSection = TOP_SECTION_ID,
}: {
  initialAuthMode?: AuthMode | null;
  initialReferralCode?: string;
  initialSection?: HomeSectionId;
}) {
  return (
    <div
      className={`${prompt.variable} airova-reference-page dark min-h-screen bg-background font-[family-name:var(--font-airova-sans)] text-foreground`}
    >
      <HomeScrollController initialSection={initialSection} />
      <HeroSection />
      <AuthRouteModal initialMode={initialAuthMode} referralCode={initialReferralCode} />
      <HomeContentSections />
      <PublicFooter logo={<EliteGoldNavbarLogo />} />
    </div>
  );
}
