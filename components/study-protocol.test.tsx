import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StudyProtocol } from "@/components/study-protocol";

describe("StudyProtocol", () => {
  it("renders the first question as a radio group", () => {
    render(<StudyProtocol />);
    expect(screen.getAllByRole("radio").length).toBeGreaterThan(1);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("choosing an option advances the wizard", async () => {
    const user = userEvent.setup();
    render(<StudyProtocol />);
    const first = screen.getAllByRole("radio")[0];
    const before = screen.getByRole("progressbar").getAttribute("aria-valuenow");
    await user.click(first);
    await new Promise((r) => setTimeout(r, 500));
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).not.toBe(before);
  });
});
