import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { STAR_KEY, StarWriter, parseStarState, slugTheme } from "@/components/star-writer";

const THEMES = [
  { theme: "A problem you solved", prompt: "A mess you made work." },
  { theme: "A mistake you owned", prompt: "Something went wrong and you fixed it." },
];
const STEPS = [
  { n: 1, title: "Pick a real moment", desc: "True, with a result." },
  { n: 2, title: "Write it in four lines", desc: "One per letter." },
];

beforeEach(() => {
  localStorage.clear();
});

const renderWriter = () => render(<StarWriter themes={THEMES} steps={STEPS} />);

describe("StarWriter", () => {
  it("renders one box per STAR part and a story picker", async () => {
    renderWriter();
    expect(screen.getByRole("combobox", { name: /which story/i })).toBeInTheDocument();
    for (const name of [/situation/i, /task/i, /action/i, /result/i]) {
      expect(await screen.findByRole("textbox", { name })).toBeEnabled();
    }
    expect(screen.getByText("Pick a real moment")).toBeInTheDocument();
  });

  it("stores what the visitor writes under the theme's slug", async () => {
    renderWriter();
    const situation = await screen.findByRole("textbox", { name: /situation/i });
    fireEvent.change(situation, { target: { value: "400 unsorted emails." } });

    const stored = JSON.parse(localStorage.getItem(STAR_KEY) ?? "{}");
    expect(stored[slugTheme("A problem you solved")]).toEqual({
      s: "400 unsorted emails.",
      t: "",
      a: "",
      r: "",
    });
    expect(screen.getByRole("status")).toHaveTextContent("1 of 2 stories started");
  });

  it("switches between stories and hydrates a saved one", async () => {
    localStorage.setItem(
      STAR_KEY,
      JSON.stringify({ [slugTheme("A mistake you owned")]: { s: "", t: "", a: "I said so.", r: "" } }),
    );
    const user = userEvent.setup();
    renderWriter();
    await screen.findByText(/1 of 2 stories started/);
    expect(screen.getByRole("textbox", { name: /action/i })).toHaveValue("");

    await user.selectOptions(
      screen.getByRole("combobox", { name: /which story/i }),
      slugTheme("A mistake you owned"),
    );
    expect(screen.getByRole("textbox", { name: /action/i })).toHaveValue("I said so.");
  });
});

describe("parseStarState", () => {
  it("keeps well-formed stories and drops the rest", () => {
    expect(
      parseStarState({
        good: { s: "a", t: "b", a: "c", r: "d" },
        missing: { s: "a" },
        wrong: { s: 1, t: "", a: "", r: "" },
        junk: "no",
      }),
    ).toEqual({ good: { s: "a", t: "b", a: "c", r: "d" } });
    expect(parseStarState("{{{")).toEqual({});
  });
});
