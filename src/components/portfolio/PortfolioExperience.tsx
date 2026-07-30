"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { categories } from "@/data/categories";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSwipe } from "@/hooks/useSwipe";
import { useWheelCarousel } from "@/hooks/useWheelCarousel";
import type { ExperienceState } from "@/types/portfolio";
import { BackgroundTitle } from "./BackgroundTitle";
import { CategoryIndicator } from "./CategoryIndicator";
import { LoadingIntro } from "./LoadingIntro";
import { MotionProvider } from "@/components/providers/MotionProvider";

const PortfolioCanvas = dynamic(
  () => import("./PortfolioCanvas").then((mod) => mod.PortfolioCanvas),
  { ssr: false },
);

function normalizeIndex(index: number) {
  return ((index % categories.length) + categories.length) % categories.length;
}

export function PortfolioExperience() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<ExperienceState>("loading");
  const [targetIndex, setTargetIndex] = useState(0);

  const activeIndex = useMemo(() => normalizeIndex(targetIndex), [targetIndex]);
  const canInteract = phase === "ready" || phase === "rotating";

  const step = useCallback(
    (direction: 1 | -1) => {
      if (!canInteract) return;
      setPhase("rotating");
      setTargetIndex((current) => current + direction);
    },
    [canInteract],
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => setPhase("entering"),
      reducedMotion ? 450 : 1600,
    );

    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!canInteract) return;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        step(1);
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        step(-1);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canInteract, step]);

  useWheelCarousel({ enabled: canInteract, onStep: step });
  const swipeHandlers = useSwipe({ enabled: canInteract, onStep: step });

  return (
    <MotionProvider>
      <section
        className="relative h-[100dvh] min-h-[560px] cursor-grab overflow-hidden bg-[#f7f3ea] text-[#151515] active:cursor-grabbing [touch-action:pan-y]"
        {...swipeHandlers}
      >
        <motion.p
          className="absolute left-1/2 top-6 z-30 -translate-x-1/2 text-center text-[9px] uppercase tracking-[0.18em] text-black/45"
          animate={{ opacity: phase === "loading" ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          Kyunglim Lim is a portfolio maker from Seoul.
        </motion.p>

        <motion.div
          animate={{ opacity: phase === "loading" ? 0 : 1 }}
          transition={{ duration: 0.7, delay: phase === "loading" ? 0 : 0.25 }}
        >
          <BackgroundTitle />
        </motion.div>

        <div className="absolute inset-0 z-10">
          <PortfolioCanvas
            categories={categories}
            activeIndex={activeIndex}
            targetIndex={targetIndex}
            phase={phase}
            reducedMotion={reducedMotion}
            onEnterComplete={() => setPhase("ready")}
            onRotationComplete={() => setPhase("ready")}
          />
        </div>

        <motion.div
          animate={{ opacity: canInteract ? 1 : 0 }}
          transition={{ duration: 0.45 }}
        >
          <CategoryIndicator
            categories={categories}
            activeIndex={activeIndex}
            onStep={step}
          />
        </motion.div>

        <div className="sr-only" aria-live="polite">
          Current category: {categories[activeIndex].title},{" "}
          {categories[activeIndex].subtitle}
        </div>

        <LoadingIntro visible={phase === "loading"} />
      </section>
    </MotionProvider>
  );
}
