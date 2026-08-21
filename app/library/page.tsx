import { Suspense } from "react";
import { Container, PageFooterNav, PageHero, Section } from "@/components/layout";
import { LibraryBrowser } from "@/components/site";
import { Button, Heading, Text } from "@/components/ui";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  path: "/library",
  title: "Library",
  description:
    "Every guide, workshop, tool, and data page on Hire From PH, filtered by group or type.",
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
        mediaRatio="3/1"
        compact
      />
      <Section band="none">
        <Container>
          <Suspense fallback={null}>
            <LibraryBrowser />
          </Suspense>
        </Container>
      </Section>

      <Section band="tint">
        <div className="flex max-w-3xl flex-col items-start gap-6">
          <Heading level={2} size="h2" balance>
            New here? Start at Stage 1.
          </Heading>
          <Text size="lead">
            Every page in this list hangs off one of the five stages. If you do not know which
            stage you are in, Stage 1 takes you from the desk you have to one finished micro-task.
          </Text>
          <Button href="/start" variant="primary">
            Start Right
          </Button>
        </div>
      </Section>

      <Section>
        <PageFooterNav up={{ label: "Your path", href: "/path" }} />
      </Section>
    </>
  );
}
