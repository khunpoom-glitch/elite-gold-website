"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
}

export const ShinyButton: React.FC<ShinyButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <motion.button
      {...props}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "shiny-button relative isolate inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap rounded-lg px-6 py-2 font-medium backdrop-blur-xl transition-shadow duration-300 ease-in-out hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
    >
      <span
        className="shiny-button-content relative z-10 flex size-full items-center justify-center gap-[inherit] text-sm tracking-normal text-[var(--shiny-button-foreground,currentColor)]"
      >
        {children}
      </span>
      <span
        style={{
          mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
          maskComposite: "exclude",
          pointerEvents: "none",
          position: "absolute",
          zIndex: 0,
        }}
        className="shiny-button-border pointer-events-none absolute inset-0 z-0 block rounded-[inherit] p-px"
      ></span>
    </motion.button>
  );
};

const shinyButton = { ShinyButton };

export default shinyButton;
