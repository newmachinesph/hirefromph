import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TimezoneOverlap } from "@/components/practice/timezone-overlap";

describe("TimezoneOverlap", () => {
  it("lists all six client regions", () => {
    render(<TimezoneOverlap />);
    const rows = screen.getAllByTestId("overlap-row");
    expect(rows).toHaveLength(6);
    expect(rows[0]).toHaveTextContent("United States");
  });

  it("labels the two sliders that set the visitor's working window", () => {
    render(<TimezoneOverlap />);
    expect(screen.getByRole("slider", { name: /your day starts/i })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: /hours you work/i })).toBeInTheDocument();
  });

  it("gives a 9-to-5 Manila day no overlap with New York in January", async () => {
    const user = userEvent.setup();
    render(<TimezoneOverlap />);
    await user.selectOptions(screen.getByRole("combobox", { name: /month/i }), "1");

    const us = screen.getAllByTestId("overlap-row")[0];
    expect(within(us).getByTestId("overlap-hours")).toHaveTextContent("0");
  });

  it("recomputes when the visitor moves their working window", async () => {
    const user = userEvent.setup();
    render(<TimezoneOverlap />);
    await user.selectOptions(screen.getByRole("combobox", { name: /month/i }), "1");

    const start = screen.getByRole("slider", { name: /your day starts/i });
    // Move the day to a 10 pm start, which is when New York is at work.
    // A direct change event is the reliable way to set an exact value on a
    // range input in jsdom (arrow-key stepping is not implemented there).
    fireEvent.change(start, { target: { value: "22" } });

    const us = screen.getAllByTestId("overlap-row")[0];
    expect(Number(within(us).getByTestId("overlap-hours").textContent)).toBeGreaterThan(0);
  });

  it("names the city each offset belongs to, so the estimate is honest", () => {
    render(<TimezoneOverlap />);
    expect(screen.getByText(/New York/)).toBeInTheDocument();
    expect(screen.getByText(/Singapore/)).toBeInTheDocument();
  });

  it("cites where the offsets come from", () => {
    render(<TimezoneOverlap />);
    expect(screen.getByRole("link", { name: /IANA Time Zone Database/ })).toHaveAttribute(
      "href",
      "https://www.iana.org/time-zones",
    );
  });
});
