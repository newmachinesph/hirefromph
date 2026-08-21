import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import tldr from "@/data/tldr.json";
import { Tldr } from "./tldr";

describe("Tldr", () => {
  it("marks an unreviewed translation as a draft", () => {
    render(<Tldr route="/start" />);
    expect(screen.getByText("Draft translation")).toBeInTheDocument();
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
