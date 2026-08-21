"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Honors the user's prefers-reduced-motion setting for every motion/react
 * animation in the tree (scroll reveals, layout transitions, etc.).
 * `reducedMotion="user"` disables transform/layout motion for those users
 * while leaving opacity fades intact.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
