import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SlideView } from "@/components/deck";
import { DECKS, getDeck } from "@/lib/deck";
import { KIT_LICENSE } from "@/lib/educators";

export const dynamicParams = false;

export function generateStaticParams() {
  return DECKS.map((deck) => ({ id: deck.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const deck = getDeck(id);
  return { title: deck ? `Deck · ${deck.title} · print` : "Deck · print" };
}

/** One 1920×1080 page per slide, stacked. scripts/build-decks.mjs prints this. */
const PAGE_RULE = "@page { size: 1920px 1080px; margin: 0; }";

export default async function DeckPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deck = getDeck(id);
  if (!deck) notFound();
  return (
    <div className="deck-print">
      <style dangerouslySetInnerHTML={{ __html: PAGE_RULE }} />
      {deck.slides.map((slide, index) => (
        <div key={slide.id} className="deck-print__page" data-slide={index + 1} data-slide-id={slide.id}>
          <SlideView deck={deck} slide={slide} n={index + 1} attribution={KIT_LICENSE.attribution} />
        </div>
      ))}
    </div>
  );
}
