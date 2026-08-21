import practiceData from "@/data/practice.json";
import { QuizRunner, type QuizQuestion } from "./quiz-runner";

const ROUTES = practiceData.routes as Record<string, { questions: QuizQuestion[] } | undefined>;

/** The three questions authored for a route. `[]` for anything unknown. */
export function getQuestions(route: string): QuizQuestion[] {
  return ROUTES[route]?.questions ?? [];
}

/**
 * Server half of the quiz. `data/practice.json` is 54 KB; reading it here and
 * handing the runner only this route's three questions keeps the other 52 KB
 * off the client.
 */
export function Quiz({ route }: { route: string }) {
  const questions = getQuestions(route);
  if (questions.length === 0) return null;
  return <QuizRunner route={route} questions={questions} />;
}
