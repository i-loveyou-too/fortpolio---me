"use client";

import { useEffect, useRef } from "react";

type UseWheelCarouselOptions = {
  enabled: boolean;
  onStep: (direction: 1 | -1) => void;
};

export function useWheelCarousel({ enabled, onStep }: UseWheelCarouselOptions) {
  const onStepRef = useRef(onStep);
  const accumulatedDelta = useRef(0);
  const lockedUntil = useRef(0);
  const snapTimer = useRef<number | null>(null);

  useEffect(() => {
    onStepRef.current = onStep;
  }, [onStep]);

  useEffect(() => {
    const threshold = 84;
    const lockDuration = 420;

    function handleWheel(event: WheelEvent) {
      if (!enabled) return;

      event.preventDefault();

      const now = performance.now();
      accumulatedDelta.current += event.deltaY;

      if (snapTimer.current) {
        window.clearTimeout(snapTimer.current);
      }

      snapTimer.current = window.setTimeout(() => {
        accumulatedDelta.current = 0;
      }, 160);

      if (now < lockedUntil.current) return;
      if (Math.abs(accumulatedDelta.current) < threshold) return;

      const direction = accumulatedDelta.current > 0 ? 1 : -1;
      accumulatedDelta.current = 0;
      lockedUntil.current = now + lockDuration;
      onStepRef.current(direction);
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (snapTimer.current) {
        window.clearTimeout(snapTimer.current);
      }
    };
  }, [enabled]);
}
