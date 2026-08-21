import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RateWorksheet } from "@/components/rate-worksheet";
import { DEFAULT_FX } from "@/lib/simulator-math";

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

  it("starts from the site-wide FX rate", () => {
    render(<RateWorksheet />);
    const fx = screen.getByLabelText(/assumed pesos per us dollar/i) as HTMLInputElement;
    expect(Number(fx.value)).toBe(DEFAULT_FX);
  });

  it("shows where the example rows came from, with a date and a link", () => {
    render(<RateWorksheet />);
    const link = screen.getByRole("link", { name: /onlinejobs\.ph/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("onlinejobs.ph"));
    expect(link.parentElement?.textContent).toContain("July 2026");
  });
});
