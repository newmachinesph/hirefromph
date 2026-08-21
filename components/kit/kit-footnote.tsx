import { cn } from "@/lib/utils";

export type KitFootnoteProps = {
  label: string;
  url: string;
  className?: string;
};

/**
 * A citation on paper. The URL is printed in full as well as linked, because a
 * PDF has no hover and a bare link label is an unsourced claim once it prints.
 */
export function KitFootnote({ label, url, className }: KitFootnoteProps) {
  return (
    <p className={cn("kit-note kit-avoid", className)}>
      Source: {label} —{" "}
      <a href={url} className="kit-url">
        {url}
      </a>
    </p>
  );
}
