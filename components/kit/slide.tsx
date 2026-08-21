import type { ReactNode } from "react";
import { LogoMark } from "@/components/site/logo";
import type { KitSource } from "@/lib/educators";
import { cn } from "@/lib/utils";
import { KitFootnote } from "./kit-footnote";

export type SlideProps = {
  kicker: string;
  title: string;
  body: string;
  source?: KitSource;
  /** A diagram column. Splits the slide in two when present. */
  media?: ReactNode;
  /** The deck's first slide carries the document's only h1. */
  level?: 1 | 2;
  /** Ladder mark above the kicker — the title slide only. */
  mark?: boolean;
};

export function Slide({
  kicker,
  title,
  body,
  source,
  media,
  level = 2,
  mark = false,
}: SlideProps) {
  const Tag = level === 1 ? "h1" : "h2";
  return (
    <div className={cn("kit-slide", media && "kit-slide--split")}>
      <div>
        {mark && (
          <p className="kit-head__mark">
            <LogoMark size={40} mono />
          </p>
        )}
        <p className="kit-kicker">{kicker}</p>
        <Tag className="kit-slide-title">{title}</Tag>
        <p className="kit-slide-body">{body}</p>
        {source && <KitFootnote label={source.label} url={source.url} />}
      </div>
      {media && <div className="kit-slide__media">{media}</div>}
    </div>
  );
}
