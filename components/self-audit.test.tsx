import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SelfAudit } from "@/components/self-audit";

const STATEMENTS = ["I read the docs first", "I time-box before asking"];
const LEVELS = [
  { min: 0, max: 1, label: "Getting there", desc: "Keep going." },
  { min: 2, max: 2, label: "Resourceful", desc: "That is the habit." },
];

describe("SelfAudit", () => {
  it("renders one agree/disagree group per statement", () => {
    render(<SelfAudit statements={STATEMENTS} levels={LEVELS} />);
    expect(screen.getAllByRole("radio")).toHaveLength(4);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("shows the level once every statement is answered", async () => {
    const user = userEvent.setup();
    render(<SelfAudit statements={STATEMENTS} levels={LEVELS} />);
    const agrees = screen.getAllByRole("radio").filter((r) => r.id.endsWith("-agree"));
    for (const r of agrees) await user.click(r);
    expect(await screen.findByText("Resourceful")).toBeInTheDocument();
  });

  it("reset clears every answer", async () => {
    const user = userEvent.setup();
    render(<SelfAudit statements={STATEMENTS} levels={LEVELS} />);
    const agrees = screen.getAllByRole("radio").filter((r) => r.id.endsWith("-agree"));
    await user.click(agrees[0]);
    await user.click(screen.getByRole("button", { name: /reset/i }));
    expect(screen.getAllByRole("radio").every((r) => !(r as HTMLInputElement).checked)).toBe(true);
  });
});
