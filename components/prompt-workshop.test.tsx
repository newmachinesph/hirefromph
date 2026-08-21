import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PromptWorkshop } from "@/components/prompt-workshop";

const FIELDS = [
  { id: "role", label: "Role", hint: "Who is it?", placeholder: "e.g. a bookkeeper" },
  { id: "context", label: "Context", hint: "What is going on?", placeholder: "a messy ledger" },
];
const LEVELS = [
  { count: 0, label: "Empty", tone: "neutral", note: "Start with the role." },
  { count: 1, label: "Thin", tone: "caution", note: "Add the context." },
  { count: 2, label: "Solid", tone: "verified", note: "Now run it." },
];

describe("PromptWorkshop", () => {
  it("renders a labelled textarea per field and a quality meter", () => {
    render(<PromptWorkshop intro="Build one." fields={FIELDS} qualityLevels={LEVELS} />);
    expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/context/i)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("assembles the prompt from what the user typed", async () => {
    const user = userEvent.setup();
    render(<PromptWorkshop intro="Build one." fields={FIELDS} qualityLevels={LEVELS} />);
    await user.type(screen.getByLabelText(/role/i), "a bookkeeper");
    expect(screen.getByText(/Role: a bookkeeper/)).toBeInTheDocument();
    expect(screen.getByText("Thin")).toBeInTheDocument();
  });

  it("loads the sample from the placeholders, minus the e.g. prefix, and clears it again", async () => {
    const user = userEvent.setup();
    render(<PromptWorkshop intro="Build one." fields={FIELDS} qualityLevels={LEVELS} />);
    expect(screen.queryByRole("button", { name: /clear/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /use the sample/i }));
    expect(screen.getByLabelText(/role/i)).toHaveValue("a bookkeeper");
    expect(screen.getByLabelText(/context/i)).toHaveValue("a messy ledger");
    expect(screen.getByText(/Context: a messy ledger/)).toBeInTheDocument();
    expect(screen.getByText("Solid")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /clear/i }));
    expect(screen.getByLabelText(/role/i)).toHaveValue("");
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });
});
