export type LegalPageData = {
  slug: "privacy" | "terms" | "risk-disclosure";
  title: string;
  description: string;
  eyebrow: string;
  updatedAt: string;
  sections: Array<{
    title: string;
    paragraphs: string[];
  }>;
};

export const legalPages = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    eyebrow: "Legal",
    updatedAt: "June 15, 2026",
    description:
      "How Elite Gold Community plans to handle personal information during the public website and future member-platform phases.",
    sections: [
      {
        title: "Overview",
        paragraphs: [
          "Elite Gold Community is currently in its public website foundation phase. This Privacy Policy explains how information may be collected, used, and protected as the website and future member experience are developed.",
          "The current public website is designed for education, community interest, and member onboarding preparation. Full production authentication and member-platform data flows are planned for a later phase.",
        ],
      },
      {
        title: "Information We May Collect",
        paragraphs: [
          "When you interact with future sign-up or member entry points, we may collect information such as your name, email address, phone number, nationality, nickname, referral code, and account preferences.",
          "We may also collect basic technical information such as device type, browser, approximate location, and usage events to improve reliability, security, and user experience.",
        ],
      },
      {
        title: "How Information May Be Used",
        paragraphs: [
          "Information may be used to prepare membership access, communicate platform updates, improve educational content, support community operations, prevent misuse, and maintain website security.",
          "Elite Gold Community should not use personal information to promise trading outcomes, provide individualized investment advice, or guarantee market results.",
        ],
      },
      {
        title: "Data Protection",
        paragraphs: [
          "The project is prepared to use Supabase and Vercel infrastructure for future authentication, hosting, and secure platform operations. Secrets and service keys should never be exposed in client-side code or public repositories.",
          "As the platform moves into later phases, access control, database policies, and data retention practices should be reviewed before production member launch.",
        ],
      },
      {
        title: "Updates",
        paragraphs: [
          "This policy may be updated as the website moves from Phase 1 into full authentication, member dashboard, education, journal, community, payment, and admin features.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    eyebrow: "Legal",
    updatedAt: "June 15, 2026",
    description:
      "The expected terms for using Elite Gold Community as an education-focused trading community and future member platform.",
    sections: [
      {
        title: "Use of the Website",
        paragraphs: [
          "Elite Gold Community provides public information about trading education, journaling discipline, community structure, and future member-platform access.",
          "By using the website, visitors should use the content responsibly and understand that the current Phase 1 experience is a public foundation, not the final member dashboard or paid service flow.",
        ],
      },
      {
        title: "Educational Purpose",
        paragraphs: [
          "Content on Elite Gold Community is intended for education, skill development, trading process review, and community learning.",
          "Nothing on the website should be interpreted as individualized financial, investment, tax, legal, or trading advice.",
        ],
      },
      {
        title: "Member Access",
        paragraphs: [
          "Login, Sign Up, referral code, dashboard, journal, education library, and membership references describe the planned member experience. Full production behavior will be completed in later phases.",
          "Future paid membership, account access, community rules, and cancellation terms should be defined before accepting production payments or activating full member services.",
        ],
      },
      {
        title: "Responsible Conduct",
        paragraphs: [
          "Members and visitors should engage respectfully, avoid misleading claims, respect intellectual property, and avoid sharing harmful, illegal, or abusive content.",
          "Elite Gold Community may limit access in future member areas if conduct creates operational, security, legal, or community risk.",
        ],
      },
      {
        title: "Changes to Terms",
        paragraphs: [
          "These terms may be updated as the platform expands into authentication, education delivery, trading journal features, community features, payment flows, and admin operations.",
        ],
      },
    ],
  },
  "risk-disclosure": {
    slug: "risk-disclosure",
    title: "Risk Disclosure",
    eyebrow: "Trading Risk",
    updatedAt: "June 15, 2026",
    description:
      "Important trading risk information for visitors and future members of Elite Gold Community.",
    sections: [
      {
        title: "Trading Involves Risk",
        paragraphs: [
          "Trading financial markets involves risk and may result in partial or total loss of capital. Market conditions can change quickly, and no education, strategy, journal, community, indicator, or tool can remove trading risk.",
          "Past performance, examples, screenshots, statistics, or community discussions do not guarantee future results.",
        ],
      },
      {
        title: "No Guaranteed Outcomes",
        paragraphs: [
          "Elite Gold Community is positioned as an education and community platform. It should not be presented as a guaranteed signal service, profit system, or promise of financial return.",
          "Every trader is responsible for their own decisions, risk management, position sizing, and compliance with applicable laws and regulations.",
        ],
      },
      {
        title: "Education and Journal Use",
        paragraphs: [
          "Trading Education and Trading Journal features are intended to help members learn, record decisions, review behavior, and develop discipline over time.",
          "A journal can support better review habits, but it cannot guarantee profitability or prevent losses.",
        ],
      },
      {
        title: "Independent Review",
        paragraphs: [
          "Visitors and members should consider their financial situation, experience level, and risk tolerance before trading. When needed, seek independent professional advice.",
        ],
      },
    ],
  },
} satisfies Record<LegalPageData["slug"], LegalPageData>;
