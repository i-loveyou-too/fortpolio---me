"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import type { Category, ExperienceState } from "@/types/portfolio";
import { PortfolioPanel } from "./PortfolioPanel";
import { ReflectionGroup } from "./ReflectionGroup";

const STEP = (Math.PI * 2) / 3;

type ThreePanelCarouselProps = {
  categories: Category[];
  activeIndex: number;
  targetIndex: number;
  phase: ExperienceState;
  reducedMotion: boolean;
  onEnterComplete: () => void;
  onRotationComplete: () => void;
};

export function ThreePanelCarousel({
  categories,
  activeIndex,
  targetIndex,
  phase,
  reducedMotion,
  onRotationComplete,
}: ThreePanelCarouselProps) {
  const entryGroup = useRef<Group>(null);
  const rotationGroup = useRef<Group>(null);
  const hasEntered = useRef(false);
  const previousTarget = useRef(targetIndex);

  useEffect(() => {
    if (!rotationGroup.current || phase !== "entering" || hasEntered.current) {
      return;
    }

    hasEntered.current = true;

    if (reducedMotion) {
      rotationGroup.current.rotation.y = 0;
      return;
    }

    const tween = gsap.fromTo(
      rotationGroup.current.rotation,
      { y: 0.28 },
      { y: 0, duration: 1.65, ease: "expo.inOut" },
    );

    return () => {
      tween.kill();
    };
  }, [phase, reducedMotion]);

  useEffect(() => {
    if (!rotationGroup.current) return;
    if (previousTarget.current === targetIndex) return;

    previousTarget.current = targetIndex;
    const targetRotation = -targetIndex * STEP;

    gsap.to(rotationGroup.current.rotation, {
      y: targetRotation,
      duration: reducedMotion ? 0.28 : 0.82,
      ease: "power3.out",
      overwrite: true,
      onComplete: onRotationComplete,
    });
  }, [targetIndex, reducedMotion, onRotationComplete]);

  return (
    <group ref={entryGroup}>
      <group ref={rotationGroup}>
        {categories.map((category, index) => (
          <PortfolioPanel
            key={category.id}
            category={category}
            index={index}
            activeIndex={activeIndex}
            active={index === activeIndex}
          />
        ))}
        {phase !== "loading" ? (
          <ReflectionGroup categories={categories} activeIndex={activeIndex} />
        ) : null}
      </group>
    </group>
  );
}
