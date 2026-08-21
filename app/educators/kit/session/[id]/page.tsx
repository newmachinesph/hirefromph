import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KitHeader, KitLicence, KitPage, KitTable } from "@/components/kit";
import { SESSIONS, getSession, type SessionStep } from "@/lib/educators";

/** Only the three authored sessions exist; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SESSIONS.map((session) => ({ id: session.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = getSession(id);
  return { title: session ? `Kit · ${session.title}` : "Kit · Run-sheet" };
}

/** Lower this if a steps sheet overflows; keep KIT_FILES `pages` in step. */
const STEPS_PER_SHEET = 4;

function chunk(steps: SessionStep[], size: number): SessionStep[][] {
  const out: SessionStep[][] = [];
  for (let i = 0; i < steps.length; i += size) out.push(steps.slice(i, i + size));
  return out;
}

export default async function SessionRunSheet({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = getSession(id);
  if (!session) notFound();

  const stepSheets = chunk(session.steps, STEPS_PER_SHEET);
  const total = 2 + stepSheets.length;
  const sub = `${session.method} · ${session.minutes} minutes · ${session.steps.length} timed blocks`;

  return (
    <>
      <KitPage size="a4" n={1} of={total}>
        <KitHeader kicker="Educator kit · Run-sheet" title={session.title} sub={sub} />

        <div className="kit-card kit-card--tint">
          <p className="kit-kicker">What participants leave with</p>
          <ol className="kit-list">
            {session.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ol>
        </div>

        <div className="kit-card">
          <p className="kit-kicker">Room, materials, and what to open</p>
          <ul className="kit-list">
            {session.setup.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </KitPage>

      {stepSheets.map((steps, sheetIndex) => {
        const offset = sheetIndex * STEPS_PER_SHEET;
        return (
          <KitPage key={`steps-${sheetIndex}`} size="a4" n={sheetIndex + 2} of={total}>
            <KitHeader
              kicker={`Educator kit · Timed steps ${sheetIndex + 1} of ${stepSheets.length}`}
              title={session.title}
              sub={sub}
            />
            <KitTable
              widths={[8, 22, 38, 32]}
              head={["Minutes", "Step", "Facilitator", "Participants"]}
              rows={steps.map((step, index) => [
                <span key="m" className="kit-num">
                  {step.minutes}
                </span>,
                <span key="t">
                  <strong>
                    {offset + index + 1}. {step.title}
                  </strong>
                  {step.tool && (
                    <>
                      <br />
                      <a href={step.tool} className="kit-url">
                        hirefrom.ph{step.tool}
                      </a>
                    </>
                  )}
                </span>,
                step.facilitator,
                step.participants,
              ])}
            />
          </KitPage>
        );
      })}

      <KitPage size="a4" n={total} of={total}>
        <KitHeader
          kicker="Educator kit · Prompts and pitfalls"
          title={session.title}
          sub={sub}
        />

        <div className="kit-card">
          <p className="kit-kicker">Discussion prompts</p>
          <ul className="kit-list">
            {session.prompts.map((prompt) => (
              <li key={prompt}>{prompt}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="kit-kicker">Common facilitator mistakes</p>
          <KitTable
            widths={[40, 60]}
            head={["Mistake", "Fix"]}
            rows={session.mistakes.map((mistake) => [mistake.mistake, mistake.fix])}
          />
        </div>

        <KitLicence />
      </KitPage>
    </>
  );
}
