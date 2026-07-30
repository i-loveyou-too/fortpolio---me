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
  const [phase, setPhase] = useState<ExperienceState>("entering");
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

  const handleEnterComplete = useCallback(() => {
    setPhase("ready");
  }, []);

  const handleRotationComplete = useCallback(() => {
    setPhase("ready");
  }, []);

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
        className="relative h-[100dvh] min-h-[560px] cursor-grab overflow-hidden bg-white text-[#151515] active:cursor-grabbing [touch-action:pan-y]"
        {...swipeHandlers}
      >
        <motion.p
          className="absolute left-1/2 top-6 z-30 -translate-x-1/2 text-center text-[9px] uppercase tracking-[0.18em] text-black/45"
          animate={{ opacity: phase === "loading" ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          Kyunglim.Byun. is a portfolio maker from Seoul.
        </motion.p>

        <motion.div
          className="pointer-events-none fixed inset-0 z-40 flex justify-center pt-[52dvh]"
          initial={{ opacity: reducedMotion ? 0 : 1, y: 0, filter: "blur(0px)" }}
          animate={{
            opacity:
              reducedMotion || phase === "ready" || phase === "rotating"
                ? 0
                : [1, 1, 0],
            y:
              reducedMotion || phase === "ready" || phase === "rotating"
                ? -10
                : [0, 0, -10],
            filter: reducedMotion
              ? "blur(0px)"
              : phase === "ready" || phase === "rotating"
                ? "blur(8px)"
              : ["blur(0px)", "blur(0px)", "blur(8px)"],
          }}
          transition={{
            duration: phase === "ready" || phase === "rotating" ? 0.45 : 8.2,
            times:
              phase === "ready" || phase === "rotating"
                ? undefined
                : [0, 0.48, 0.62],
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <p className="font-serif text-sm uppercase tracking-[0.18em] text-black/55">
            KYUNGLIM.BYUN.
          </p>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-0 z-0 overflow-visible"
          initial={{
            opacity: reducedMotion ? 1 : 0,
            y: reducedMotion ? "-20dvh" : "1.4dvh",
            x: reducedMotion ? 0 : "-1.2vw",
            filter: reducedMotion ? "blur(0px)" : "blur(14px)",
            clipPath: reducedMotion
              ? "inset(0% 0% 0% 0%)"
              : "inset(0% 100% 0% 0%)",
          }}
          animate={{
            opacity: reducedMotion ? 1 : [0, 0, 0.55, 1, 1],
            y: reducedMotion
              ? "-20dvh"
              : ["1.4dvh", "1.4dvh", "0dvh", "-8dvh", "-20dvh"],
            x: reducedMotion
              ? 0
              : ["-1.2vw", "-1.2vw", "-0.35vw", "0vw", "0vw"],
            filter: reducedMotion
              ? "blur(0px)"
              : [
                  "blur(14px)",
                  "blur(14px)",
                  "blur(7px)",
                  "blur(0px)",
                  "blur(0px)",
                ],
            clipPath: reducedMotion
              ? "inset(0% 0% 0% 0%)"
              : [
                  "inset(0% 100% 0% 0%)",
                  "inset(0% 100% 0% 0%)",
                  "inset(0% 45% 0% 0%)",
                  "inset(0% 0% 0% 0%)",
                  "inset(0% 0% 0% 0%)",
                ],
          }}
          transition={{
            duration: reducedMotion ? 0 : 8.2,
            times: [0, 0.1, 0.24, 0.46, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
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
            onEnterComplete={handleEnterComplete}
            onRotationComplete={handleRotationComplete}
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
      </section>
    </MotionProvider>
  );
}
