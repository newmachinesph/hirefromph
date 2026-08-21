import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PathProvider } from "@/lib/path-context";
import { IntegrityOath } from "@/components/integrity-oath";

const renderOath = () =>
  render(
    <PathProvider>
      <IntegrityOath />
    </PathProvider>,
  );

const COMMITMENT =
  "The hardest one for me is hours, because slow weeks tempt me to round up. When that happens I will bill the real minutes.";

async function fillAndSign(user: ReturnType<typeof userEvent.setup>, clauseIndexes: number[]) {
  const boxes = await screen.findAllByRole("checkbox");
  for (const i of clauseIndexes) await user.click(boxes[i]);
  // One change event, not 120 keystrokes: every keystroke writes through to
  // localStorage and re-renders the whole form.
  fireEvent.change(screen.getByRole("textbox", { name: /step 2/i }), {
    target: { value: COMMITMENT },
  });
  fireEvent.change(screen.getByRole("textbox", { name: /sign it with your name/i }), {
    target: { value: "Ana Reyes" },
  });
  await user.click(screen.getByRole("button", { name: /sign the oath/i }));
}

describe("IntegrityOath", () => {
  it("renders every clause as a checkbox once hydrated", async () => {
    renderOath();
    const boxes = await screen.findAllByRole("checkbox");
    expect(boxes.length).toBeGreaterThan(5);
  });

  it("keeps the sign button disabled until something is ticked and written", async () => {
    renderOath();
    await screen.findAllByRole("checkbox");
    expect(screen.getByRole("button", { name: /sign the oath/i })).toBeDisabled();
    expect(screen.getByText(/tick at least one clause/i)).toBeInTheDocument();
  });

  it("ticking a clause updates the accepted counter", async () => {
    const user = userEvent.setup();
    renderOath();
    const boxes = await screen.findAllByRole("checkbox");
    await user.click(boxes[0]);
    expect(screen.getByText(/1 of \d+ accepted/i)).toBeInTheDocument();
  });

  it("lets the visitor sign with fewer than all clauses and records which were kept", async () => {
    const user = userEvent.setup();
    renderOath();
    await fillAndSign(user, [0, 2]);

    expect(screen.getByText(/signed by ana reyes/i)).toBeInTheDocument();
    expect(screen.getByTestId("oath-kept")).toHaveTextContent(/kept 2 of \d+: 01, 03/i);
    // The record is frozen while signed; "Revise it" reopens it.
    expect(screen.getAllByRole("checkbox").every((b) => (b as HTMLInputElement).disabled)).toBe(true);
    await user.click(screen.getByRole("button", { name: /revise it/i }));
    expect(screen.getAllByRole("checkbox").some((b) => !(b as HTMLInputElement).disabled)).toBe(true);
  });

  it("offers the next step after signing", async () => {
    const user = userEvent.setup();
    renderOath();
    await fillAndSign(user, [1]);

    expect(screen.getByRole("link", { name: /get your contracts right/i })).toHaveAttribute(
      "href",
      "/legit",
    );
    expect(screen.getByRole("link", { name: /go get hired/i })).toHaveAttribute("href", "/get-hired");
  });
});
