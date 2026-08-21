import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PRACTICE_KEYS } from "@/lib/practice-store";
import { READER_SCRIPT, ReaderControls } from "@/components/practice/reader-controls";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

describe("READER_SCRIPT", () => {
  it("applies the stored classes and survives a corrupt slot", () => {
    localStorage.setItem(
      PRACTICE_KEYS.reader,
      JSON.stringify({ size: "lg", comfort: true, lowData: false }),
    );
    // eslint-disable-next-line no-eval
    eval(READER_SCRIPT);
    expect(document.documentElement.classList.contains("text-size-lg")).toBe(true);
    expect(document.documentElement.classList.contains("reading-comfort")).toBe(true);
    expect(document.documentElement.classList.contains("low-data")).toBe(false);

    document.documentElement.className = "";
    localStorage.setItem(PRACTICE_KEYS.reader, "{{{");
    // eslint-disable-next-line no-eval
    expect(() => eval(READER_SCRIPT)).not.toThrow();
    expect(document.documentElement.className).toBe("");
  });

  it("carries no closing script tag that would break the inline block", () => {
    expect(READER_SCRIPT).not.toContain("</script");
  });
});

describe("ReaderControls", () => {
  it("groups the controls under a name a screen reader can find", () => {
    render(<ReaderControls />);
    expect(screen.getByRole("group", { name: /reading/i })).toBeInTheDocument();
  });

  it("offers the three text sizes as one radio group", async () => {
    const user = userEvent.setup();
    render(<ReaderControls />);
    await user.click(screen.getByRole("radio", { name: "Large" }));
    expect(document.documentElement.classList.contains("text-size-lg")).toBe(true);
    expect(document.documentElement.classList.contains("text-size-md")).toBe(false);
  });

  it("toggles comfortable reading and stores it", async () => {
    const user = userEvent.setup();
    render(<ReaderControls />);
    await user.click(screen.getByRole("switch", { name: /comfortable reading/i }));
    expect(document.documentElement.classList.contains("reading-comfort")).toBe(true);
    expect(JSON.parse(localStorage.getItem(PRACTICE_KEYS.reader) ?? "{}").comfort).toBe(true);
  });

  it("toggles low-data mode and stores it", async () => {
    const user = userEvent.setup();
    render(<ReaderControls />);
    await user.click(screen.getByRole("switch", { name: /low-data/i }));
    expect(document.documentElement.classList.contains("low-data")).toBe(true);
    expect(JSON.parse(localStorage.getItem(PRACTICE_KEYS.reader) ?? "{}").lowData).toBe(true);
  });

  it("restores what was stored on the previous visit", async () => {
    localStorage.setItem(
      PRACTICE_KEYS.reader,
      JSON.stringify({ size: "sm", comfort: false, lowData: true }),
    );
    render(<ReaderControls />);
    expect(await screen.findByRole("radio", { name: "Small" })).toBeChecked();
    expect(screen.getByRole("switch", { name: /low-data/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
