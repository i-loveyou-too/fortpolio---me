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
          className="fixed inset-0 z-50 grid place-items-center bg-[#f7f3ea]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative grid size-44 place-items-center">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 16deg, #8edff5 0deg 95deg, transparent 96deg 113deg, #c28b55 114deg 214deg, transparent 215deg 232deg, #d889c9 233deg 344deg, transparent 345deg 360deg)",
                mask: "radial-gradient(circle, transparent 58%, black 60%)",
                WebkitMask:
                  "radial-gradient(circle, transparent 58%, black 60%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-2 rounded-full border border-black/5" />
            <p className="font-serif text-sm text-black/55">Kyunglim Lim</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
