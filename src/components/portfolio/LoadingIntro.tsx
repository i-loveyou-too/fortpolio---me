"use client";

import { AnimatePresence, motion } from "framer-motion";

type LoadingIntroProps = {
  visible: boolean;
};

export function LoadingIntro({ visible }: LoadingIntroProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50 grid place-items-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-serif text-sm uppercase tracking-[0.18em] text-black/55">
            KYUNGRIM LIM
          </p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
