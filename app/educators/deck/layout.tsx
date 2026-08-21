import type { Metadata } from "next";
import type { ReactNode } from "react";
import { HIDE_SITE_CHROME } from "@/components/kit/chrome";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Decks own the whole viewport: no site header, footer or cookie notice. */
export default function DeckLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HIDE_SITE_CHROME }} />
      <div data-deck className="deck">
        {children}
      </div>
    </>
  );
}
