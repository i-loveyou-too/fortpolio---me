"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Ripple = {
  x: number;
  y: number;
  createdAt: number;
  strength: number;
};

const RIPPLE_LIFETIME = 4.2;
const RIPPLE_SPEED = 118;
const RIPPLE_BAND_BASE = 28;
const RIPPLE_BAND_GROWTH = 18;
const RIPPLE_FREQUENCY = 1.65;
const RIPPLE_VERTICAL_FORCE = 0.68;
const MAX_RIPPLES = 2;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function sampleAlpha(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
) {
  if (x < 0 || y < 0 || x >= width - 1 || y >= height - 1) {
    return 0;
  }

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const fx = x - x0;
  const fy = y - y0;
  const topLeft = data[(y0 * width + x0) * 4 + 3];
  const topRight = data[(y0 * width + x1) * 4 + 3];
  const bottomLeft = data[(y1 * width + x0) * 4 + 3];
  const bottomRight = data[(y1 * width + x1) * 4 + 3];
  const top = topLeft + (topRight - topLeft) * fx;
  const bottom = bottomLeft + (bottomRight - bottomLeft) * fx;

  return top + (bottom - top) * fy;
}

export function BackgroundTitle() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLCanvasElement | null>(null);
  const sourceDataRef = useRef<ImageData | null>(null);
  const outputDataRef = useRef<ImageData | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const frameRef = useRef<number | null>(null);
  const renderRef = useRef<(time: number) => void>(() => {});
  const lastPointerRef = useRef({ x: 0, y: 0, time: 0, initialized: false });
  const reducedMotion = useReducedMotion();

  const drawSource = useCallback(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;

    const ctx = source.getContext("2d");
    if (!ctx) return;

    const { width, height } = source;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const dpr = width / Math.max(cssWidth, 1);
    const fontSize = clamp(
      Math.min(cssHeight * 0.72, cssWidth * 0.16) * dpr,
      72 * dpr,
      232 * dpr,
    );

    ctx.font = `600 ${fontSize}px Georgia, "Times New Roman", serif`;
    ctx.fillText("PORTFOLIO", width / 2, height / 2);
  }, []);

  const drawStill = useCallback(() => {
    const canvas = canvasRef.current;
    const source = sourceRef.current;
    if (!canvas || !source) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(source, 0, 0);
  }, []);

  const render = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      const sourceData = sourceDataRef.current;
      if (!canvas || !sourceData) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const now = time / 1000;
      ripplesRef.current = ripplesRef.current.filter(
        (ripple) => now - ripple.createdAt < RIPPLE_LIFETIME,
      );

      if (reducedMotion || ripplesRef.current.length === 0) {
        drawStill();
        frameRef.current = null;
        return;
      }

      const { width, height } = canvas;
      let outputData = outputDataRef.current;
      if (!outputData || outputData.width !== width || outputData.height !== height) {
        outputData = ctx.createImageData(width, height);
        outputDataRef.current = outputData;
      }

      const sourcePixels = sourceData.data;
      const outputPixels = outputData.data;

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          let offsetX = 0;
          let offsetY = 0;

          for (const ripple of ripplesRef.current) {
            const age = now - ripple.createdAt;
            const radius = age * RIPPLE_SPEED;
            const dx = x - ripple.x;
            const dy = y - ripple.y;
            const distance = Math.hypot(dx, dy) || 1;
            const band = RIPPLE_BAND_BASE + age * RIPPLE_BAND_GROWTH;
            const phase = (distance - radius) / band;
            const envelope = Math.exp(-phase * phase * 0.55);
            const decay = (1 - age / RIPPLE_LIFETIME) ** 2.8;
            const wave = Math.sin(phase * Math.PI * RIPPLE_FREQUENCY) * envelope * decay;
            const force = wave * ripple.strength;

            offsetX += (dx / distance) * force;
            offsetY += (dy / distance) * force * RIPPLE_VERTICAL_FORCE;
          }

          const targetIndex = (y * width + x) * 4;
          const alpha = sampleAlpha(
            sourcePixels,
            width,
            height,
            x - offsetX,
            y - offsetY,
          );

          outputPixels[targetIndex] = 0;
          outputPixels[targetIndex + 1] = 0;
          outputPixels[targetIndex + 2] = 0;
          outputPixels[targetIndex + 3] = alpha;
        }
      }

      ctx.putImageData(outputData, 0, 0);

      frameRef.current = window.requestAnimationFrame((nextTime) => {
        renderRef.current(nextTime);
      });
    },
    [drawStill, reducedMotion],
  );

  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  const startRender = useCallback(() => {
    if (frameRef.current === null && !reducedMotion) {
      frameRef.current = window.requestAnimationFrame((time) => {
        renderRef.current(time);
      });
    }
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    function resize() {
      if (!canvas || !wrapper) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.4);
      const rect = wrapper.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));

      const source = document.createElement("canvas");
      source.width = canvas.width;
      source.height = canvas.height;
      sourceRef.current = source;

      drawSource();
      const sourceCtx = source.getContext("2d");
      sourceDataRef.current = sourceCtx
        ? sourceCtx.getImageData(0, 0, source.width, source.height)
        : null;
      outputDataRef.current = null;
      drawStill();
    }

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(wrapper);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [drawSource, drawStill]);

  useEffect(() => {
    if (reducedMotion) {
      ripplesRef.current = [];
      drawStill();
      return;
    }

    function addRipple(event: PointerEvent) {
      const canvas = canvasRef.current;
      const wrapper = wrapperRef.current;
      if (!canvas || !wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return;
      }

      const dpr = canvas.width / Math.max(rect.width, 1);
      const x = (event.clientX - rect.left) * dpr;
      const y = (event.clientY - rect.top) * dpr;
      const last = lastPointerRef.current;
      const now = performance.now();

      if (!last.initialized) {
        lastPointerRef.current = { x, y, time: now, initialized: true };
        return;
      }

      const distance = Math.hypot(x - last.x, y - last.y);
      const elapsed = Math.max(now - last.time, 16);
      if (distance < 34 * dpr && elapsed < 140) return;

      const speed = distance / elapsed;
      ripplesRef.current.push({
        x,
        y,
        createdAt: now / 1000,
        strength: clamp(4.4 + speed * 12, 5.4, 12.8) * dpr,
      });

      if (ripplesRef.current.length > MAX_RIPPLES) {
        ripplesRef.current.splice(0, ripplesRef.current.length - MAX_RIPPLES);
      }

      lastPointerRef.current = { x, y, time: now, initialized: true };
      startRender();
    }

    window.addEventListener("pointermove", addRipple, { passive: true });
    return () => window.removeEventListener("pointermove", addRipple);
  }, [drawStill, reducedMotion, startRender]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 z-0 h-[29vw] min-h-[104px] w-[112vw] -translate-x-1/2 -translate-y-1/2 overflow-visible sm:h-[22vw]"
      style={{ top: "43dvh" }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
