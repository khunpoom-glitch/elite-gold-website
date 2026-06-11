import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "compact" | "full";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function Logo({
  variant = "compact",
  className,
  imageClassName,
  priority = false,
}: LogoProps) {
  if (variant === "full") {
    return (
      <Link
        aria-label="Elite Gold Community home"
        className={cn("inline-flex items-center", className)}
        href="/"
      >
        <Image
          alt="Elite Gold Community logo"
          className={cn("h-auto w-48 sm:w-56", imageClassName)}
          fetchPriority={priority ? "high" : "auto"}
          height={1875}
          loading={priority ? "eager" : "lazy"}
          src="/brand/elite-gold-community-logo.png"
          width={1875}
        />
      </Link>
    );
  }

  return (
    <Link
      aria-label="Elite Gold Community home"
      className={cn(
        "elite-nav-logo inline-flex items-center gap-2.5 sm:gap-3",
        className,
      )}
      href="/"
    >
      <span className="elite-nav-logo-mark h-16 w-16 shrink-0 sm:h-[4.5rem] sm:w-[4.5rem]">
        <Image
          alt=""
          aria-hidden="true"
          className={cn("h-full w-full object-contain", imageClassName)}
          fetchPriority={priority ? "high" : "auto"}
          height={1875}
          loading={priority ? "eager" : "lazy"}
          src="/brand/elite-gold-mark.png"
          width={1875}
        />
      </span>
      <span className="elite-nav-logo-copy leading-none">
        <span className="elite-brand-type block text-[0.98rem] text-white sm:text-[1.12rem]">
          ELITE GOLD
        </span>
        <span className="elite-nav-logo-community block text-[0.66rem] font-bold uppercase text-soft-gold sm:text-[0.72rem]">
          COMMUNITY
        </span>
      </span>
    </Link>
  );
}
