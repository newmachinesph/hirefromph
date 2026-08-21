import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PathProvider } from "@/lib/path-context";
import { IntegrityOath } from "@/components/integrity-oath";

const renderOath = () =>
  render(
    <PathProvider>
      <IntegrityOath />
    </PathProvider>,
  );

describe("IntegrityOath", () => {
  it("renders every clause as a checkbox once hydrated", async () => {
    renderOath();
    const boxes = await screen.findAllByRole("checkbox");
    expect(boxes.length).toBeGreaterThan(5);
  });

  it("keeps the sign button disabled until the oath is complete", async () => {
    renderOath();
    await screen.findAllByRole("checkbox");
    expect(screen.getByRole("button", { name: /sign the oath/i })).toBeDisabled();
  });

  it("ticking a clause updates the accepted counter", async () => {
    const user = userEvent.setup();
    renderOath();
    const boxes = await screen.findAllByRole("checkbox");
    await user.click(boxes[0]);
    expect(screen.getByText(/1 of \d+ accepted/i)).toBeInTheDocument();
  });
});
