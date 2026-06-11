import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const twinkleStars = Array.from({ length: 22 });
const smokePlumes = Array.from({ length: 7 });

export function HeroSection() {
  return (
    <section className="elite-hero relative isolate min-h-[calc(100svh-6.5rem)] overflow-hidden border-b border-white/8">
      <Image
        alt=""
        aria-hidden="true"
        className="elite-hero-bg"
        fill
        fetchPriority="high"
        loading="eager"
        priority
        sizes="100vw"
        src="/brand/elite-gold-hero-bg.png"
      />
      <div aria-hidden="true" className="elite-hero-vignette" />
      <div aria-hidden="true" className="elite-hero-fog" />
      <div aria-hidden="true" className="elite-hero-dust" />
      <div aria-hidden="true" className="elite-hero-twinkles">
        {twinkleStars.map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <div aria-hidden="true" className="elite-hero-smoke">
        {smokePlumes.map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <div aria-hidden="true" className="elite-hero-meteors">
        <span />
        <span />
        <span />
      </div>
      <div aria-hidden="true" className="elite-hero-podium" />

      <Container className="elite-hero-content relative z-[3] flex min-h-[calc(100svh-6.5rem)] flex-col items-center justify-center py-10 text-center sm:py-12 lg:py-14">
        <div className="elite-hero-logo">
          <Image
            alt="Elite Gold mark"
            className="h-auto w-full"
            height={786}
            priority
            src="/brand/elite-gold-logo.png"
            width={609}
          />
        </div>

        <div className="elite-hero-copy-stack">
          <h1 className="elite-hero-title">
            <span>ELITE GOLD</span>
            <span>COMMUNITY</span>
          </h1>

          <p className="elite-hero-subtitle">
            Professional Trading Community
            <span>The Journey Toward Greatness Begins Here</span>
          </p>

          <div className="elite-hero-cta">
            <Link
              className={buttonVariants({
                size: "lg",
                className: "elite-hero-button elite-hero-button-primary uppercase",
              })}
              href="/signup"
            >
              <Sparkles aria-hidden="true" className="h-[17px] w-[17px]" />
              <span>ENTER COMMUNITY</span>
              <ArrowRight aria-hidden="true" className="h-[17px] w-[17px]" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
