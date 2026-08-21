import Link from "next/link";
import { cn } from "@/lib/utils";

export type FooterLink = { label: string; href: string };

export function PageFooterNav({
  prev,
  next,
  up,
  className,
}: {
  prev?: FooterLink;
  next?: FooterLink;
  up?: FooterLink;
  className?: string;
}) {
  if (!prev && !next && !up) return null;

  return (
    <nav
      aria-label="Page navigation"
      className={cn(
        "flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {prev && (
          <Link
            href={prev.href}
            className="group flex flex-col gap-0.5 transition-colors duration-150 ease-out hover:text-primary"
          >
            <span className="text-caption text-ink-faint">Previous</span>
            <span className="text-base font-medium text-ink group-hover:text-primary">
              <span aria-hidden>← </span>
              {prev.label}
            </span>
          </Link>
        )}
      </div>

      {up && (
        <Link
          href={up.href}
          className="text-small font-medium text-primary underline underline-offset-4"
        >
          {up.label}
        </Link>
      )}

      <div className="min-w-0 sm:text-right">
        {next && (
          <Link
            href={next.href}
            className="group flex flex-col gap-0.5 transition-colors duration-150 ease-out hover:text-primary"
          >
            <span className="text-caption text-ink-faint">Next</span>
            <span className="text-base font-medium text-ink group-hover:text-primary">
              {next.label}
              <span aria-hidden> →</span>
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
