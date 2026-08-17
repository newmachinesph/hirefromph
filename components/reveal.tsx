import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Retained for call-site compatibility after removing universal scroll fades. */
  i?: number;
  as?: "div" | "section" | "li" | "article" | "span";
};

/**
 * Structural wrapper used across long-form pages.
 *
 * Content stays visible in server HTML and without IntersectionObserver. Page-
 * specific motion can still be added where it communicates a state change.
 */
export function Reveal({ children, className, as: Tag = "div" }: Props) {
  return <Tag className={className}>{children}</Tag>;
}
