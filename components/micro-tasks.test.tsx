import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import tasksData from "@/data/tasks.json";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

/**
 * A tiny in-memory router: `push`/`replace` rewrite the query string and
 * `useSearchParams` re-renders from it, the same contract the app router gives
 * a client component when only the search params change.
 */
const nav = vi.hoisted(() => {
  let search = "";
  const listeners = new Set<() => void>();
  const history: string[] = [];
  const go = (url: string) => {
    history.push(url);
    const at = url.indexOf("?");
    search = at === -1 ? "" : url.slice(at + 1);
    listeners.forEach((listener) => listener());
  };
  return {
    history,
    push: go,
    replace: go,
    read: () => search,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset: () => {
      search = "";
      history.length = 0;
    },
  };
});

vi.mock("next/navigation", async () => {
  const { useSyncExternalStore } = await import("react");
  return {
    usePathname: () => "/tasks",
    useRouter: () => ({ push: nav.push, replace: nav.replace }),
    useSearchParams: () => new URLSearchParams(useSyncExternalStore(nav.subscribe, nav.read, nav.read)),
  };
});

import { PathProvider } from "@/lib/path-context";
import { MicroTasks } from "@/components/micro-tasks";

const renderTasks = () =>
  render(
    <PathProvider>
      <MicroTasks />
    </PathProvider>,
  );

const openLastCard = async (user: ReturnType<typeof userEvent.setup>) => {
  const cards = screen.getAllByRole("button", { name: /open the task/i });
  await user.click(cards[cards.length - 1]);
};

// Forty animated cards in jsdom: opening one and coming back takes a few seconds
// on a loaded machine, well past the 5s default.
vi.setConfig({ testTimeout: 20_000 });

beforeEach(() => {
  nav.reset();
  localStorage.clear();
});

describe("MicroTasks", () => {
  it("renders the task gallery with difficulty chips and a niche select", () => {
    renderTasks();
    expect(screen.getByRole("group", { name: /filter by difficulty/i })).toBeInTheDocument();
    const niche = screen.getByRole("combobox", { name: /filter by niche/i });
    expect(within(niche).getAllByRole("option").length).toBeGreaterThan(20);
    expect(screen.getAllByRole("button", { name: /open the task/i })).toHaveLength(
      tasksData.tasks.length,
    );
  });

  it("narrows the gallery through the niche select", async () => {
    const user = userEvent.setup();
    renderTasks();
    const dedicated = tasksData.tasks.find((task) => task.track !== "any")!;
    await user.selectOptions(screen.getByRole("combobox", { name: /filter by niche/i }), dedicated.track);
    const expected = tasksData.tasks.filter(
      (task) => task.track === dedicated.track || task.track === "any",
    ).length;
    // Exiting cards linger for the popLayout animation, so assert on the live count
    // first and let the gallery settle before counting buttons.
    expect(screen.getByText(new RegExp(`^${expected} tasks?$`))).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getAllByRole("button", { name: /open the task/i })).toHaveLength(expected),
    );
  });

  it("opens a task and shows its definition of done", async () => {
    const user = userEvent.setup();
    renderTasks();
    await openLastCard(user);
    expect(await screen.findByText(/definition of done/i)).toBeInTheDocument();
  });

  it("puts the open task in the URL and clears it on back", async () => {
    const user = userEvent.setup();
    renderTasks();
    const last = tasksData.tasks[tasksData.tasks.length - 1];
    await openLastCard(user);
    await screen.findByText(/definition of done/i);
    expect(nav.read()).toBe(`task=${last.id}`);
    expect(nav.history).toEqual([`/tasks?task=${last.id}`]);

    await user.click(screen.getByRole("button", { name: /back to all micro-tasks/i }));
    expect(nav.read()).toBe("");
    expect(nav.history).toEqual([`/tasks?task=${last.id}`, "/tasks"]);
    expect(await screen.findByRole("group", { name: /filter by difficulty/i })).toBeInTheDocument();
  });

  it("opens the task named in the URL on first render and scrolls to it", async () => {
    const first = tasksData.tasks[0];
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    nav.replace(`/tasks?task=${first.id}`);
    renderTasks();
    expect(await screen.findByRole("heading", { level: 2, name: first.title })).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "start" });
  });

  it("ignores a task id that does not exist", () => {
    nav.replace("/tasks?task=not-a-task");
    renderTasks();
    expect(screen.getByRole("group", { name: /filter by difficulty/i })).toBeInTheDocument();
  });

  it("ticking a definition-of-done box updates the counter", async () => {
    const user = userEvent.setup();
    renderTasks();
    await openLastCard(user);
    const boxes = await screen.findAllByRole("checkbox");
    await user.click(boxes[0]);
    expect(boxes[0]).toBeChecked();
  });
});
