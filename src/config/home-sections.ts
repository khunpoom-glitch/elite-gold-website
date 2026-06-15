export const HOME_SECTION_ROUTES = [
  { name: "About Community", href: "/about", sectionId: "about-community" },
  { name: "Trading Education", href: "/education", sectionId: "trading-education" },
  { name: "Membership", href: "/membership", sectionId: "membership" },
  { name: "FAQ", href: "/faq", sectionId: "faq" },
  { name: "Contact", href: "/contact", sectionId: "contact" },
] as const;

export const HOME_PATH = "/home";
export const TOP_SECTION_ID = "top";

export type HomeSectionId =
  | typeof TOP_SECTION_ID
  | (typeof HOME_SECTION_ROUTES)[number]["sectionId"];

const sectionByPath = new Map<string, HomeSectionId>([
  ["/", TOP_SECTION_ID],
  [HOME_PATH, TOP_SECTION_ID],
  ...HOME_SECTION_ROUTES.map((item) => [item.href, item.sectionId] as const),
]);

export function getHomeSectionIdFromPath(pathname: string): HomeSectionId | null {
  return sectionByPath.get(pathname) ?? null;
}
