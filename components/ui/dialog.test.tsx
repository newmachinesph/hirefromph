import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "@/components/ui/dialog";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open search
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Search pages"
        description="Type to filter every route."
      >
        <button type="button">Go to Stage 1</button>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("is closed until asked to open", () => {
    render(<Harness />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("announces itself as a modal with a name and a description", async () => {
    await userEvent.click(render(<Harness />).getByText("Open search"));
    const dialog = screen.getByRole("dialog", { name: "Search pages" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    const describedBy = dialog.getAttribute("aria-describedby") ?? "";
    expect(document.getElementById(describedBy)).toHaveTextContent(
      "Type to filter every route.",
    );
  });

  it("moves focus in, locks scroll, and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open search" });

    await user.click(trigger);
    expect(document.body.style.overflow).toBe("hidden");
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("returns focus to the trigger after closing", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open search" });

    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(trigger);
  });

  it("closes when the overlay is clicked", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Open search" }));
    await user.click(screen.getByRole("button", { name: "Close Search pages" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
