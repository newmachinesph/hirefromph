import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container, type ContainerSize } from "./container";

export type SectionBand = "none" | "tint" | "navy";
export type SectionSpacing = "default" | "hero" | "none";

const BAND: Record<SectionBand, string> = {
  none: "bg-paper",
  tint: "bg-band",
  navy: "bg-ink text-on-navy",
};

/** 64px mobile → 96px desktop; 128px for the homepage hero and CTA (spec §4.4). */
const SPACING: Record<SectionSpacing, string> = {
  default: "py-16 lg:py-24",
  hero: "py-20 lg:py-32",
  none: "",
};

export function Section({
  children,
  band = "none",
  spacing = "default",
  size = "default",
  id,
  className,
}: {
  children: ReactNode;
  band?: SectionBand;
  spacing?: SectionSpacing;
  size?: ContainerSize;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={cn(BAND[band], SPACING[spacing], className)}>
      <Container size={size}>{children}</Container>
    </section>
  );
}
