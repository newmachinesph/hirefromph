// Plain Node self-check for the simulator multiplier helpers. No test framework.
// Run:  node lib/simulator-math.test.mjs   (Node >= 22.6 strips the TS types natively)
// calculators.test.mjs covers ease/phaseIn/aiMultiplier/hourlyAt but never touches
// these three single-field multipliers directly, and never exercises the "local"
// client haircut at all. Each helper reads exactly one field, so a minimal config is enough.
import assert from "node:assert/strict";
import {
  ownershipMultiplier,
  languageMultiplier,
  clientsMultiplier,
  aiMultiplier,
  hourlyAt,
  OWNERSHIP_OUTCOMES,
  LANGUAGE_SECOND,
  CLIENTS_LOCAL,
} from "./simulator-math.ts";

let passed = 0;
const approx = (actual, expected, eps = 1e-6) => {
  assert.ok(
    Math.abs(actual - expected) <= eps,
    `expected ~${expected}, got ${actual}`,
  );
  passed++;
};
const eq = (actual, expected) => {
  assert.strictEqual(actual, expected);
  passed++;
};

/* ---------- ownership: outcomes earns the premium, tasks don't ---------- */
eq(ownershipMultiplier({ ownership: "outcomes" }), 1.25);
eq(ownershipMultiplier({ ownership: "tasks" }), 1);

/* ---------- language: a second language is a 20% premium ---------- */
eq(languageMultiplier({ language: "second" }), 1.2);
eq(languageMultiplier({ language: "english" }), 1);

/* ---------- clients: local work takes the 0.45 haircut (untested elsewhere) ---------- */
eq(clientsMultiplier({ clients: "local" }), 0.45);
eq(clientsMultiplier({ clients: "foreign" }), 1);

/* ---------- ai: the middle craft tier's augmented premium ---------- */
eq(aiMultiplier({ ai: "augmented", craft: "building" }), 1.15);

/* ---------- exported constants match the helpers ---------- */
eq(OWNERSHIP_OUTCOMES, 1.25);
eq(LANGUAGE_SECOND, 1.2);
eq(CLIENTS_LOCAL, 0.45);

/* ---------- the local haircut actually flows through hourlyAt ---------- */
// A generalist at month 0 sits at the $3 floor; choosing local clients scales it by 0.45.
const localGeneralist = {
  craft: "none",
  ai: "none",
  ownership: "tasks",
  hours: 20,
  language: "english",
  clients: "local",
};
approx(hourlyAt(localGeneralist, 0), 1.35); // 3 * 0.45

console.log(`ok - ${passed} assertions passed`);
