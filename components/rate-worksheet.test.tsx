import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RateWorksheet } from "@/components/rate-worksheet";

describe("RateWorksheet", () => {
  it("seeds six example posts and shows an evidence range", () => {
    render(<RateWorksheet />);
    expect(screen.getAllByLabelText(/^role$/i)).toHaveLength(6);
    expect(screen.getByText(/your evidence range/i)).toBeInTheDocument();
  });

  it("adding a post gives it an empty role field", async () => {
    const user = userEvent.setup();
    render(<RateWorksheet />);
    await user.click(screen.getByRole("button", { name: /add a post you found/i }));
    expect(screen.getAllByLabelText(/^role$/i)).toHaveLength(7);
  });

  it("removing a post drops the row", async () => {
    const user = userEvent.setup();
    render(<RateWorksheet />);
    await user.click(screen.getAllByRole("button", { name: /remove post/i })[0]);
    expect(screen.getAllByLabelText(/^role$/i)).toHaveLength(5);
  });
});
