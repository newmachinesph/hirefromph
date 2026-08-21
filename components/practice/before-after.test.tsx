import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BeforeAfter, splitHighlights } from "@/components/practice/before-after";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("splitHighlights", () => {
  it("marks each fragment it finds and leaves the rest alone", () => {
    expect(
      splitHighlights("sorry to bother you, here is the report", ["sorry to bother you"]),
    ).toEqual([
      { text: "sorry to bother you", hit: true },
      { text: ", here is the report", hit: false },
    ]);
  });

  it("orders fragments by where they appear, not by how they were passed", () => {
    expect(splitHighlights("one two three", ["three", "one"])).toEqual([
      { text: "one", hit: true },
      { text: " two ", hit: false },
      { text: "three", hit: true },
    ]);
  });

  it("marks only the first occurrence of a repeated fragment", () => {
    expect(splitHighlights("po po", ["po"])).toEqual([
      { text: "po", hit: true },
      { text: " po", hit: false },
    ]);
  });

  it("returns the whole string untouched when nothing matches", () => {
    expect(splitHighlights("nothing here", ["absent"])).toEqual([
      { text: "nothing here", hit: false },
    ]);
  });

  it("handles an empty fragment list", () => {
    expect(splitHighlights("plain", [])).toEqual([{ text: "plain", hit: false }]);
  });
});

describe("BeforeAfter", () => {
  it("renders nothing for an id that does not exist", () => {
    const { container } = render(<BeforeAfter pairId="nope" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows both versions at once in the split view", () => {
    render(<BeforeAfter pairId="late-delivery" />);
    const split = screen.getByTestId("split-view");
    expect(within(split).getByText(/sorry to bother you/)).toBeInTheDocument();
    expect(within(split).getByText(/moves from Friday to Tuesday/)).toBeInTheDocument();
  });

  it("gives the divider a labelled slider a keyboard can move", async () => {
    const user = userEvent.setup();
    render(<BeforeAfter pairId="late-delivery" />);
    const slider = screen.getByRole("slider", { name: /split between the two versions/i });
    slider.focus();
    const before = Number((slider as HTMLInputElement).value);
    await user.keyboard("{ArrowRight}");
    expect(Number((slider as HTMLInputElement).value)).toBeGreaterThan(before);
  });

  it("offers the two versions as tabs for small screens", async () => {
    const user = userEvent.setup();
    render(<BeforeAfter pairId="late-delivery" />);
    const tabs = screen.getByRole("tablist", { name: /two versions/i });
    await user.click(within(tabs).getByRole("tab", { name: "After" }));
    expect(within(tabs).getByRole("tab", { name: "After" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("lists every change with the reason it was made", () => {
    render(<BeforeAfter pairId="late-delivery" />);
    const changes = screen.getByTestId("change-list");
    expect(within(changes).getAllByRole("listitem")).toHaveLength(5);
    expect(within(changes).getByText(/Twelve words of throat-clearing/)).toBeInTheDocument();
  });

  it("marks the changed phrases in both versions", () => {
    render(<BeforeAfter pairId="late-delivery" />);
    expect(screen.getAllByTestId("marked").length).toBeGreaterThan(0);
  });
});
