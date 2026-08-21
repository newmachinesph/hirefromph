import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
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
});
