import site from "@/data/site.json";
import { Reveal } from "@/components/reveal";
import { Kicker, Pill, SectionHeading } from "@/components/ui";
import { pageMeta } from "@/lib/meta";

export const metadata = pageMeta({
  path: "/privacy",
  title: "Privacy",
  description:
    "How DevUp handles data, in plain English: an anonymous, non-commercial project with no accounts and nothing to sell. Google Analytics only, no forms stored, and your rights under RA 10173.",
});

function Out({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs font-semibold text-ink link-sweep"
    >
      {children} ↗
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <>
      {/* --------------------------------------------------------------- HERO */}
      <section className="container-x pt-14 pb-10 lg:pt-20">
        <Reveal>
          <Kicker>Privacy · Plain English</Kicker>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-5 max-w-4xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
            We can&rsquo;t leak what
            <br />
            <span className="text-coral">we never collect.</span>
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            DevUp has no accounts, no login, no shopping cart, and no sales team.
            There is no database of you here to protect, because we never build
            one. This page says exactly what happens when you visit, in words you
            can actually check.
          </p>
        </Reveal>
        <Reveal i={3}>
          <blockquote className="mt-8 max-w-2xl border-l-2 border-coral pl-5 font-display text-xl leading-snug text-ink">
            The only data we&rsquo;re comfortable holding is none of yours.
          </blockquote>
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- WHO */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Who runs this"
              title="An anonymous, non-commercial project"
              lead="DevUp is an independent project built for Filipino online professionals. No company name, no registered business, no names attached. It is free, permanently, and it sells nothing, so there is no commercial reason to profile you."
            />
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ COLLECT */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker="What we collect"
            title="Aggregate analytics, and nothing else"
            lead="One tool, used honestly: Google Analytics, so we know which pages help and which ones don't."
          />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Reveal>
            <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
              <h3 className="font-display text-lg leading-snug">
                Google Analytics
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                It records anonymous, aggregate patterns: which pages get viewed,
                rough device type, and general region (usually just the country).
                It sets cookies to do this. It does not know your name, and
                neither do we, because we never ask for one. We read it as totals,
                never as individuals.
              </p>
              <div className="mt-4">
                <Out href="https://policies.google.com/privacy">
                  Google Privacy Policy
                </Out>
              </div>
            </article>
          </Reveal>
          <Reveal i={1}>
            <article className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
              <h3 className="font-display text-lg leading-snug">
                Nothing you type is stored
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                The interactive tools on this site, the simulator, the labs, the
                trackers, run entirely in your browser. Anything you type stays on
                your device. It is never uploaded to a server, because there is no
                server collecting it. There are no accounts to create and no forms
                that save what you enter.
              </p>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ COOKIES */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Cookies · Opting out"
              title="You can switch the analytics off"
              lead="The only cookies here are the ones Google Analytics sets. You can refuse them and the site works exactly the same."
            />
          </Reveal>
          <Reveal i={1}>
            <div className="mt-8 max-w-3xl rounded-2xl border border-line bg-paper-2 p-6 text-sm leading-relaxed text-ink-soft">
              <p>
                Two ways to opt out: clear or block cookies in your browser
                settings, or install Google&rsquo;s official opt-out add-on, which
                stops Analytics on every site you visit, not just this one.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
                <Out href="https://tools.google.com/dlpage/gaoptout">
                  Google Analytics Opt-out Add-on
                </Out>
                <Out href="https://policies.google.com/technologies/cookies">
                  How Google uses cookies
                </Out>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------- FACEBOOK */}
      <section className="container-x py-20 lg:py-24">
        <Reveal>
          <SectionHeading
            kicker="Leaving the site"
            title="Facebook is Facebook's rules, not ours"
            lead="We link out to a Facebook Page and Group. The moment you follow one of those links, you're on Facebook's platform and Meta's privacy policy applies, not this one. What you do there is between you and Meta."
          />
        </Reveal>
        <Reveal i={1}>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2">
            <Out href={site.social.facebook}>Our Facebook Page</Out>
            <Out href={site.social.facebookGroup}>Our Facebook Group</Out>
            <Out href="https://www.facebook.com/privacy/policy/">
              Meta Privacy Policy
            </Out>
          </div>
        </Reveal>
      </section>

      {/* ------------------------------------------------------------- RIGHTS */}
      <section className="bg-paper-3/60 py-20 lg:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="Your rights · RA 10173"
              title="The Data Privacy Act, applied honestly"
              lead="The Philippine Data Privacy Act of 2012 gives you real rights over your personal data, the rights to access it, correct it, and object to its use. We take them seriously enough to teach them."
            />
          </Reveal>
          <Reveal i={1}>
            <div className="mt-8 max-w-3xl rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-8 lg:p-10">
              <p className="text-sm leading-relaxed text-ink-soft">
                Here is the honest part: we hold no personal data about you, so
                there is nothing for us to hand over, edit, or delete on request.
                If that ever changes, this page changes first, and your rights
                under RA 10173 still stand. For anything Google or Meta holds
                through their tools, you exercise those rights with them directly.
              </p>
              <div className="mt-5">
                <Out href="https://privacy.gov.ph/data-privacy-act/">
                  Source: RA 10173, National Privacy Commission
                </Out>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------------ CONTACT */}
      <section className="container-x py-20 pb-24 lg:py-24">
        <Reveal>
          <div className="rounded-[var(--radius-lg)] border border-line-strong bg-paper-2 p-8 lg:p-12">
            <Pill tone="emerald">No inbox to email, and that&rsquo;s the point</Pill>
            <h2 className="mt-6 max-w-3xl font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
              Questions about privacy? Message the Page.
            </h2>
            <p className="mt-5 max-w-3xl leading-relaxed text-ink-soft">
              Since the project is anonymous, there is no contact email. The
              Facebook Page is the one channel that reaches us. Ask there and
              we&rsquo;ll answer.
            </p>
            <div className="mt-8">
              <Out href={site.social.facebook}>Message us on Facebook</Out>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
