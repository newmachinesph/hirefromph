import { ButtonLink, Kicker } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <Kicker>Error 404</Kicker>
      <p className="mt-6 font-display text-[length:var(--text-hero)] leading-none text-line-strong">
        404
      </p>
      <h1 className="mt-2 font-display text-[length:var(--text-h2)] leading-tight text-balance">
        This page wandered off its path.
      </h1>
      <p className="mt-4 max-w-md text-ink-soft">
        No worries, every online professional takes a wrong turn or two. Let&rsquo;s
        get you back to something useful.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/start" variant="outline">
          Start your path
        </ButtonLink>
      </div>
    </section>
  );
}
