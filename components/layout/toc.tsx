import { cn } from "@/lib/utils";

export type TocItem = { id: string; label: string };

/** On-page nav for long guides. Visible from `xl` only (spec §5.3). */
export function Toc({
  items,
  title = "On this page",
  className,
}: {
  items: TocItem[];
  title?: string;
  className?: string;
}) {
  if (items.length === 0) return null;
  return (
    <nav
      aria-label={title}
      className={cn("hidden xl:sticky xl:top-28 xl:block xl:self-start", className)}
    >
      <p className="text-kicker uppercase text-ink-faint">{title}</p>
      <ul className="mt-3 flex flex-col gap-2 border-l border-line pl-4">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-small text-ink-soft transition-colors duration-150 ease-out hover:text-ink"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
