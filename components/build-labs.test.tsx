import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import labsData from "@/data/labs.json";
import { BuildLabs } from "@/components/build-labs";
import { LAB_IDS } from "@/lib/labs";

describe("BuildLabs", () => {
  it("preselects the lab named by the ?lab= deep link", () => {
    const second = labsData.labs[1];
    render(<BuildLabs initialLabId={LAB_IDS[1]} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: second.name })).toBeInTheDocument();
  });

  it("falls back to the gallery for an unknown lab id", () => {
    render(<BuildLabs initialLabId="not-a-lab" />);
    expect(screen.queryByRole("tablist")).toBeNull();
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

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
