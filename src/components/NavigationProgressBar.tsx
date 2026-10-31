"use client";

import { useEffect, useState, useRef, useTransition, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Complete progress on pathname or searchParams change
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const hideTimer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
      return () => clearTimeout(hideTimer);
    }
  }, [pathname, searchParams]);

  // Intercept all internal anchor clicks for instant visual feedback
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Find closest anchor tag
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore hash links, external links, mailto, tel, downloads, or target="_blank"
      if (
        href.startsWith("#") ||
        href.startsWith("tel:") ||
        href.startsWith("mailto:") ||
        target.getAttribute("target") === "_blank" ||
        target.hasAttribute("download") ||
        (href.startsWith("http") && !href.startsWith(window.location.origin))
      ) {
        return;
      }

      // Check if clicking the exact current URL
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Instant activation!
      if (timerRef.current) clearInterval(timerRef.current);
      setVisible(true);
      setProgress(25);

      // Fast incremental tick while waiting for Next.js route hydration
      let currentVal = 25;
      timerRef.current = setInterval(() => {
        currentVal += Math.random() * 18;
        if (currentVal > 85) {
          currentVal = 85;
          if (timerRef.current) clearInterval(timerRef.current);
        }
        setProgress(currentVal);
      }, 120);
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100000] pointer-events-none transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      <div
        className="h-[3px] bg-gradient-to-r from-gold-primary via-gold-hover to-gold-deep shadow-[0_0_12px_rgba(215,191,159,0.9)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? "200ms" : "150ms",
        }}
      />
    </div>
  );
}

export default function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressIndicator />
    </Suspense>
  );
}
