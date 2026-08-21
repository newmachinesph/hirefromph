import { PageFooterNav, PageHero, Section, SectionHeading } from "@/components/layout";
import { Badge, Button, Callout, Card, Heading, Icon, Text } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/privacy";

export const metadata = pageMeta({
  path: HREF,
  title: "Privacy",
  description:
    "How Hire From PH handles data, in plain English: an anonymous, non-commercial project with no accounts and nothing to sell. Google Analytics only, no forms stored, and your rights under RA 10173.",
});

function Out({ href, children }: { href: string; children: string }) {
  return (
    <Button
      href={href}
      external
      variant="link"
      iconEnd={<Icon name="arrow-up-right" size={14} />}
    >
      {children}
    </Button>
  );
}

export default function PrivacyPage() {
  return (
    <>
      {/* --------------------------------------------------------------- HERO */}
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Privacy · Plain English"
        title={
          <>
            We can&rsquo;t leak what
            <br />
          </>
        }
        accent="we never collect."
        lead={
          <>
            Hire From PH has no accounts, no login, no shopping cart, and no sales team.
            There is no database of you here to protect, because we never build
            one. This page says exactly what happens when you visit, in words you
            can actually check.
          </>
        }
      >
        <Callout tone="signal" className="max-w-2xl">
          The only data we&rsquo;re comfortable holding is none of yours.
        </Callout>
      </PageHero>

      {/* ---------------------------------------------------------------- WHO */}
      <Section band="tint">
        <SectionHeading
          kicker="Who runs this"
          title="An anonymous, non-commercial project"
          lead="Hire From PH is an independent project built for Filipino online professionals. No company name, no registered business, no names attached. It is free, permanently, and it sells nothing, so there is no commercial reason to profile you."
        />
      </Section>

      {/* ------------------------------------------------------------ COLLECT */}
      <Section>
        <SectionHeading
          kicker="What we collect"
          title="Aggregate analytics, and nothing else"
          lead="One tool, used honestly: Google Analytics, so we know which pages help and which ones don't."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Card as="article" className="h-full">
            <Heading level={3} size="h4">
              Google Analytics
            </Heading>
            <Text size="small" className="mt-3 flex-1">
              It records anonymous, aggregate patterns: which pages get viewed,
              rough device type, and general region (usually just the country).
              It sets cookies to do this. It does not know your name, and
              neither do we, because we never ask for one. We read it as totals,
              never as individuals.
            </Text>
            <div className="mt-4">
              <Out href="https://policies.google.com/privacy">
                Google Privacy Policy
              </Out>
            </div>
          </Card>
          <Card as="article" className="h-full">
            <Heading level={3} size="h4">
              Nothing you type is stored
            </Heading>
            <Text size="small" className="mt-3 flex-1">
              The interactive tools on this site, the simulator, the labs, the
              trackers, run entirely in your browser. Anything you type stays on
              your device. It is never uploaded to a server, because there is no
              server collecting it. There are no accounts to create and no forms
              that save what you enter.
            </Text>
          </Card>
        </div>
      </Section>

      {/* ------------------------------------------------------------ COOKIES */}
      <Section band="tint">
        <SectionHeading
          kicker="Cookies · Opting out"
          title="You can switch the analytics off"
          lead="The only cookies here are the ones Google Analytics sets. You can refuse them and the site works exactly the same."
        />
        <Card className="mt-8 max-w-3xl">
          <Text size="small">
            Two ways to opt out: clear or block cookies in your browser
            settings, or install Google&rsquo;s official opt-out add-on, which
            stops Analytics on every site you visit, not just this one.
          </Text>
          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
            <Out href="https://tools.google.com/dlpage/gaoptout">
              Google Analytics Opt-out Add-on
            </Out>
            <Out href="https://policies.google.com/technologies/cookies">
              How Google uses cookies
            </Out>
          </div>
        </Card>
      </Section>

      {/* ------------------------------------------------------------- RIGHTS */}
      <Section band="tint">
        <SectionHeading
          kicker="Your rights · RA 10173"
          title="The Data Privacy Act, applied honestly"
          lead="The Philippine Data Privacy Act of 2012 gives you real rights over your personal data, the rights to access it, correct it, and object to its use. We take them seriously enough to teach them."
        />
        <Card padding="lg" className="mt-8 max-w-3xl" onBand>
          <Text size="small">
            Here is the honest part: we hold no personal data about you, so
            there is nothing for us to hand over, edit, or delete on request.
            If that ever changes, this page changes first, and your rights
            under RA 10173 still stand. For anything Google or Meta holds
            through their tools, you exercise those rights with them directly.
          </Text>
          <div className="mt-5">
            <Out href="https://privacy.gov.ph/data-privacy-act/">
              Source: RA 10173, National Privacy Commission
            </Out>
          </div>
        </Card>
      </Section>

      {/* ------------------------------------------------------------ CONTACT */}
      <Section>
        <Card padding="lg" onBand>
          <Badge tone="verified">No inbox to email, and that&rsquo;s the point</Badge>
          <Heading level={2} size="h2" className="mt-6 max-w-3xl" balance>
            There is no contact channel right now.
          </Heading>
          <Text className="mt-5 max-w-3xl">
            The Facebook Page this site used to point at belonged to its
            previous name, and we would rather say so than leave you
            messaging somewhere nobody reads. When a channel exists, it will
            be published here.
          </Text>
        </Card>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
