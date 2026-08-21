import type { Metadata } from "next";
import { KitHeader, KitLicence, KitPage } from "@/components/kit";
import { JourneyMap } from "@/components/diagrams";
import roadmap from "@/data/roadmap.json";
import stages from "@/data/stages.json";

export const metadata: Metadata = { title: "Kit · The path, mapped" };

export default function PathMapSheet() {
  return (
    <KitPage size="a4-landscape" n={1} of={1}>
      <KitHeader
        kicker="Educator kit · The path"
        title="Five stages, eleven steps"
        sub={roadmap.intro}
      />

      <div className="kit-map">
        <JourneyMap />
      </div>

      <div className="kit-grid kit-grid--5">
        {stages.map((stage) => (
          <div key={stage.id} className="kit-card">
            <p className="kit-kicker kit-num">{stage.kicker}</p>
            <h2 className="kit-h3">{stage.title}</h2>
            <p className="kit-note">
              {stage.role} · {stage.steps}
            </p>
            <p className="kit-small">{stage.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="kit-grid kit-grid--3">
        {roadmap.steps.map((step) => (
          <p key={step.n} className="kit-small">
            <span className="kit-num kit-kicker">{String(step.n).padStart(2, "0")}</span>{" "}
            <strong>{step.title}</strong> — {step.desc}
          </p>
        ))}
      </div>

      <KitLicence compact />
    </KitPage>
  );
}
