import type { Metadata } from "next";
import { KitHeader, KitLicence, KitPage } from "@/components/kit";
import doctrine from "@/data/doctrine.json";

export const metadata: Metadata = { title: "Kit · Seven methods" };

/** Lower this if a sheet overflows; keep KIT_FILES `pages` in step. */
const METHODS_PER_SHEET = 3;

export default function MethodsSheet() {
  const sheets: (typeof doctrine.methods)[] = [];
  for (let i = 0; i < doctrine.methods.length; i += METHODS_PER_SHEET) {
    sheets.push(doctrine.methods.slice(i, i + METHODS_PER_SHEET));
  }

  return (
    <>
      {sheets.map((methods, sheetIndex) => (
        <KitPage key={`sheet-${sheetIndex}`} size="a4" n={sheetIndex + 1} of={sheets.length}>
          <KitHeader
            kicker="Educator kit · Cheat-sheet"
            title="Seven methods"
            sub={sheetIndex === 0 ? doctrine.title : "Continued"}
          />

          {methods.map((method, index) => (
            <div key={method.id} className="kit-method">
              <div>
                <p className="kit-kicker kit-num">
                  Method {String(sheetIndex * METHODS_PER_SHEET + index + 1).padStart(2, "0")}
                </p>
                <h2 className="kit-h2">{method.name}</h2>
                <p className="kit-note">{method.tagline}</p>
                <p className="kit-small">{method.summary}</p>
              </div>
              <div>
                <ol className="kit-steps">
                  {method.steps.map((step) => (
                    <li key={step.title}>
                      <strong>{step.title}.</strong> {step.desc}
                    </li>
                  ))}
                </ol>
                <p className="kit-drill">
                  <span className="kit-kicker">Drill</span> {method.drill}
                </p>
              </div>
            </div>
          ))}

          {sheetIndex === sheets.length - 1 && <KitLicence />}
        </KitPage>
      ))}
    </>
  );
}
