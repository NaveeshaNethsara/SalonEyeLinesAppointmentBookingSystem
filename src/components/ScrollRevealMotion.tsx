"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * ScrollRevealMotion
 * ------------------
 * GSAP ScrollTrigger-powered reveal animations for each website section.
 * Applies per-section parallax, fade-in, scale, and slide effects as the
 * user scrolls. This is the "2D motion layer" that complements the 3D
 * Three.js canvas in ScrollMotionGraphics3D.
 *
 * Applied Skills:
 *   - gsap-scrolltrigger: ScrollTrigger.batch, scrub, toggleActions
 *   - motion-design: Premium archetype, stagger budgets, 1/3 rule
 */

gsap.registerPlugin(ScrollTrigger);

export default function ScrollRevealMotion() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Small delay to let DOM hydrate
    const timer = setTimeout(() => {
      // ──────────────── 1. HERO SECTION — Parallax + Reveal ────────────────
      const heroSection = document.querySelector<HTMLElement>(
        "section:first-of-type"
      );
      if (heroSection) {
        // Hero content slides up and fades in
        gsap.fromTo(
          heroSection.querySelectorAll("h1, p, .inline-flex"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: heroSection,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );

        // Hero image parallax on scroll
        const heroImage = heroSection.querySelector<HTMLElement>(
          ".lg\\:col-span-5 .relative"
        );
        if (heroImage) {
          gsap.to(heroImage, {
            y: -30,
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom top",
              scrub: 1.2,
            },
          });
        }

        // Counter numbers scale pop
        gsap.fromTo(
          heroSection.querySelectorAll(".font-serif.text-3xl"),
          { scale: 0.85, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "back.out(1.3)",
            scrollTrigger: {
              trigger: heroSection.querySelector(".border-t"),
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // ──────────────── 2. STORY SECTION — Split Reveal ────────────────
      const storySection = document.querySelectorAll("section")[1];
      if (storySection) {
        // Image slides in from left
        const storyImage = storySection.querySelector<HTMLElement>(
          ".lg\\:col-span-6:first-child"
        );
        if (storyImage) {
          gsap.fromTo(
            storyImage,
            { x: -60, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: storySection,
                start: "top 70%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        // Text content slides in from right
        const storyText = storySection.querySelector<HTMLElement>(
          ".lg\\:col-span-6.space-y-6"
        );
        if (storyText) {
          gsap.fromTo(
            storyText.children,
            { x: 50, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.9,
              stagger: 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: storySection,
                start: "top 65%",
                toggleActions: "play none none none",
              },
            }
          );
        }

        // "15+ Years" badge scale pop
        const yearsBadge = storySection.querySelector<HTMLElement>(
          ".absolute.top-6.right-6"
        );
        if (yearsBadge) {
          gsap.fromTo(
            yearsBadge,
            { scale: 0, opacity: 0, rotation: -15 },
            {
              scale: 1,
              opacity: 1,
              rotation: 0,
              duration: 0.8,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: storySection,
                start: "top 55%",
                toggleActions: "play none none none",
              },
            }
          );
        }
      }

      // ──────────────── 3. TREATMENT CARDS — Batch Stagger ────────────────
      const treatmentSection = document.querySelectorAll("section")[2];
      if (treatmentSection) {
        // Section header reveal
        gsap.fromTo(
          treatmentSection.querySelectorAll(".text-center > *"),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: treatmentSection,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );

        // Cards batch stagger entrance
        ScrollTrigger.batch(
          treatmentSection.querySelectorAll(".luxury-card"),
          {
            onEnter: (elements) => {
              gsap.fromTo(
                elements,
                { y: 50, opacity: 0, scale: 0.95 },
                {
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  duration: 0.8,
                  stagger: 0.12,
                  ease: "power2.out",
                  overwrite: true,
                }
              );
            },
            start: "top 85%",
            once: true,
          }
        );
      }

      // ──────────────── 4. HIGHLIGHTS SECTION — Grid Cascade ────────────────
      const highlightsSection = document.querySelectorAll("section")[3];
      if (highlightsSection) {
        gsap.fromTo(
          highlightsSection.querySelectorAll(".text-center.max-w-2xl > *"),
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: highlightsSection,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );

        ScrollTrigger.batch(
          highlightsSection.querySelectorAll(".luxury-card"),
          {
            onEnter: (elements) => {
              gsap.fromTo(
                elements,
                { y: 40, opacity: 0, scale: 0.9 },
                {
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  duration: 0.7,
                  stagger: 0.06,
                  ease: "back.out(1.2)",
                  overwrite: true,
                }
              );
            },
            start: "top 85%",
            once: true,
          }
        );
      }

      // ──────────────── 5. BRIDAL SECTION — Cinematic Reveal ────────────────
      const bridalSection = document.querySelectorAll("section")[4];
      if (bridalSection) {
        // Text from left
        gsap.fromTo(
          bridalSection.querySelector(".lg\\:col-span-6.space-y-6"),
          { x: -60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bridalSection,
              start: "top 65%",
              toggleActions: "play none none none",
            },
          }
        );

        // Image from right
        gsap.fromTo(
          bridalSection.querySelector(".lg\\:col-span-6:last-child"),
          { x: 60, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: bridalSection,
              start: "top 60%",
              toggleActions: "play none none none",
            },
          }
        );

        // Bridal cards stagger
        gsap.fromTo(
          bridalSection.querySelectorAll(".bg-white\\/5"),
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: bridalSection.querySelector(".grid.grid-cols-1.sm\\:grid-cols-2"),
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // ──────────────── 6. CTA SECTION — Center Pop ────────────────
      const ctaSection = document.querySelectorAll("section")[5];
      if (ctaSection) {
        gsap.fromTo(
          ctaSection.querySelectorAll(".text-center > *"),
          { y: 35, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ctaSection,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // ──────────────── 7. GLOBAL PARALLAX — Section backgrounds ────────────────
      document.querySelectorAll("section").forEach((section) => {
        const images = section.querySelectorAll<HTMLElement>("img");
        images.forEach((img) => {
          gsap.to(img, {
            y: -20,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.5,
            },
          });
        });
      });

    }, 200);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null; // This component only adds scroll behaviors — no DOM output
}
