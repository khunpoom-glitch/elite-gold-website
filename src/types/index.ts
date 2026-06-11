export type NavItem = {
  label: string;
  href: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type MembershipPlan = {
  name: string;
  description: string;
  price: string;
  features: string[];
  highlighted?: boolean;
};
