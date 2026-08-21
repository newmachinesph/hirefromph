import type { Metadata } from "next";
import { KitHeader, KitLicence, KitPage } from "@/components/kit";
import doctrine from "@/data/doctrine.json";
import site from "@/data/site.json";

export const metadata: Metadata = { title: "Kit · The doctrine, one page" };

export default function DoctrineOnePagerSheet() {
  const standard = site.standard;

  return (
    <KitPage size="a4" n={1} of={1}>
      <KitHeader kicker="Educator kit · One-pager" title={standard.title} sub={standard.kicker} />

      <p className="kit-lead">{standard.body}</p>

      <div className="kit-grid kit-grid--3">
        {standard.principles.map((principle) => (
          <div key={principle.title} className="kit-card">
            <h2 className="kit-h3">{principle.title}</h2>
            <p className="kit-small">{principle.desc}</p>
          </div>
        ))}
      </div>

      <div className="kit-card kit-card--tint">
        <p className="kit-kicker">The creed</p>
        <p className="kit-h2">{doctrine.creed}</p>
      </div>

      <div className="kit-grid kit-grid--2">
        {doctrine.principles.map((principle) => (
          <div key={principle.n} className="kit-card">
            <p className="kit-kicker kit-num">{String(principle.n).padStart(2, "0")}</p>
            <h3 className="kit-h3">{principle.title}</h3>
            <p className="kit-small">{principle.desc}</p>
          </div>
        ))}
      </div>

      <div className="kit-card">
        <p className="kit-kicker">Why it matters</p>
        <p className="kit-small">{doctrine.whyItMatters}</p>
      </div>

      <KitLicence compact />
    </KitPage>
  );
}
