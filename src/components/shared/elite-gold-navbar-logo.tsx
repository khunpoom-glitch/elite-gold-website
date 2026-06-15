import Image from "next/image";
import { cn } from "@/lib/utils";

// Adjust this class to resize the visible logo mark without changing navbar height.
export const ELITE_GOLD_NAV_LOGO_VISUAL_SIZE_CLASS = "h-20 w-20";

type EliteGoldNavbarLogoProps = {
  className?: string;
  priority?: boolean;
  visualSizeClassName?: string;
};

export function EliteGoldNavbarLogo({
  className,
  priority = false,
  visualSizeClassName = ELITE_GOLD_NAV_LOGO_VISUAL_SIZE_CLASS,
}: EliteGoldNavbarLogoProps) {
  return (
    <span
      className={cn(
        "airova-logo-type inline-flex items-center gap-2 text-foreground",
        className,
      )}
    >
      <span className="relative grid h-5 w-5 shrink-0 place-items-center overflow-visible">
        <Image
          alt=""
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2 object-contain",
            visualSizeClassName,
          )}
          height={1875}
          priority={priority}
          src="/brand/elite-gold-mark.png"
          width={1875}
        />
      </span>
      <span className="text-sm font-semibold tracking-normal text-nowrap">
        Elite Gold
      </span>
    </span>
  );
}
