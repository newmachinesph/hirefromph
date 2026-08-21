import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  INTELLIGENCES_KEY,
  IntelligencePicker,
  parseIntelligenceMarks,
  slugName,
} from "@/components/intelligence-picker";

const ITEMS = [{ name: "Creative" }, { name: "Emotional & social" }, { name: "Judgment & taste" }];

beforeEach(() => {
  localStorage.clear();
});

const renderPicker = () =>
  render(<IntelligencePicker items={ITEMS} title="Mark yours." hint="Browser only." />);

describe("IntelligencePicker", () => {
  it("renders a mine and a growing toggle per intelligence", async () => {
    renderPicker();
    await screen.findByText("Nothing marked yet.");
    expect(screen.getAllByRole("button", { name: /^mine:/i })).toHaveLength(3);
    expect(screen.getAllByRole("button", { name: /^growing:/i })).toHaveLength(3);
  });

  it("stores marks, swaps mine for growing, and clears on a second press", async () => {
    const user = userEvent.setup();
    renderPicker();
    await screen.findByText("Nothing marked yet.");

    const mineCreative = screen.getByRole("button", { name: "Mine: Creative" });
    await user.click(mineCreative);
    expect(mineCreative).toHaveAttribute("aria-pressed", "true");
    expect(JSON.parse(localStorage.getItem(INTELLIGENCES_KEY) ?? "{}")).toEqual({
      [slugName("Creative")]: "mine",
    });

    await user.click(screen.getByRole("button", { name: "Growing: Creative" }));
    expect(mineCreative).toHaveAttribute("aria-pressed", "false");
    expect(JSON.parse(localStorage.getItem(INTELLIGENCES_KEY) ?? "{}")).toEqual({
      [slugName("Creative")]: "growing",
    });

    await user.click(screen.getByRole("button", { name: "Growing: Creative" }));
    expect(JSON.parse(localStorage.getItem(INTELLIGENCES_KEY) ?? "{}")).toEqual({});
  });

  it("tells the visitor when they have two to lead with and one to grow", async () => {
    const user = userEvent.setup();
    renderPicker();
    await screen.findByText("Nothing marked yet.");
    await user.click(screen.getByRole("button", { name: "Mine: Creative" }));
    await user.click(screen.getByRole("button", { name: "Mine: Emotional & social" }));
    await user.click(screen.getByRole("button", { name: "Growing: Judgment & taste" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Two to lead with. One to grow this quarter.",
    );
  });
});

describe("parseIntelligenceMarks", () => {
  it("keeps only mine/growing values", () => {
    expect(parseIntelligenceMarks({ a: "mine", b: "growing", c: "both", d: 1 })).toEqual({
      a: "mine",
      b: "growing",
    });
    expect(parseIntelligenceMarks(["mine"])).toEqual({});
  });
});
