"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  getHomeSectionIdFromPath,
  TOP_SECTION_ID,
  type HomeSectionId,
} from "@/config/home-sections";
import { AUTH_MODAL_SKIP_SCROLL_EVENT_NAME } from "@/config/auth-modal";

function scrollToHomeSection(sectionId: HomeSectionId, behavior: ScrollBehavior) {
  const target = document.getElementById(sectionId);

  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior, block: "start" });
}

export function HomeScrollController({
  initialSection = TOP_SECTION_ID,
}: {
  initialSection?: HomeSectionId;
}) {
  const pathname = usePathname();
  const hasMounted = useRef(false);
  const skipNextScroll = useRef(false);

  useEffect(() => {
    function handleSkipNextScroll() {
      skipNextScroll.current = true;
    }

    window.addEventListener(AUTH_MODAL_SKIP_SCROLL_EVENT_NAME, handleSkipNextScroll);

    return () => {
      window.removeEventListener(AUTH_MODAL_SKIP_SCROLL_EVENT_NAME, handleSkipNextScroll);
    };
  }, []);

  useEffect(() => {
    if (skipNextScroll.current) {
      skipNextScroll.current = false;
      hasMounted.current = true;
      return;
    }

    const sectionId = getHomeSectionIdFromPath(pathname);

    if (!sectionId) {
      hasMounted.current = true;
      return;
    }

    const behavior: ScrollBehavior = hasMounted.current ? "smooth" : "auto";
    const frame = window.requestAnimationFrame(() => {
      scrollToHomeSection(sectionId, behavior);
      hasMounted.current = true;
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialSection, pathname]);

  return null;
}
