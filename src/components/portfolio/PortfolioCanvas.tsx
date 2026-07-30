"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
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

function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const { camera, pointer, size } = useThree();
  const isMobile = size.width < 700;
  const baseZ = isMobile ? 24.2 : 10.9;
  const baseY = isMobile ? 0.32 : 0.12;

  useEffect(() => {
    camera.position.set(0, baseY, baseZ);
    camera.updateProjectionMatrix();
  }, [baseY, baseZ, camera]);

  useFrame(() => {
    if (reducedMotion) return;
    const nextX = camera.position.x + (pointer.x * 0.1 - camera.position.x) * 0.04;
    const nextY =
      camera.position.y + (pointer.y * 0.05 + baseY - camera.position.y) * 0.04;
    camera.position.set(nextX, nextY, baseZ);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function ResponsiveCamera() {
  const { size } = useThree();
  const isMobile = size.width < 700;

  return (
    <PerspectiveCamera
      makeDefault
      position={[0, isMobile ? 0.32 : 0.12, isMobile ? 24.2 : 10.9]}
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
      <CameraRig reducedMotion={props.reducedMotion} />
      <ThreePanelCarousel {...props} />
    </Canvas>
  );
}
