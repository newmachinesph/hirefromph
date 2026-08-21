import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Presenter } from "@/components/deck";
import { DECKS, getDeck } from "@/lib/deck";
import { KIT_LICENSE } from "@/lib/educators";

/** Only the authored decks exist; anything else is a 404. */
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
  return { title: deck ? `Deck · ${deck.title}` : "Deck" };
}

export default async function DeckPresenterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deck = getDeck(id);
  if (!deck) notFound();
  return <Presenter deck={deck} attribution={KIT_LICENSE.attribution} />;
}
