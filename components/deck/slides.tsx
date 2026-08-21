/* eslint-disable @next/next/no-img-element -- slides are fixed 1920×1080 stages printed to PDF; next/image's responsive srcset adds nothing here */
import type { ReactNode } from "react";
import { JourneyMap, MethodLoop } from "@/components/diagrams";
import { LogoMark } from "@/components/site/logo";
import { iconSrc, photoSrc, type Deck, type Slide } from "@/lib/deck";
import { cn } from "@/lib/utils";

export type SlideViewProps = {
  deck: Deck;
  slide: Slide;
  /** 1-based position in the deck. */
  n: number;
  /** CC BY line printed in every footer. */
  attribution: string;
};

const NAVY_TYPES = new Set<Slide["type"]>(["title", "chapter", "close"]);

function Photo({ slide }: { slide: Slide }) {
  const photo = slide.media?.photo;
  if (!photo) return null;
  return (
    <>
      <img className="deck-photo" src={photoSrc(photo)} alt="" width={1920} height={1080} />
      <div className="deck-scrim" />
    </>
  );
}

function Foot({ slide, n, of, attribution }: { slide: Slide; n: number; of: number; attribution: string }) {
  return (
    <div className="deck-foot">
      <span className="deck-foot__left">
        {slide.source ? (
          <span className="deck-source">
            {slide.source.label} · <span className="deck-url">{slide.source.url.replace(/^https?:\/\//, "")}</span>
          </span>
        ) : (
          attribution
        )}
      </span>
      <span className="deck-num">
        {n} / {of}
      </span>
    </div>
  );
}

function Items({ items, numbered }: { items?: string[]; numbered?: boolean }) {
  if (!items?.length) return null;
  const Tag = numbered ? "ol" : "ul";
  return (
    <Tag className={cn("deck-items", numbered && "deck-items--numbered")}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </Tag>
  );
}

function Diagram({ slide }: { slide: Slide }) {
  const diagram = slide.media?.diagram;
  if (!diagram) return null;
  const Component = diagram === "journey-map" ? JourneyMap : MethodLoop;
  return (
    <div className="deck-diagram" data-diagram={diagram}>
      <Component />
    </div>
  );
}

/**
 * One slide at stage size. Pure and server-safe: the presenter (client) and
 * the print route (server) both render it.
 */
export function SlideView({ deck, slide, n, attribution }: SlideViewProps) {
  const of = deck.slides.length;
  const navy = NAVY_TYPES.has(slide.type);
  const Heading = n === 1 ? "h1" : "h2";

  let content: ReactNode;
  switch (slide.type) {
    case "title":
      content = (
        <div className="deck-pad deck-pad--end">
          <p className="deck-mark">
            <LogoMark size={72} mono />
          </p>
          <p className="deck-kicker">{slide.kicker ?? deck.subtitle}</p>
          <Heading className="deck-title deck-title--xl">{slide.title}</Heading>
          {slide.body && <p className="deck-body deck-body--lg">{slide.body}</p>}
        </div>
      );
      break;
    case "chapter":
      content = (
        <div className="deck-pad deck-pad--end">
          {slide.kicker && <p className="deck-kicker">{slide.kicker}</p>}
          <Heading className="deck-title deck-title--lg">{slide.title}</Heading>
          {slide.body && <p className="deck-body deck-body--lg">{slide.body}</p>}
        </div>
      );
      break;
    case "close":
      content = (
        <div className="deck-pad deck-pad--center">
          <p className="deck-mark">
            <LogoMark size={72} mono />
          </p>
          {slide.kicker && <p className="deck-kicker">{slide.kicker}</p>}
          <Heading className="deck-title deck-title--lg">{slide.title}</Heading>
          {slide.body && <p className="deck-body deck-body--lg">{slide.body}</p>}
          <Items items={slide.items} />
        </div>
      );
      break;
    case "method":
      content = (
        <div className="deck-pad deck-method">
          <div className="deck-method__icon">
            {slide.media?.icon && (
              <img src={iconSrc(slide.media.icon)} alt="" width={360} height={360} />
            )}
          </div>
          <div className="deck-method__text">
            {slide.kicker && <p className="deck-kicker">{slide.kicker}</p>}
            <Heading className="deck-title deck-title--md">{slide.title}</Heading>
            <Items items={slide.items} numbered />
            {slide.body && <p className="deck-drill-line">{slide.body}</p>}
          </div>
        </div>
      );
      break;
    case "diagram":
      content = (
        <div className="deck-pad">
          {slide.kicker && <p className="deck-kicker">{slide.kicker}</p>}
          <Heading className="deck-title deck-title--sm">{slide.title}</Heading>
          {slide.body && <p className="deck-body">{slide.body}</p>}
          <Diagram slide={slide} />
        </div>
      );
      break;
    case "drill":
      content = (
        <div className="deck-pad">
          <div className="deck-row">
            {slide.kicker && <p className="deck-kicker">{slide.kicker}</p>}
            {slide.minutes !== undefined && (
              <span className="deck-minutes">{slide.minutes} min</span>
            )}
          </div>
          <Heading className="deck-title deck-title--md">{slide.title}</Heading>
          {slide.body && <p className="deck-body">{slide.body}</p>}
          <Items items={slide.items} numbered />
        </div>
      );
      break;
    case "list":
      content = (
        <div className="deck-pad">
          {slide.kicker && <p className="deck-kicker">{slide.kicker}</p>}
          <Heading className="deck-title deck-title--md">{slide.title}</Heading>
          {slide.body && <p className="deck-body">{slide.body}</p>}
          <Items items={slide.items} />
        </div>
      );
      break;
    default:
      content = (
        <div className="deck-pad deck-pad--center">
          {slide.kicker && <p className="deck-kicker">{slide.kicker}</p>}
          <Heading className="deck-title deck-title--lg">{slide.title}</Heading>
          {slide.body && <p className="deck-body deck-body--lg">{slide.body}</p>}
          <Items items={slide.items} />
        </div>
      );
  }

  return (
    <section
      className={cn(
        "deck-stage",
        `deck-stage--${slide.type}`,
        navy && "deck-stage--navy",
        (slide.type === "list" || slide.type === "drill") && "deck-stage--band",
      )}
      aria-label={`Slide ${n} of ${of}`}
    >
      {navy && <Photo slide={slide} />}
      {content}
      <Foot slide={slide} n={n} of={of} attribution={attribution} />
    </section>
  );
}
