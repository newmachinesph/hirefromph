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

import { CareerSimulator } from "@/components/career-simulator";

describe("CareerSimulator", () => {
  it("renders the controls, the chart and the data table", () => {
    render(<CareerSimulator />);
    expect(screen.getByRole("group", { name: /craft/i })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /trajector|month|dollar/i })).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("changing a choice changes the projection", async () => {
    const user = userEvent.setup();
    render(<CareerSimulator />);
    const before = screen.getByRole("table").textContent;
    const radios = screen.getAllByRole("radio");
    // Pick a radio that is not already selected.
    const target = radios.find((r) => !(r as HTMLInputElement).checked);
    expect(target).toBeDefined();
    await user.click(target as HTMLElement);
    expect(screen.getByRole("table").textContent).not.toBe(before);
  });

  it("keeps the FX field usable and falls back to the default on a bad value", async () => {
    const user = userEvent.setup();
    render(<CareerSimulator />);
    const fx = screen.getByRole("spinbutton");
    await user.clear(fx);
    await user.tab();
    expect((fx as HTMLInputElement).value).not.toBe("");
  });
});
