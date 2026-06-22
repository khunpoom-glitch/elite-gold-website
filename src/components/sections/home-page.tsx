import { Prompt } from "next/font/google";
import { HeroSection } from "@/components/blocks/hero-section-1";
import { AuthRouteModal } from "@/components/layout/auth-route-modal";
import type { AuthMode } from "@/components/layout/auth-modal";
import { PublicFooter } from "@/components/layout/public-footer";
import { HomeContentSections } from "@/components/sections/home-content-sections";
import { HomeScrollController } from "@/components/sections/home-scroll-controller";
import { EliteGoldNavbarLogo } from "@/components/shared/elite-gold-navbar-logo";
import { TOP_SECTION_ID, type HomeSectionId } from "@/config/home-sections";
import type { GoogleSignupProfile } from "@/lib/member/profile";
import {
  guestPublicSession,
  type PublicSessionState,
} from "@/lib/member/public-session";

const prompt = Prompt({
  display: "swap",
  subsets: ["latin", "thai"],
  variable: "--font-airova-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export function HomePage({
  initialAccessCode,
  initialAuthMode = null,
  initialAuthNotice,
  initialGoogleSignupProfile,
  initialSection = TOP_SECTION_ID,
  publicSession = guestPublicSession,
}: {
  initialAccessCode?: string;
  initialAuthMode?: AuthMode | null;
  initialAuthNotice?: string;
  initialGoogleSignupProfile?: GoogleSignupProfile;
  initialSection?: HomeSectionId;
  publicSession?: PublicSessionState;
}) {
  return (
    <div
      className={`${prompt.variable} airova-reference-page dark min-h-screen bg-background font-[family-name:var(--font-airova-sans)] text-foreground`}
    >
      <HomeScrollController initialSection={initialSection} />
      <HeroSection publicSession={publicSession} />
      <AuthRouteModal
        accessCode={initialAccessCode}
        initialGoogleSignupProfile={initialGoogleSignupProfile}
        initialMode={initialAuthMode}
        initialNotice={initialAuthNotice}
      />
      <HomeContentSections />
      <PublicFooter logo={<EliteGoldNavbarLogo />} />
    </div>
  );
}
