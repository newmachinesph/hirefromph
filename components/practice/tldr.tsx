import tldrData from "@/data/tldr.json";
import { Accordion, AccordionItem, Text } from "@/components/ui";

type TldrEntry = { tl: string; reviewed: boolean };

const ROUTES = tldrData.routes as Record<string, TldrEntry | undefined>;

/**
 * "TL;DR sa Tagalog", collapsed by default (spec §7.4.7).
 *
 * The drafts were written in this project and are flagged for native-speaker
 * review. Until `reviewed` flips to true the block says so: a translation
 * nobody has checked is the same kind of unbacked claim the honesty doctrine
 * exists to stop. The note sits under the text as a caption, not over it as a
 * badge, so the reader gets the TL;DR first and the caveat where it applies.
 */
export function Tldr({ route }: { route: string }) {
  const entry = ROUTES[route];
  if (!entry) return null;

  const id = `tldr-${route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`;

  return (
    <Accordion type="single">
      <AccordionItem id={id} title="TL;DR sa Tagalog">
        <div className="flex flex-col gap-3">
          <Text tone="ink">{entry.tl}</Text>
          {!entry.reviewed && (
            <Text size="caption" tone="faint">
              Draft translation. A native speaker has not checked this yet; read the English
              above if anything here reads wrong.
            </Text>
          )}
        </div>
      </AccordionItem>
    </Accordion>
  );
}
