"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  LinearFilter,
  ShaderMaterial,
  SRGBColorSpace,
  type CanvasTexture as CanvasTextureType,
  type CylinderGeometry as CylinderGeometryType,
} from "three";
import { useRef } from "react";
import type { Category } from "@/types/portfolio";

export const RING_RADIUS = 3.42;
export const PANEL_HEIGHT = 2.55;
export const SEGMENT_ANGLE = (Math.PI * 2) / 3;
const PANEL_ARC_ANGLE = SEGMENT_ANGLE * 0.82;
const RADIAL_SEGMENTS = 56;

type PortfolioPanelProps = {
  category: Category;
  index: number;
  activeIndex: number;
  active?: boolean;
  reflection?: boolean;
};

function getCardImagePath(category: Category) {
  return `/${category.title.toUpperCase()}.png`;
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = (width - drawWidth) / 2;
  const drawY = (height - drawHeight) / 2;

  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawGlassHighlights(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const surfaceLight = ctx.createLinearGradient(0, 0, width, height);
  surfaceLight.addColorStop(0, "rgba(255, 255, 255, 0.18)");
  surfaceLight.addColorStop(0.28, "rgba(255, 255, 255, 0.04)");
  surfaceLight.addColorStop(0.74, "rgba(255, 255, 255, 0.02)");
  surfaceLight.addColorStop(1, "rgba(255, 255, 255, 0.12)");
  ctx.fillStyle = surfaceLight;
  ctx.fillRect(0, 0, width, height);

  const topHighlight = ctx.createLinearGradient(0, 0, width, 0);
  topHighlight.addColorStop(0, "rgba(255, 255, 255, 0.08)");
  topHighlight.addColorStop(0.5, "rgba(255, 255, 255, 0.72)");
  topHighlight.addColorStop(1, "rgba(255, 255, 255, 0.08)");
  ctx.strokeStyle = topHighlight;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(30, 34);
  ctx.bezierCurveTo(380, 4, 1090, 0, 1506, 34);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, width - 16, height - 16);

  const upperSheen = ctx.createLinearGradient(0, 0, 0, height * 0.5);
  upperSheen.addColorStop(0, "rgba(255, 255, 255, 0.18)");
  upperSheen.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = upperSheen;
  ctx.fillRect(0, 0, width, height * 0.42);
}

function makeTexture(category: Category, reflection = false): CanvasTextureType {
  const canvas = document.createElement("canvas");
  canvas.width = 1536;
  canvas.height = 768;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  const image = new Image();
  image.onload = () => {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImageCover(ctx, image, canvas.width, canvas.height);
    drawGlassHighlights(ctx, canvas.width, canvas.height);

    if (reflection) {
      ctx.globalCompositeOperation = "destination-in";
      const fade = ctx.createLinearGradient(0, 0, 0, canvas.height);
      fade.addColorStop(0, "rgba(0, 0, 0, 0)");
      fade.addColorStop(0.06, "rgba(0, 0, 0, 0.24)");
      fade.addColorStop(0.44, "rgba(0, 0, 0, 0.1)");
      fade.addColorStop(0.7, "rgba(0, 0, 0, 0.02)");
      fade.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    texture.needsUpdate = true;
  };
  image.src = getCardImagePath(category);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

function makeSegmentGeometry(
  index: number,
  active: boolean,
): CylinderGeometryType {
  const thetaLength = PANEL_ARC_ANGLE;
  const centerAngle = index * SEGMENT_ANGLE;
  const thetaStart = centerAngle - thetaLength / 2;
  const geometry = new CylinderGeometry(
    active ? RING_RADIUS : RING_RADIUS - 0.018,
    active ? RING_RADIUS : RING_RADIUS - 0.018,
    PANEL_HEIGHT,
    RADIAL_SEGMENTS,
    1,
    true,
    thetaStart,
    thetaLength,
  );

  return geometry;
}

function ReflectionMaterial({
  active,
  texture,
}: {
  active: boolean;
  texture: CanvasTextureType;
}) {
  const materialRef = useRef<ShaderMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <shaderMaterial
      ref={materialRef}
      transparent
      depthWrite={false}
      side={DoubleSide}
      uniforms={{
        uMap: { value: texture },
        uTime: { value: 0 },
        uOpacity: { value: active ? 0.64 : 0.34 },
      }}
      vertexShader={`
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `}
      fragmentShader={`
        uniform sampler2D uMap;
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          float waveA = sin((vUv.x * 15.0) + uTime * 0.34) * 0.0035;
          float waveB = sin((vUv.x * 27.0) - uTime * 0.22) * 0.002;
          vec2 uv = vec2(
            vUv.x + waveA + waveB,
            1.0 - vUv.y + sin(vUv.y * 10.0 + uTime * 0.18) * 0.0016
          );
          vec4 color = texture2D(uMap, uv);
          float sideDistance = abs(vUv.x - 0.5) * 2.0;
          float sideFeather = 1.0 - smoothstep(0.58, 1.0, sideDistance);
          float bottomFeather = 1.0 - smoothstep(0.44, 0.95, vUv.y);
          float topFeather = smoothstep(0.0, 0.055, vUv.y);
          float verticalFade = smoothstep(0.86, 0.0, vUv.y);
          float wateryEdge = pow(sideFeather, 1.35) * bottomFeather * (0.76 + topFeather * 0.24);
          float fade = verticalFade * wateryEdge;
          float waterSoftness = 0.96 - smoothstep(0.0, 1.0, vUv.y) * 0.18;
          gl_FragColor = vec4(color.rgb * waterSoftness, color.a * fade * uOpacity);
        }
      `}
    />
  );
}

export function PortfolioPanel({
  category,
  index,
  active = false,
  reflection = false,
}: PortfolioPanelProps) {
  const texture = useMemo(
    () => makeTexture(category),
    [category],
  );
  const geometry = useMemo(
    () => makeSegmentGeometry(index, active),
    [active, index],
  );

  useEffect(() => {
    return () => {
      texture.dispose();
      geometry.dispose();
    };
  }, [geometry, texture]);

  return (
    <mesh geometry={geometry}>
      {reflection ? (
        <ReflectionMaterial active={active} texture={texture} />
      ) : (
        <meshBasicMaterial
          map={texture}
          transparent={!active}
          opacity={active ? 1 : 0.42}
          toneMapped={false}
          depthWrite
          color={active ? "#ffffff" : "#d8e4e7"}
          side={DoubleSide}
        />
      )}
    </mesh>
  );
}
