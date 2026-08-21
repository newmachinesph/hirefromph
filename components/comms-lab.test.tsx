import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommsLab } from "@/components/comms-lab";

describe("CommsLab", () => {
  it("renders both passes with labelled textareas", () => {
    render(<CommsLab />);
    expect(screen.getByLabelText(/paste a real message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your rewrite/i)).toBeInTheDocument();
  });

  it("flags a hedged message as you type", async () => {
    const user = userEvent.setup();
    render(<CommsLab />);
    await user.type(
      screen.getByLabelText(/paste a real message/i),
      "Sorry po, I just wanted to check in, maybe you could kindly review this?",
    );
    // "sorry", "po", "just", "maybe", "kindly", "wanted to check in" all hit.
    expect(screen.getAllByText(/sorry/i).length).toBeGreaterThan(0);
  });
});
