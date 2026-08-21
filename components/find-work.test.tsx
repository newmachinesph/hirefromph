import { beforeEach, describe, expect, it, vi } from "vitest";
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
import { FindWorkDirectory, VettingTool } from "@/components/find-work";

describe("VettingTool", () => {
  it("starts clear and turns to a hard stop on an instant-stop flag", async () => {
    const user = userEvent.setup();
    render(<VettingTool />);
    expect(screen.getByText(/no red flags checked/i)).toBeInTheDocument();
    const instantStop = screen.getAllByRole("checkbox")[0];
    await user.click(instantStop);
    expect(await screen.findByText(/stop\. walk away\./i)).toBeInTheDocument();
  });
});

describe("FindWorkDirectory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("filters the directory by query", async () => {
    const user = userEvent.setup();
    render(
      <PathProvider>
        <FindWorkDirectory />
      </PathProvider>,
    );
    await user.type(screen.getByLabelText(/search the directory/i), "zzzznotathing");
    expect(await screen.findByText(/no matches/i)).toBeInTheDocument();
  });

  it("with a chosen path, counts and sorts the places tagged for that niche first", async () => {
    localStorage.setItem("hfph.path.v1", JSON.stringify({ track: "bookkeeping" }));
    render(
      <PathProvider>
        <FindWorkDirectory />
      </PathProvider>,
    );
    expect(await screen.findByText(/tagged for/i)).toHaveTextContent(
      /23 places, 2 tagged for Bookkeeping & Accounting, shown first/,
    );
    const fits = screen.getAllByText(/fits your niche/i);
    expect(fits).toHaveLength(2);
    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(headings.slice(0, 2).sort()).toEqual(["BELAY", "Toptal"]);
    // The gate copy now says what it does, not "matched to your niche".
    expect(screen.queryByText(/matched to your niche/i)).not.toBeInTheDocument();
  });

  it("with a chosen path, the niche switch hides places that do not fit", async () => {
    const user = userEvent.setup();
    localStorage.setItem("hfph.path.v1", JSON.stringify({ track: "bookkeeping" }));
    render(
      <PathProvider>
        <FindWorkDirectory />
      </PathProvider>,
    );
    await user.click(await screen.findByLabelText(/hide places that don.t fit my niche/i));
    await waitFor(
      () => expect(screen.queryByText("Concentrix")).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
    expect(screen.getByText("OnlineJobs.ph")).toBeInTheDocument();
  });
});
