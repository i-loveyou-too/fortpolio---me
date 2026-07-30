"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Category } from "@/types/portfolio";

type CategoryIndicatorProps = {
  categories: Category[];
  activeIndex: number;
  onStep: (direction: 1 | -1) => void;
};

export function CategoryIndicator({
  categories,
  activeIndex,
  onStep,
}: CategoryIndicatorProps) {
  const active = categories[activeIndex];

  return (
    <div className="absolute inset-x-0 bottom-5 z-30 flex justify-center px-5">
      <div className="flex items-center gap-4 rounded-full bg-white/60 px-2.5 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-black/70 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <button
          type="button"
          aria-label="Previous category"
          onClick={() => onStep(-1)}
          className="grid size-7 place-items-center rounded-full text-base leading-none transition-colors hover:bg-black/10"
        >
          ‹
        </button>

        <div className="flex min-w-36 items-center justify-center gap-2">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={active.id}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.22 }}
              aria-live="polite"
            >
              {active.title}
            </motion.span>
          </AnimatePresence>
          <span className="text-black/35">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(categories.length).padStart(2, "0")}
          </span>
        </div>

        <div className="flex items-center gap-1.5" aria-hidden="true">
          {categories.map((category, index) => (
            <span
              key={category.id}
              className={`block h-1.5 rounded-full transition-all ${
                index === activeIndex ? "w-5 bg-black/65" : "w-1.5 bg-black/20"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Next category"
          onClick={() => onStep(1)}
          className="grid size-7 place-items-center rounded-full text-base leading-none transition-colors hover:bg-black/10"
        >
          ›
        </button>
      </div>
    </div>
  );
}
