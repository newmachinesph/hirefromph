import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = {
  children: ReactNode;
  /** Present → renders a link. Absent → renders a <button>. */
  href?: string;
  /** Only meaningful with `href`: new tab plus a safe rel. */
  external?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconEnd?: ReactNode;
  type?: "button" | "submit" | "reset";
  /** A disabled control is never a link — it renders a real disabled <button>. */
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  className?: string;
  "aria-label"?: string;
};

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-pill font-display font-bold transition-colors duration-150 ease-out";

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-small",
  md: "h-11 px-5 text-base",
  lg: "h-12 px-6 text-body",
};

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-deep",
  secondary: "bg-tint text-primary-deep hover:bg-primary-soft",
  outline: "border border-line-strong bg-paper text-ink hover:border-ink hover:bg-band",
  ghost: "text-ink hover:bg-band",
  link: "min-h-11 px-0 text-primary underline decoration-transparent underline-offset-4 hover:decoration-current",
};

export function Button({
  children,
  href,
  external = false,
  variant = "primary",
  size = "md",
  icon,
  iconEnd,
  type = "button",
  disabled = false,
  onClick,
  className,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const cls = cn(
    BASE,
    variant !== "link" && SIZES[size],
    VARIANTS[variant],
    disabled && "cursor-not-allowed opacity-50",
    className,
  );

  const inner = (
    <>
      {icon}
      {children}
      {iconEnd}
    </>
  );

  if (href && !disabled) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
          aria-label={ariaLabel}
          className={cls}
        >
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} onClick={onClick} aria-label={ariaLabel} className={cls}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cls}
    >
      {inner}
    </button>
  );
}
