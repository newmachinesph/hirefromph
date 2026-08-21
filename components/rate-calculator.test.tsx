import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DEFAULT_UNPAID_SHARE, RateCalculator } from "@/components/rate-calculator";
import { DEFAULT_FX, UNPAID_KEEP } from "@/lib/simulator-math";

describe("RateCalculator", () => {
  it("renders one labelled slider per input", () => {
    render(<RateCalculator />);
    expect(screen.getAllByRole("slider")).toHaveLength(7);
    expect(screen.getByLabelText(/your billed rate/i)).toBeInTheDocument();
  });

  it("raising the billed rate raises the real hourly rate", async () => {
    render(<RateCalculator />);
    const slider = screen.getByLabelText(/your billed rate/i) as HTMLInputElement;
    const before = screen.getByText(/\/ hr$/).textContent;
    // jsdom does not step range inputs on arrow keys; set the value directly.
    fireEvent.change(slider, { target: { value: String(Number(slider.value) + Number(slider.step || 1) * 3) } });
    expect(screen.getByText(/\/ hr$/).textContent).not.toBe(before);
  });

  it("starts from the site-wide unpaid quarter and FX rate", () => {
    render(<RateCalculator />);
    expect(DEFAULT_UNPAID_SHARE).toBe(25);
    const unpaid = screen.getByLabelText(/unpaid share/i) as HTMLInputElement;
    expect(Number(unpaid.value)).toBe(Math.round((1 - UNPAID_KEEP) * 100));
    const fx = screen.getByLabelText(/exchange rate/i) as HTMLInputElement;
    expect(Number(fx.value)).toBe(DEFAULT_FX);
  });

  it("counts a quarter of unpaid time as a third on top of billed hours", () => {
    render(<RateCalculator />);
    // 40 billed hrs/wk x 4.33 wks = 173.2; at a 25% unpaid share you really work 173.2 / 0.75.
    expect(screen.getByText(`${Math.round((40 * 4.33) / 0.75)} / mo`)).toBeInTheDocument();
  });

  it("cites the source for the unpaid-time figure", () => {
    render(<RateCalculator />);
    expect(screen.getByRole("link", { name: /ILO/ })).toHaveAttribute(
      "href",
      expect.stringContaining("ilo.org"),
    );
  });
});
