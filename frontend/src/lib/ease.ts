import type { Transition } from "motion/react";

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const EASE_OUT_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

export const SPRING_GLIDE: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  mass: 1,
};
