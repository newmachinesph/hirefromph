/**
 * The glossary (spec §7.4.6). Read by the inline `Term` component and by the
 * `/glossary` route. Fifty terms, each with a plain definition, an optional
 * Taglish gloss, and a link to the guide that teaches it.
 */

import glossaryData from "@/data/glossary.json";

export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  /** A one-line Tagalog gloss where one helps. Twelve terms carry it. */
  taglish?: string;
  href?: string;
};

export const TERMS = glossaryData.terms as GlossaryTerm[];
export const GLOSSARY_LAST_VERIFIED = glossaryData.lastVerified;

export function getTerm(id: string): GlossaryTerm | undefined {
  return TERMS.find((term) => term.id === id);
}

function letterOf(term: GlossaryTerm): string {
  const first = term.term.trim().charAt(0).toUpperCase();
  return /[A-Z]/.test(first) ? first : "#";
}

export function groupByLetter(
  terms: readonly GlossaryTerm[],
): { letter: string; terms: GlossaryTerm[] }[] {
  const buckets = new Map<string, GlossaryTerm[]>();
  for (const term of terms) {
    const letter = letterOf(term);
    const bucket = buckets.get(letter);
    if (bucket) bucket.push(term);
    else buckets.set(letter, [term]);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([letter, group]) => ({
      letter,
      terms: [...group].sort((a, b) =>
        a.term.localeCompare(b.term, "en", { sensitivity: "base" }),
      ),
    }));
}

export function filterTerms(terms: readonly GlossaryTerm[], query: string): GlossaryTerm[] {
  const needle = query.trim().toLowerCase();
  if (needle === "") return [...terms];
  return terms.filter(
    (term) =>
      term.term.toLowerCase().includes(needle) ||
      term.definition.toLowerCase().includes(needle),
  );
}
