import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { PathProvider } from "@/lib/path-context";
import { PlanHoursBadge, PlanWizard } from "@/components/plan-wizard";
import tracks from "@/data/tracks.json";

const SAVED_ANSWERS = {
  experience: "zero",
  track: "executive-ops",
  hours: "1-2",
  equipment: "partial",
  language: "no",
};

function seedSavedPlan() {
  localStorage.setItem(
    "hfph.path.v1",
    JSON.stringify({ track: "executive-ops", planAnswers: SAVED_ANSWERS }),
  );
}

describe("PlanWizard", () => {
  afterEach(() => localStorage.clear());

  it("renders the first question as a choice set", async () => {
    render(
      <PathProvider>
        <PlanWizard />
      </PathProvider>,
    );
    expect((await screen.findAllByRole("radio")).length).toBeGreaterThan(1);
  });

  it("answering the first question moves to the next", async () => {
    const user = userEvent.setup();
    render(
      <PathProvider>
        <PlanWizard />
      </PathProvider>,
    );
    const first = (await screen.findAllByRole("radio"))[0];
    const heading = screen.getAllByRole("heading")[0].textContent;
    await user.click(first);
    await waitFor(() =>
      expect(screen.getAllByRole("heading")[0].textContent).not.toBe(heading),
    );
  });

  it("lists every niche on the track step as a radio", async () => {
    const user = userEvent.setup();
    render(
      <PathProvider>
        <PlanWizard />
      </PathProvider>,
    );
    await user.click((await screen.findAllByRole("radio"))[0]);
    // The step advances after a 260ms auto-advance timer plus the exit animation.
    await waitFor(
      () => expect(screen.getAllByRole("radio")).toHaveLength(tracks.tracks.length),
      { timeout: 5000 },
    );
  });

  it("fills the saved track, hours, equipment and language into the days", async () => {
    seedSavedPlan();
    render(
      <PathProvider>
        <PlanWizard />
      </PathProvider>,
    );
    // Track name lands in the niche days (day 6), and the track's #1 tool in day 11.
    expect(
      await screen.findByText(/complete one small Executive Operations micro-task/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Learn Google Workspace to a working level/)).toBeInTheDocument();
    // Hours answer changes the pace note.
    expect(screen.getByText(/At 1–2 hours a day/)).toBeInTheDocument();
    // Equipment "partial" and language "no" swap in their day wording.
    expect(screen.getByText(/one or two things still missing/)).toBeInTheDocument();
    expect(screen.getByText(/Revisit the language question then/)).toBeInTheDocument();
    // The day that used to link the wrong tool now links the tracker.
    expect(screen.getAllByRole("link", { name: /Application Tracker/ }).length).toBeGreaterThan(0);
  });

  it("shows the chosen hours in the hero badge once a plan is saved", async () => {
    seedSavedPlan();
    render(
      <PathProvider>
        <PlanHoursBadge />
      </PathProvider>,
    );
    expect(await screen.findByText(/1–2 hours daily/)).toBeInTheDocument();
  });
});
