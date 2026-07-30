"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import type { Category, ExperienceState } from "@/types/portfolio";
import { ThreePanelCarousel } from "./ThreePanelCarousel";

const INTRO_DURATION = 8.2;

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const next = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1);
  return next * next * (3 - 2 * next);
}

function easeOutQuint(value: number) {
  return 1 - (1 - value) ** 5;
}

type PortfolioCanvasProps = {
  categories: Category[];
  activeIndex: number;
  targetIndex: number;
  phase: ExperienceState;
  reducedMotion: boolean;
  onEnterComplete: () => void;
  onRotationComplete: () => void;
};

type CameraRigProps = {
  phase: ExperienceState;
  reducedMotion: boolean;
  onEnterComplete: () => void;
};

function CameraRig({ phase, reducedMotion, onEnterComplete }: CameraRigProps) {
  const { camera, pointer, size } = useThree();
  const entered = useRef(false);
  const target = useRef({ x: 0, y: 0, z: 0 });
  const isMobile = size.width < 700;
  const baseZ = isMobile ? 24.4 : 11.25;
  const baseY = isMobile ? 0.32 : 0.12;
  const topY = isMobile ? 13.4 : 10.6;
  const topZ = isMobile ? 0.86 : 0.58;

  useEffect(() => {
    if (entered.current) {
      camera.position.set(0, baseY, baseZ);
    } else {
      camera.position.set(0, topY, topZ);
    }
    camera.updateProjectionMatrix();
  }, [baseY, baseZ, camera, topY, topZ]);

  useEffect(() => {
    if (phase !== "entering" || entered.current) return;

    if (reducedMotion) {
      entered.current = true;
      camera.position.set(0, baseY, baseZ);
      target.current = { x: 0, y: 0, z: 0 };
      onEnterComplete();
      return;
    }

    const progress = { value: 0 };
    const start = { x: 0, y: topY, z: topZ };

    const timeline = gsap.to(progress, {
      value: 1,
      duration: INTRO_DURATION,
      ease: "none",
      onUpdate: () => {
        const p = progress.value;
        const descent = smoothstep(0.48, 1, p);
        const easedDescent = easeOutQuint(descent);
        const orbit = Math.sin(p * Math.PI * 0.92) * (1 - easedDescent) * 0.52;
        const topDrift = smoothstep(0, 0.48, p) * 0.22;

        camera.position.set(
          orbit,
          lerp(start.y - topDrift, baseY, easedDescent),
          lerp(start.z + topDrift * 0.34, baseZ, easedDescent),
        );

        target.current = {
          x: lerp(0.08, 0, easedDescent),
          y: lerp(0.02, -0.08, easedDescent),
          z: 0,
        };
      },
      onComplete: () => {
        entered.current = true;
        camera.position.set(0, baseY, baseZ);
        target.current = { x: 0, y: -0.08, z: 0 };
        onEnterComplete();
      },
    });

    return () => {
      timeline.kill();
    };
  }, [baseY, baseZ, camera, onEnterComplete, phase, reducedMotion, topY, topZ]);

  useFrame(() => {
    camera.lookAt(target.current.x, target.current.y, target.current.z);

    if (reducedMotion || (phase !== "ready" && phase !== "rotating")) return;

    const nextX = camera.position.x + (pointer.x * 0.1 - camera.position.x) * 0.04;
    const nextY =
      camera.position.y + (pointer.y * 0.05 + baseY - camera.position.y) * 0.04;
    camera.position.set(nextX, nextY, baseZ);
  });

  return null;
}

function ResponsiveCamera() {
  const { size } = useThree();
  const isMobile = size.width < 700;

  return (
    <PerspectiveCamera
      makeDefault
      position={[0, isMobile ? 13.4 : 10.6, isMobile ? 0.86 : 0.58]}
      fov={isMobile ? 42 : 35}
    />
  );
}

export function PortfolioCanvas(props: PortfolioCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      className="h-full w-full"
    >
      <ResponsiveCamera />
      <ambientLight intensity={1.2} />
      <directionalLight position={[0, 4, 6]} intensity={1.1} />
      <CameraRig
        phase={props.phase}
        reducedMotion={props.reducedMotion}
        onEnterComplete={props.onEnterComplete}
      />
      <ThreePanelCarousel {...props} />
    </Canvas>
  );
}
