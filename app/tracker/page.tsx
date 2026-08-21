import type { Metadata } from "next";
import { ApplicationTracker } from "@/components/application-tracker";
import { CopyButton } from "@/components/copy-button";
import {
  CardGrid,
  PageFooterNav,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/layout";
import { Button, Callout, Card, Heading, Text } from "@/components/ui";
import { findNavNeighbours, getBreadcrumb } from "@/lib/nav";
import { pageMeta } from "@/lib/meta";

const HREF = "/tracker";

export const metadata: Metadata = pageMeta({
  path: HREF,
  title: "Application Tracker",
  description:
    "Log every application, get nudged the moment a follow-up is overdue, and see your real reply and interview rates.",
});

const SCHEMA = [
  {
    part: "Company + Role",
    why: "Your unique row. Two applications to the same company for different roles are two different rows, never merge them.",
  },
  {
    part: "Status (fixed list)",
    why: 'Applied, Replied, Interview, Offer, Rejected, always picked from a dropdown, never typed free-hand. Free text drifts into ten spellings of "in progress" within a week.',
  },
  {
    part: "Applied on",
    why: "The date you sent it. On its own this is just a log, history, not a tool.",
  },
  {
    part: "Follow up on",
    why: "The one column that turns the log into a tool. It's what the radar panel above checks every time you open this page.",
  },
  {
    part: "Source",
    why: "Where you found it, LinkedIn, referral, direct. Once your pipeline gets long, this is what you'll filter by to see what's working.",
  },
  {
    part: "Notes",
    why: "Short and free text on purpose, the contact name, the referral, the one detail you'd forget by next week.",
  },
];

const FORMULAS = [
  {
    label: "Days overdue (Follow-up in column G)",
    formula: '=IF(G2="","",G2-TODAY())',
    note: "0 means due today, a negative number means overdue by that many days.",
  },
  {
    label: 'Count how many are at "Interview" (Status in column E)',
    formula: '=COUNTIF(E:E,"Interview")',
    note: "Swap the status string to count any stage.",
  },
  {
    label: "Reply rate",
    formula:
      '=(COUNTIF(E:E,"Replied")+COUNTIF(E:E,"Interview")+COUNTIF(E:E,"Offer"))/COUNTA(E2:E1000)',
    note: "Format the cell as a percentage.",
  },
];

export default function TrackerPage() {
  return (
    <>
      <PageHero
        compact
        breadcrumb={getBreadcrumb(HREF)}
        kicker="Get Hired · Your pipeline"
        title="Every application gets a row."
        accent="Every follow-up gets a date."
        lead="The #1 reason people lose an offer isn’t a bad resume, it’s silence after “applied”. This tracker runs your job hunt like an operation: log everything, get nudged the moment a follow-up is due, and see honestly whether the problem is your volume or your application."
      >
        <Callout icon="key-round" title="A quick reconciliation." className="max-w-3xl">
          <Text size="small">
            Everywhere else on Hire From PH we refuse to hand you a finished file, we teach you to
            build your own. This page is the one exception, on purpose: your job hunt is a tool for{" "}
            <em>your</em> life, not a deliverable you’d hand a client, and you need it running
            today, not after a lesson. So you get both, a working tracker right here, and below,
            exactly how it’s built, so you can rebuild it in Google Sheets and build the same kind
            of tracker for any client. That’s also the{" "}
            <strong className="font-semibold text-ink">Build Your Own Tracker</strong> lab at{" "}
            <Button href="/build" variant="link">
              /build
            </Button>
            .
          </Text>
        </Callout>
      </PageHero>

      <Section spacing="none" className="pb-20 lg:pb-28">
        <Card padding="lg">
          <ApplicationTracker />
        </Card>
      </Section>

      <Section band="tint">
        <SectionHeading
          kicker="How this is built"
          title="The schema behind this tracker, and why each column exists"
          lead="Every working tracker, applications, invoices, content calendars, is the same underlying pattern. Study this one, then rebuild it for anything."
        />

        <CardGrid cols={3} className="mt-12">
          {SCHEMA.map((s) => (
            <Card key={s.part} onBand>
              <Heading level={3} size="h5">
                {s.part}
              </Heading>
              <Text size="small" className="mt-2 flex-1">
                {s.why}
              </Text>
            </Card>
          ))}
        </CardGrid>

        <div className="mt-14">
          <SectionHeading
            kicker="Rebuild it in Sheets"
            title="The three formulas that make it self-monitoring"
            lead="Row 1 is your headers, row 2 is your first entry. Adjust column letters if you order yours differently."
          />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {FORMULAS.map((f) => (
            <Card key={f.formula} onBand>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <Text size="small" tone="ink" className="font-semibold">
                    {f.label}
                  </Text>
                  <code className="mt-1.5 block overflow-x-auto whitespace-pre rounded-sm border border-line-strong bg-band px-3 py-2 text-caption text-ink-soft">
                    {f.formula}
                  </code>
                  <Text size="caption" tone="faint" className="mt-1.5">
                    {f.note}
                  </Text>
                </div>
                <CopyButton value={f.formula} label="Copy formula" />
              </div>
            </Card>
          ))}
        </div>

        <Card padding="md" className="mt-10" onBand>
          <Text size="small">
            Add Data → Data Validation on the Status column with a fixed list, add a conditional
            formatting rule to color any row where the days-overdue formula goes negative, and set
            a recurring reminder to review it, a tracker nobody reviews is worse than no tracker,
            because it creates false confidence.
          </Text>
          <Text size="lead" tone="ink" className="mt-4 font-display" balance>
            Now go rebuild this yourself, that’s the lab at{" "}
            <Button href="/build" variant="link">
              /build
            </Button>
            .
          </Text>
          <div className="mt-5">
            <Button href="/build">Go to Build Labs</Button>
          </div>
        </Card>
      </Section>

      <Section>
        <PageFooterNav {...findNavNeighbours(HREF)} />
      </Section>
    </>
  );
}
