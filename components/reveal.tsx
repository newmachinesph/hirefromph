"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const variants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1],
      delay: i * 0.07,
    },
  }),
};

type Props = {
  children: ReactNode;
  className?: string;
  /** stagger index */
  i?: number;
  as?: "div" | "section" | "li" | "article" | "span";
};

export function Reveal({ children, className, i = 0, as = "div" }: Props) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      custom={i}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </MotionTag>
  );
}
