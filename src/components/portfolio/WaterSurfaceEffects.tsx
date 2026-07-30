"use client";

import { useEffect, useMemo } from "react";
import {
  AdditiveBlending,
  CanvasTexture,
  DoubleSide,
  LinearFilter,
  SRGBColorSpace,
} from "three";

function makeHazeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  const centerGlow = ctx.createRadialGradient(512, 118, 20, 512, 118, 470);
  centerGlow.addColorStop(0, "rgba(255, 255, 255, 0.46)");
  centerGlow.addColorStop(0.34, "rgba(230, 241, 247, 0.2)");
  centerGlow.addColorStop(0.72, "rgba(210, 225, 236, 0.08)");
  centerGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const surfaceLine = ctx.createLinearGradient(0, 102, 0, 154);
  surfaceLine.addColorStop(0, "rgba(255, 255, 255, 0)");
  surfaceLine.addColorStop(0.48, "rgba(198, 215, 228, 0.24)");
  surfaceLine.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = surfaceLine;
  ctx.fillRect(0, 92, canvas.width, 72);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

export function WaterSurfaceEffects() {
  const hazeTexture = useMemo(() => makeHazeTexture(), []);

  useEffect(() => {
    return () => hazeTexture.dispose();
  }, [hazeTexture]);

  return (
    <group position={[0, -1.34, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh position={[0, 0, 0.052]} scale={[4.0, 0.58, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={hazeTexture}
          transparent
          opacity={0.48}
          depthWrite={false}
          blending={AdditiveBlending}
          side={DoubleSide}
        />
      </mesh>
      <mesh scale={[3.55, 0.5, 1]}>
        <circleGeometry args={[1, 96]} />
        <meshBasicMaterial
          color="#b9c6d6"
          transparent
          opacity={0.07}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, 0.012]} scale={[1.82, 0.24, 1]}>
        <circleGeometry args={[1, 96]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={AdditiveBlending}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, 0.02]} scale={[2.75, 0.34, 1]}>
        <ringGeometry args={[0.58, 1, 128]} />
        <meshBasicMaterial
          color="#dbe7ef"
          transparent
          opacity={0.16}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0, 0.03]} scale={[3.2, 0.014, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#c9d7e2"
          transparent
          opacity={0.18}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  );
}
