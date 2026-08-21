import { Section } from "@/components/layout";
import { Quiz, getQuestions } from "./quiz";

/**
 * The block every guide and stage page renders directly above
 * `PageFooterNav` (spec §5.2b). One line per page, nothing to configure.
 */
export function PracticeFooter({ route }: { route: string }) {
  if (getQuestions(route).length === 0) return null;
  return (
    <Section band="tint" size="narrow">
      <Quiz route={route} />
    </Section>
  );
}
