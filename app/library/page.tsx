import { Suspense } from "react";
import { Container, PageHero, Section } from "@/components/layout";
import { LibraryBrowser } from "@/components/site";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  path: "/library",
  title: "Library",
  description:
    "Every guide, workshop, tool, and data page on Hire From PH, filtered by group, type, or stage.",
});

export default function LibraryPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Library" }]}
        kicker="Everything in one place"
        title="The library"
        lead="Every page on the site, with what it is and where it fits. Filter by group or type, or search by name."
        media={{ figureId: "library-hero" }}
        compact
      />
      <Section band="none">
        <Container>
          <Suspense fallback={null}>
            <LibraryBrowser />
          </Suspense>
        </Container>
      </Section>
    </>
  );
}
