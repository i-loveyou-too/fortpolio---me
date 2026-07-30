"use client";

import { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  LinearFilter,
  SRGBColorSpace,
  type CanvasTexture as CanvasTextureType,
  type CylinderGeometry as CylinderGeometryType,
} from "three";
import type { Category } from "@/types/portfolio";

export const RING_RADIUS = 3.72;
export const PANEL_HEIGHT = 3.12;
export const SEGMENT_ANGLE = (Math.PI * 2) / 3;
const RADIAL_SEGMENTS = 56;

type PortfolioPanelProps = {
  category: Category;
  index: number;
  active?: boolean;
  reflection?: boolean;
};

function makeTexture(category: Category, reflection = false): CanvasTextureType {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, category.colors.top);
  gradient.addColorStop(0.48, category.colors.middle);
  gradient.addColorStop(1, category.colors.bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.28;
  for (let i = 0; i < 7; i += 1) {
    ctx.beginPath();
    const y = 300 + i * 42;
    ctx.moveTo(-120, y + Math.sin(i) * 24);
    for (let x = 0; x <= canvas.width + 160; x += 140) {
      ctx.lineTo(x, y + Math.sin(i * 0.85 + x * 0.009) * 54);
    }
    ctx.lineTo(canvas.width + 160, canvas.height);
    ctx.lineTo(-120, canvas.height);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? "#201b21" : "#fff7fb";
    ctx.fill();
  }

  ctx.globalAlpha = 0.14;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(1150, 348, 360, 220, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.fillStyle = category.colors.ink;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.globalAlpha = 0.55;
  ctx.font = "500 26px Arial, Helvetica, sans-serif";
  ctx.fillText(
    `0${category.id === "build" ? 1 : category.id === "teach" ? 2 : 3}`,
    112,
    104,
  );

  ctx.globalAlpha = 0.82;
  ctx.font = "500 34px Arial, Helvetica, sans-serif";
  ctx.fillText(category.title, 210, 104);

  ctx.globalAlpha = 1;
  ctx.font = "700 118px Georgia, 'Times New Roman', serif";
  ctx.fillText(category.title, 112, 358);

  ctx.globalAlpha = 0.82;
  ctx.font = "500 36px Arial, Helvetica, sans-serif";
  ctx.fillText(category.subtitle.toUpperCase(), 118, 425);

  ctx.globalAlpha = 0.36;
  ctx.fillStyle = category.colors.ink;
  ctx.beginPath();
  ctx.roundRect(1090, 205, 270, 270, 18);
  ctx.fill();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = category.colors.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(1225, 340, 96, 0.25, Math.PI * 1.75);
  ctx.stroke();

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = category.colors.ink;
  ctx.fillRect(0, 0, canvas.width, 2);
  ctx.fillRect(0, canvas.height - 2, canvas.width, 2);

  if (reflection) {
    ctx.globalCompositeOperation = "destination-in";
    const fade = ctx.createLinearGradient(0, 0, 0, canvas.height);
    fade.addColorStop(0, "rgba(0, 0, 0, 0)");
    fade.addColorStop(0.16, "rgba(0, 0, 0, 0.24)");
    fade.addColorStop(0.72, "rgba(0, 0, 0, 0.05)");
    fade.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = fade;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

function makeSegmentGeometry(index: number): CylinderGeometryType {
  const thetaStart = -SEGMENT_ANGLE / 2 + index * SEGMENT_ANGLE;
  const geometry = new CylinderGeometry(
    RING_RADIUS,
    RING_RADIUS,
    PANEL_HEIGHT,
    RADIAL_SEGMENTS,
    1,
    true,
    thetaStart,
    SEGMENT_ANGLE,
  );

  return geometry;
}

export function PortfolioPanel({
  category,
  index,
  active = false,
  reflection = false,
}: PortfolioPanelProps) {
  const texture = useMemo(
    () => makeTexture(category, reflection),
    [category, reflection],
  );
  const geometry = useMemo(() => makeSegmentGeometry(index), [index]);

  useEffect(() => {
    return () => {
      texture.dispose();
      geometry.dispose();
    };
  }, [geometry, texture]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        map={texture}
        transparent={reflection}
        opacity={reflection ? 0.46 : 1}
        toneMapped={false}
        depthWrite={!reflection}
        color={active || reflection ? "#ffffff" : "#d6d0c8"}
        side={DoubleSide}
      />
    </mesh>
  );
}
