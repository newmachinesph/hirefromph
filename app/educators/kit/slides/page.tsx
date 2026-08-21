import type { Metadata } from "next";
import type { ReactNode } from "react";
import { KitPage, Slide } from "@/components/kit";
import { JourneyMap, MethodLoop } from "@/components/diagrams";
import { notFound } from "next/navigation";
import { KIT_FILES, SLIDES } from "@/lib/educators";

export const metadata: Metadata = { title: "Kit · The slides" };

/**
 * Two slides carry a diagram. Keyed by slide id so re-ordering the deck in
 * data/educators.json moves the diagram with its slide.
 */
const SLIDE_MEDIA: Record<string, ReactNode> = {
  stages: <JourneyMap />,
  "method-give": <MethodLoop />,
};

export default function SlidesDeck() {
  // Postponed by owner ruling: the deck stays in the repo but is not on the site yet.
  if (KIT_FILES.find((file) => file.slug === "hirefromph-slides")?.published === false) notFound();
  return (
    <>
      {SLIDES.map((slide, index) => (
        <KitPage
          key={slide.id}
          size="slide"
          n={index + 1}
          of={SLIDES.length}
          navy={slide.id === "title"}
        >
          <Slide
            kicker={slide.kicker}
            title={slide.title}
            body={slide.body}
            source={slide.source}
            media={SLIDE_MEDIA[slide.id]}
            level={index === 0 ? 1 : 2}
            mark={index === 0}
          />
        </KitPage>
      ))}
    </>
  );
}
