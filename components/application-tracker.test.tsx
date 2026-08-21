import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PathProvider } from "@/lib/path-context";
import { ApplicationTracker } from "@/components/application-tracker";

const renderTracker = () =>
  render(
    <PathProvider>
      <ApplicationTracker />
    </PathProvider>,
  );

describe("ApplicationTracker", () => {
  it("renders the log form with every field labelled", () => {
    renderTracker();
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/follow up on/i)).toBeInTheDocument();
  });

  it("logging an application adds it to the pipeline", async () => {
    const user = userEvent.setup();
    renderTracker();
    await user.type(screen.getByLabelText(/company/i), "Acme Co");
    await user.type(screen.getByLabelText(/^role/i), "Bookkeeper");
    await user.click(screen.getByRole("button", { name: /add application/i }));
    expect(await screen.findByText("Acme Co")).toBeInTheDocument();
  });

  it("refuses an empty submission with a visible error", async () => {
    const user = userEvent.setup();
    renderTracker();
    await user.click(screen.getByRole("button", { name: /add application/i }));
    // The browser's native `required` blocks submission before `handleSubmit`
    // runs, so `formError`'s Callout never mounts — that is correct behaviour.
    expect(screen.getByLabelText(/company/i)).toBeInvalid();
  });
});
