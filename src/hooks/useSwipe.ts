"use client";

import { useRef } from "react";
import type { PointerEvent } from "react";

type UseSwipeOptions = {
  enabled: boolean;
  onStep: (direction: 1 | -1) => void;
};

export function useSwipe({ enabled, onStep }: UseSwipeOptions) {
  const start = useRef<{
    x: number;
    y: number;
    pointerId: number;
    triggered: boolean;
  } | null>(null);

  function isInteractiveTarget(target: EventTarget | null) {
    return target instanceof Element && Boolean(target.closest("button, a"));
  }

  function resolveDrag(dx: number, dy: number) {
    if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.15) return false;
    onStep(dx < 0 ? 1 : -1);
    return true;
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    if (!enabled) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (isInteractiveTarget(event.target)) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    start.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      triggered: false,
    };
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (!enabled || !start.current || start.current.triggered) return;

    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;

    if (resolveDrag(dx, dy)) {
      start.current.triggered = true;
    }
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    if (!enabled || !start.current) return;

    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    const { pointerId, triggered } = start.current;
    start.current = null;

    if (event.currentTarget.hasPointerCapture(pointerId)) {
      event.currentTarget.releasePointerCapture(pointerId);
    }

    if (!triggered) {
      resolveDrag(dx, dy);
    }
  }

  function onPointerCancel(event: PointerEvent<HTMLElement>) {
    if (
      start.current &&
      event.currentTarget.hasPointerCapture(start.current.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(start.current.pointerId);
    }
    start.current = null;
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}
