"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Deck } from "@/lib/deck";
import { cn } from "@/lib/utils";
import { SlideFrame } from "./slide-frame";
import { SlideView } from "./slides";

const SWIPE_PX = 60;

function indexFromHash(length: number): number {
  if (typeof window === "undefined") return 0;
  const n = Number.parseInt(window.location.hash.replace("#", ""), 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(n - 1, 0), length - 1);
}

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.();
}

/**
 * Keyboard-driven slide show. `#n` in the URL is the slide number, so a
 * presenter can deep-link or refresh without losing their place. N toggles the
 * speaker notes, F goes fullscreen, Esc leaves fullscreen (the browser does
 * that) and the Back link is always on screen outside fullscreen.
 */
export function Presenter({
  deck,
  attribution,
  backHref = "/educators",
}: {
  deck: Deck;
  attribution: string;
  backHref?: string;
}) {
  const [index, setIndex] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const touchStart = useRef<number | null>(null);
  const total = deck.slides.length;

  const go = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), total - 1);
      setIndex(clamped);
      window.history.replaceState(null, "", `#${clamped + 1}`);
    },
    [total],
  );

  /* eslint-disable react-hooks/set-state-in-effect -- the hash is only readable on the client, after hydration */
  useEffect(() => {
    setIndex(indexFromHash(total));
    const onHash = () => setIndex(indexFromHash(total));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [total]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
        case " ":
          event.preventDefault();
          go(index + 1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          go(index - 1);
          break;
        case "Home":
          go(0);
          break;
        case "End":
          go(total - 1);
          break;
        case "n":
        case "N":
          setNotesOpen((open) => !open);
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        default:
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, total]);

  const slide = deck.slides[index];

  return (
    <div className={cn("deck-presenter", notesOpen && "deck-presenter--notes")}>
      <div
        className="deck-presenter__stage"
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          touchStart.current = null;
          if (start === null) return;
          const delta = (event.changedTouches[0]?.clientX ?? start) - start;
          if (delta <= -SWIPE_PX) go(index + 1);
          else if (delta >= SWIPE_PX) go(index - 1);
        }}
      >
        <SlideFrame className="deck-presenter__frame">
          <SlideView deck={deck} slide={slide} n={index + 1} attribution={attribution} />
        </SlideFrame>
      </div>

      {notesOpen && (
        <aside className="deck-presenter__notes" aria-label="Speaker notes">
          <p className="deck-presenter__notes-kicker">Notes · slide {index + 1}</p>
          <p>{slide.notes}</p>
        </aside>
      )}

      <div className="deck-presenter__bar" role="toolbar" aria-label="Presenter controls">
        <Link href={backHref} className="deck-presenter__link">
          ← Back
        </Link>
        <span className="deck-presenter__title">{deck.title}</span>
        <div className="deck-presenter__controls">
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous slide">
            ‹
          </button>
          <span className="deck-presenter__count" aria-live="polite">
            {index + 1} / {total}
          </span>
          <button type="button" onClick={() => go(index + 1)} disabled={index === total - 1} aria-label="Next slide">
            ›
          </button>
          <button type="button" onClick={() => setNotesOpen((open) => !open)} aria-pressed={notesOpen}>
            Notes
          </button>
          <button type="button" onClick={toggleFullscreen}>
            Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
}
