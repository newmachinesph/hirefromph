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
import { DEFAULT_FX, DEFAULT_FX_SAMPLED } from "@/lib/simulator-math";

describe("CareerSimulator", () => {
  it("quotes the FX default and its sample date from the math module", () => {
    render(<CareerSimulator />);
    const note = screen.getByText(/We default to/);
    expect(note.textContent).toContain(`₱${DEFAULT_FX}`);
    expect(note.textContent).toContain(DEFAULT_FX_SAMPLED);
    expect(note.textContent).not.toMatch(/\{fx\}|\{sampled\}/);
  });

  it("tags only the deep-craft AI premium as sourced", async () => {
    const user = userEvent.setup();
    render(<CareerSimulator />);
    // Default: no craft, AI built in -> the ×1.0 row must read ASSUMPTION.
    await user.click(screen.getByRole("radio", { name: /I build AI into the delivery/ }));
    expect(screen.getByText(/AI, built on top of no craft/).closest("li")?.textContent).toContain("ASSUMPTION");
    expect(screen.queryByText("SOURCED")).not.toBeInTheDocument();
    // Deep craft: the row becomes the one sourced multiplier, at ×1.34.
    await user.click(screen.getByRole("radio", { name: /Specialised/ }));
    const deep = screen.getByText(/AI, built into a deep craft/).closest("li");
    expect(deep?.textContent).toContain("SOURCED");
    expect(deep?.textContent).toContain("×1.34");
  });

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
