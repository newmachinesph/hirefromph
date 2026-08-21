import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyButton } from "@/components/copy-button";

// jsdom ships its own (permission-gated, non-mockable) Clipboard on
// navigator.clipboard, and userEvent.setup() itself (re)installs it — so the
// mock must be defined as an own property *after* setup(), or setup()
// clobbers it before the test ever calls navigator.clipboard.writeText.
function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
    writable: true,
  });
  return writeText;
}

describe("CopyButton", () => {
  it("renders its label", () => {
    render(<CopyButton value="hello" label="Copy formula" />);
    expect(screen.getByRole("button", { name: /copy formula/i })).toBeInTheDocument();
  });

  it("writes the value to the clipboard and confirms", async () => {
    const user = userEvent.setup();
    const writeText = mockClipboard();
    render(<CopyButton value='=COUNTIF(E:E,"Interview")' />);
    await user.click(screen.getByRole("button"));
    expect(writeText).toHaveBeenCalledWith('=COUNTIF(E:E,"Interview")');
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });
});
