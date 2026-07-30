"use client";

import gsap from "gsap";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import type { Category, ExperienceState } from "@/types/portfolio";
import { PortfolioPanel } from "./PortfolioPanel";
import { ReflectionGroup } from "./ReflectionGroup";
import { WaterSurfaceEffects } from "./WaterSurfaceEffects";

const STEP = (Math.PI * 2) / 3;
const INTRO_DURATION = 8.2;
const INTRO_ROTATIONS = 6;
const OBJECT_SCALE = 1.18;
const OBJECT_Y_OFFSET = -0.62;

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

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

  useFrame(({ clock }) => {
    if (!entryGroup.current || reducedMotion || phase === "loading") return;

    const time = clock.elapsedTime;
    entryGroup.current.position.y = 0.05 + Math.sin(time * 1.05) * 0.045;
    entryGroup.current.rotation.z = Math.sin(time * 0.74) * 0.0045;
  });

  useEffect(() => {
    if (!rotationGroup.current || phase !== "entering" || hasEntered.current) {
      return;
    }

    if (reducedMotion) {
      hasEntered.current = true;
      rotationGroup.current.rotation.y = 0;
      return;
    }

    const progress = { value: 0 };
    const startRotation = -(Math.PI * 2 * INTRO_ROTATIONS + 1.12);
    rotationGroup.current.rotation.y = startRotation;

    const tween = gsap.to(progress, {
      value: 1,
      duration: INTRO_DURATION,
      ease: "none",
      onUpdate: () => {
        if (!rotationGroup.current) return;

        const p = progress.value;
        const rotationProgress = easeOutCubic(p);
        rotationGroup.current.rotation.y = startRotation * (1 - rotationProgress);
      },
      onComplete: () => {
        if (!rotationGroup.current) return;
        hasEntered.current = true;
        rotationGroup.current.rotation.y = 0;
      },
    });

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
    <group scale={OBJECT_SCALE} position={[0, OBJECT_Y_OFFSET, 0]}>
      {phase === "ready" || phase === "rotating" ? <WaterSurfaceEffects /> : null}
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
          {phase === "ready" || phase === "rotating" ? (
            <ReflectionGroup categories={categories} activeIndex={activeIndex} />
          ) : null}
        </group>
      </group>
    </group>
  );
}
