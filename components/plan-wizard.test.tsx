import { describe, expect, it, vi } from "vitest";
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
import { PlanWizard } from "@/components/plan-wizard";

describe("PlanWizard", () => {
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
});
