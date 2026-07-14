import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ApplicationTracker } from "@/components/application-tracker";
import { CopyButton } from "@/components/copy-button";
import { ButtonLink, Kicker, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Application Tracker",
  description:
    "Log every application, get nudged the moment a follow-up is overdue, and see your real reply and interview rates.",
};

const schema = [
  {
    part: "Company + Role",
    why: "Your unique row. Two applications to the same company for different roles are two different rows, never merge them.",
  },
  {
    part: "Status (fixed list)",
    why: "Applied, Replied, Interview, Offer, Rejected, always picked from a dropdown, never typed free-hand. Free text drifts into ten spellings of \"in progress\" within a week.",
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
    why: "Where you found it, LinkedIn, referral, direct. Once your pipeline gets long, this is what you'll filter by to see what's actually working.",
  },
  {
    part: "Notes",
    why: "Short and free text on purpose, the contact name, the referral, the one detail you'd forget by next week.",
  },
];

const formulas = [
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
      {/* HERO */}
      <section className="container-x pt-14 pb-10 lg:pt-20">
        <Reveal>
          <Kicker>Get Hired · Your pipeline</Kicker>
        </Reveal>
        <Reveal i={1}>
          <h1 className="mt-5 max-w-3xl font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance">
            Every application gets a row.{" "}
            <span className="text-coral">Every follow-up gets a date.</span>
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="mt-5 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            The #1 reason people lose an offer isn&rsquo;t a bad resume, it&rsquo;s silence after &ldquo;applied&rdquo;. This tracker runs
            your job hunt like an operation: log everything, get nudged the
            moment a follow-up is due, and see honestly whether the problem is
            your volume or your application.
          </p>
        </Reveal>

        <Reveal i={3}>
          <div className="mt-7 flex items-start gap-4 rounded-2xl border border-line bg-paper-2 px-6 py-5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-paper-2">
              <KeyRound size={18} aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                A quick reconciliation.
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                Everywhere else on DevUp we refuse to hand you a finished
                file, we teach you to build your own. This page is the one
                exception, on purpose: your job hunt is a tool for{" "}
                <em>your</em> life, not a deliverable you&rsquo;d hand a
                client, and you need it running today, not after a lesson. So
                you get both, a working tracker right here, and below,
                exactly how it&rsquo;s built, so you can rebuild it in Google
                Sheets and build the same kind of tracker for any client.
                That&rsquo;s also the{" "}
                <strong className="font-semibold text-ink">
                  Build Your Own Tracker
                </strong>{" "}
                lab at{" "}
                <Link
                  href="/build"
                  className="font-semibold text-ink link-sweep"
                >
                  /build
                </Link>
                .
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* THE TOOL */}
      <section className="container-x pb-20 lg:pb-28">
        <ApplicationTracker />
      </section>

      {/* HOW THIS IS BUILT */}
      <section className="bg-paper-3/60 py-20 lg:py-28">
        <div className="container-x">
          <Reveal>
            <SectionHeading
              kicker="How this is built"
              title="The schema behind this tracker, and why each column exists"
              lead="Every working tracker, applications, invoices, content calendars, is the same underlying pattern. Study this one, then rebuild it for anything."
            />
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schema.map((s, idx) => (
              <Reveal key={s.part} i={idx % 3}>
                <div className="flex h-full flex-col rounded-2xl border border-line bg-paper-2 p-6">
                  <p className="font-display text-lg leading-tight">{s.part}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                    {s.why}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal i={1} className="mt-14">
            <SectionHeading
              kicker="Rebuild it in Sheets"
              title="The three formulas that make it self-monitoring"
              lead="Row 1 is your headers, row 2 is your first entry. Adjust column letters if you order yours differently."
            />
          </Reveal>

          <div className="mt-8 flex flex-col gap-3">
            {formulas.map((f, idx) => (
              <Reveal key={f.formula} i={idx}>
                <div className="flex flex-col gap-3 rounded-2xl border border-line bg-paper-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{f.label}</p>
                    <code className="mt-1.5 block overflow-x-auto whitespace-pre rounded-lg border border-line-strong bg-paper-3 px-3 py-2 font-mono text-xs text-ink-soft">
                      {f.formula}
                    </code>
                    <p className="mt-1.5 text-xs text-ink-faint">{f.note}</p>
                  </div>
                  <CopyButton value={f.formula} label="Copy formula" />
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal i={1} className="mt-10 rounded-2xl border border-line-strong bg-paper p-6">
            <p className="text-sm leading-relaxed text-ink-soft">
              Add Data → Data Validation on the Status column with a fixed
              list, add a conditional formatting rule to color any row where
              the days-overdue formula goes negative, and set a recurring
              reminder to review it, a tracker nobody reviews is worse than
              no tracker, because it creates false confidence.
            </p>
            <p className="mt-4 font-display text-lg leading-snug text-ink text-balance">
              Now go rebuild this yourself, that&rsquo;s the lab at{" "}
              <Link href="/build" className="text-coral link-sweep">
                /build
              </Link>
              .
            </p>
            <div className="mt-5">
              <ButtonLink href="/build">Go to Build Labs</ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
