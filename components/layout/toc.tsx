import { cn } from "@/lib/utils";

export type TocItem = { id: string; label: string };

export type TocProps = {
  items: TocItem[];
  title?: string;
  /**
   * Render the collapsed "On this page" disclosure shown below `xl`, instead
   * of the sticky sidebar shown from `xl`. Place it in the flow where it
   * should sit (directly under the hero works); keep the sidebar variant in
   * the page grid. Each variant hides itself at the other's breakpoint, so a
   * page renders both with the same items.
   */
  mobile?: boolean;
  className?: string;
};

const LINK_CLASS =
  "text-small text-ink-soft transition-colors duration-150 ease-out hover:text-ink";

function TocLinks({ items, className }: { items: TocItem[]; className?: string }) {
  return (
    <ul className={cn("flex flex-col gap-2", className)}>
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className={LINK_CLASS}>
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** On-page nav for long guides. Sidebar from `xl` (spec §5.3); `mobile` below. */
export function Toc({ items, title = "On this page", mobile = false, className }: TocProps) {
  if (items.length === 0) return null;

  if (mobile) {
    return (
      <nav aria-label={title} className={cn("w-full max-w-2xl xl:hidden", className)}>
        <details className="group rounded-md border border-line bg-paper">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-kicker uppercase text-ink-faint [&::-webkit-details-marker]:hidden">
            {title}
            <span aria-hidden className="shrink-0 text-primary">
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">–</span>
            </span>
          </summary>
          <TocLinks items={items} className="border-t border-line px-4 py-3" />
        </details>
      </nav>
    );
  }

  return (
    <nav
      aria-label={title}
      className={cn("hidden xl:sticky xl:top-28 xl:block xl:self-start", className)}
    >
      <p className="text-kicker uppercase text-ink-faint">{title}</p>
      <TocLinks items={items} className="mt-3 border-l border-line pl-4" />
    </nav>
  );
}
