import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BuildLabs } from "@/components/build-labs";

describe("BuildLabs", () => {
  it("renders the lab gallery", () => {
    render(<BuildLabs />);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("opens a lab and exposes its six sections as a tablist", async () => {
    const user = userEvent.setup();
    render(<BuildLabs />);
    const first = screen.getAllByRole("button").find((b) => /open|lab|build/i.test(b.textContent ?? ""));
    await user.click(first as HTMLElement);
    expect(await screen.findByRole("tablist")).toBeInTheDocument();
    expect(screen.getAllByRole("tab").length).toBeGreaterThan(1);
  });

  it("typing in a workshop field keeps the value", async () => {
    const user = userEvent.setup();
    render(<BuildLabs />);
    const first = screen.getAllByRole("button").find((b) => /open|lab|build/i.test(b.textContent ?? ""));
    await user.click(first as HTMLElement);
    await user.click(await screen.findByRole("tab", { name: /workshop/i }));
    const boxes = await screen.findAllByRole("textbox");
    await user.type(boxes[0], "my own words");
    expect(boxes[0]).toHaveValue("my own words");
  });
});
