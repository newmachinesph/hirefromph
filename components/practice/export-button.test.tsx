import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportButton } from "@/components/practice/export-button";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function stubDownload() {
  const createObjectURL = vi.fn<(blob: Blob) => string>(() => "blob:fake");
  const revokeObjectURL = vi.fn();
  vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL });
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
  return { createObjectURL, click };
}

describe("ExportButton", () => {
  it("does not build the file until it is clicked", async () => {
    stubDownload();
    const build = vi.fn(() => "# My resume");
    const user = userEvent.setup();
    render(
      <ExportButton title="My resume" kind="markdown" filename="my-resume.md" build={build} />,
    );

    expect(build).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /Download Markdown/i }));
    expect(build).toHaveBeenCalledTimes(1);
  });

  it("uses the calendar MIME type for an ICS export", async () => {
    const { createObjectURL } = stubDownload();
    const user = userEvent.setup();
    render(
      <ExportButton
        title="My 30-day plan"
        kind="ics"
        filename="plan.ics"
        build={() => "BEGIN:VCALENDAR"}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Add to calendar/i }));
    expect((createObjectURL.mock.calls[0][0] as Blob).type).toBe("text/calendar;charset=utf-8");
  });

  it("prepends a byte-order mark to CSV so spreadsheets read accents correctly", async () => {
    const { createObjectURL } = stubDownload();
    const user = userEvent.setup();
    render(
      <ExportButton
        title="My pipeline"
        kind="csv"
        filename="pipeline.csv"
        build={() => "Company\r\nAcme"}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Download CSV/i }));
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    // Blob.text() strips a leading BOM (WHATWG decode), so check the raw bytes.
    const bytes = new Uint8Array(await blob.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(new TextDecoder().decode(bytes)).toBe("Company\r\nAcme");
  });

  it("names the file for assistive technology", () => {
    render(
      <ExportButton title="My resume" kind="markdown" filename="my-resume.md" build={() => "x"} />,
    );
    expect(screen.getByRole("button", { name: "Download Markdown of My resume" })).toBeInTheDocument();
  });

  it("does nothing when there is nothing written yet", async () => {
    const { click } = stubDownload();
    const user = userEvent.setup();
    render(
      <ExportButton
        title="My resume"
        kind="markdown"
        filename="my-resume.md"
        build={() => ""}
        disabled
      />,
    );
    await user.click(screen.getByRole("button", { name: /Download Markdown/i }));
    expect(click).not.toHaveBeenCalled();
  });

  it("accepts a custom label", () => {
    render(
      <ExportButton
        title="My oath"
        kind="markdown"
        filename="oath.md"
        label="Save my oath"
        build={() => "x"}
      />,
    );
    expect(screen.getByRole("button", { name: /Save my oath/ })).toBeInTheDocument();
  });
});
