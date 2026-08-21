import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export type SourceGrade = "primary" | "vendor";

export type SourceProps = {
  label: string;
  url: string;
  date?: string;
  /** "vendor" = staffing/training-vendor marketing with no disclosed method. */
  grade?: SourceGrade;
  className?: string;
};

export function Source({ label, url, date, grade = "primary", className }: SourceProps) {
  return (
    <p className={cn("text-caption text-ink-faint", className)}>
      <span className="font-medium text-ink-soft">Source:</span>{" "}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline underline-offset-2"
      >
        {label}
      </a>
      {date && <span> · {date}</span>}
      {grade === "vendor" && (
        <Badge tone="caution" variant="outline" className="ml-2 align-middle">
          Vendor-grade
        </Badge>
      )}
    </p>
  );
}

export function SourceList({
  sources,
  className,
}: {
  sources: SourceProps[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-1.5", className)}>
      {sources.map((source) => (
        <li key={`${source.url}-${source.label}`}>
          <Source {...source} />
        </li>
      ))}
    </ul>
  );
}
