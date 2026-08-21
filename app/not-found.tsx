import { Section } from "@/components/layout";
import { Button, Text } from "@/components/ui";

export default function NotFound() {
  return (
    <Section>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Text size="caption" tone="faint" className="uppercase tracking-wider">
          Error 404
        </Text>
        <p className="mt-6 font-display text-hero leading-none text-line-strong">404</p>
        <h1 className="mt-2 font-display text-h2 text-balance text-ink">
          This page wandered off its path.
        </h1>
        <Text className="mt-4 max-w-md">
          No worries, every online professional takes a wrong turn or two. Let’s get you back to
          something useful.
        </Text>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/">Back home</Button>
          <Button href="/start" variant="outline">
            Start your path
          </Button>
        </div>
      </div>
    </Section>
  );
}
