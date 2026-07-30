"use client";

import gsap from "gsap";
import { useEffect, useLayoutEffect, useRef } from "react";
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
  onEnterComplete,
  onRotationComplete,
}: ThreePanelCarouselProps) {
  const entryGroup = useRef<Group>(null);
  const rotationGroup = useRef<Group>(null);
  const hasEntered = useRef(false);
  const previousTarget = useRef(targetIndex);

  useLayoutEffect(() => {
    if (!entryGroup.current) return;
    entryGroup.current.position.y = reducedMotion ? 0 : 6.4;
  }, [reducedMotion]);

  useEffect(() => {
    if (!entryGroup.current || phase !== "entering" || hasEntered.current) {
      return;
    }

    hasEntered.current = true;

    if (reducedMotion) {
      entryGroup.current.position.y = 0;
      onEnterComplete();
      return;
    }

    const timeline = gsap.timeline({ onComplete: onEnterComplete });
    timeline
      .fromTo(
        entryGroup.current.position,
        { y: 6.4 },
        { y: -0.18, duration: 1.25, ease: "expo.out" },
      )
      .to(entryGroup.current.position, {
        y: 0,
        duration: 0.32,
        ease: "power2.out",
      });

    return () => {
      timeline.kill();
    };
  }, [phase, reducedMotion, onEnterComplete]);

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
    <group ref={entryGroup} position={[0, 6.4, 0]}>
      <group ref={rotationGroup}>
        {categories.map((category, index) => (
          <PortfolioPanel
            key={category.id}
            category={category}
            index={index}
            active={index === activeIndex}
          />
        ))}
        <ReflectionGroup categories={categories} activeIndex={activeIndex} />
      </group>
    </group>
  );
}
