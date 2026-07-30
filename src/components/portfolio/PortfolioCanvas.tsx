"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import { PerspectiveCamera } from "@react-three/drei";
import type { Category, ExperienceState } from "@/types/portfolio";
import { ThreePanelCarousel } from "./ThreePanelCarousel";

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
  const baseZ = isMobile ? 24.2 : 10.9;
  const baseY = isMobile ? 0.32 : 0.12;
  const topY = isMobile ? 11.8 : 9.2;
  const topZ = isMobile ? 1.15 : 0.82;

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

    entered.current = true;

    if (reducedMotion) {
      camera.position.set(0, baseY, baseZ);
      target.current = { x: 0, y: 0, z: 0 };
      onEnterComplete();
      return;
    }

    const timeline = gsap.timeline({ onComplete: onEnterComplete });
    timeline
      .to(camera.position, {
        x: 0,
        y: baseY,
        z: baseZ,
        duration: 1.75,
        ease: "expo.inOut",
      })
      .to(
        target.current,
        {
          y: -0.08,
          z: 0,
          duration: 1.75,
          ease: "expo.inOut",
        },
        0,
      );

    return () => {
      timeline.kill();
    };
  }, [baseY, baseZ, camera, onEnterComplete, phase, reducedMotion]);

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
      position={[0, isMobile ? 11.8 : 9.2, isMobile ? 1.15 : 0.82]}
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
