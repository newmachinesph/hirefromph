"use client";

import { useMemo, useState } from "react";
import { TERMS, filterTerms, groupByLetter } from "@/lib/glossary";
import { CardGrid } from "@/components/layout";
import { Button, Card, Field, Heading, Icon, Input, Text } from "@/components/ui";

/**
 * `/glossary` (spec §7.4.6): every term this site uses, A to Z, with the guide
 * that explains it. The filter matches the term and the definition, so
 * searching "revisions" finds "Scope" even though the word is not in the name.
 */
export function GlossaryBrowser() {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => groupByLetter(filterTerms(TERMS, query)), [query]);
  const count = useMemo(() => groups.reduce((total, group) => total + group.terms.length, 0), [groups]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <Field label="Filter the glossary" hint="Matches the term and the definition.">
          <Input
            type="search"
            value={query}
            placeholder="retainer, 2307, scope creep…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </Field>
        <Text size="small" aria-live="polite">
          {count} {count === 1 ? "term" : "terms"}
          {query.trim() ? ` matching “${query.trim()}”` : ""}.
        </Text>
      </div>

      {count === 0 && (
        <Text>
          Nothing matches that. Try a shorter word, or browse the whole list by clearing the filter.
        </Text>
      )}

      {groups.map((group) => (
        <section key={group.letter} className="flex flex-col gap-4">
          <Heading level={2} size="h3" id={`letter-${group.letter}`}>
            {group.letter}
          </Heading>
          <CardGrid cols={2} as="ul">
            {group.terms.map((term) => (
              <Card key={term.id} as="li" padding="md">
                <div className="flex flex-col gap-2">
                  <Heading level={3} size="h5">
                    {term.term}
                  </Heading>
                  <Text size="small">{term.definition}</Text>
                  {term.taglish && (
                    <Text size="caption" tone="faint">
                      {term.taglish}
                    </Text>
                  )}
                  {term.href && (
                    <div className="pt-1">
                      <Button
                        href={term.href}
                        variant="link"
                        iconEnd={<Icon name="arrow-up-right" size={14} />}
                      >
                        Where this is explained
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </CardGrid>
        </section>
      ))}
    </div>
  );
}
