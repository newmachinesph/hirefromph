import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import tldr from "@/data/tldr.json";
import { Tldr } from "./tldr";

describe("Tldr", () => {
  it("marks an unreviewed translation as a draft, below the text rather than in the title", () => {
    render(<Tldr route="/start" />);
    const body = screen.getByText(tldr.routes["/start"].tl);
    const note = screen.getByText(/draft translation/i);
    expect(note).toBeInTheDocument();
    expect(note.className).toContain("text-caption");
    expect(note.className).toContain("text-ink-faint");
    // The note follows the translation in document order.
    expect(body.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // The accordion title carries no badge.
    const summary = screen.getByText("TL;DR sa Tagalog").closest("summary");
    expect(summary?.textContent).not.toMatch(/draft/i);
  });

  it("renders nothing for a route with no TL;DR", () => {
    const { container } = render(<Tldr route="/not-a-route" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("keeps every shipped TL;DR flagged for review", () => {
    const unflagged = Object.entries(tldr.routes).filter(([, v]) => v.reviewed !== false);
    expect(unflagged.map(([k]) => k)).toEqual([]);
  });
});
