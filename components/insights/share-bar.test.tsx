import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShareBar } from "@/components/insights/share-bar";

const props = { url: "https://hirefrom.ph/insights/x", title: "A title", description: "A description" };

describe("ShareBar", () => {
  it("links every network with the page URL encoded, opening in a new tab", () => {
    render(<ShareBar {...props} />);
    const x = screen.getByRole("link", { name: "Share on X" });
    expect(x).toHaveAttribute("href", expect.stringContaining(encodeURIComponent(props.url)));
    expect(x).toHaveAttribute("target", "_blank");
    expect(x).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "Share on LinkedIn" })).toHaveAttribute("href", expect.stringContaining("linkedin.com"));
    expect(screen.getByRole("link", { name: "Share on WhatsApp" })).toHaveAttribute("href", expect.stringContaining("wa.me"));
    expect(screen.getByRole("link", { name: "Share by email" })).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
    expect(screen.getByRole("link", { name: "Share by email" })).not.toHaveAttribute("target");
  });

  it("copies the link and confirms", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true, writable: true });
    render(<ShareBar {...props} />);
    await user.click(screen.getByRole("button", { name: "Copy link" }));
    expect(writeText).toHaveBeenCalledWith(props.url);
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("offers the native share sheet only when the browser has one", async () => {
    render(<ShareBar {...props} />);
    expect(screen.queryByRole("button", { name: /Share…/ })).not.toBeInTheDocument();
  });
});
