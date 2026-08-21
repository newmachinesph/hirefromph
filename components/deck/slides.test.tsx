import { beforeAll, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Presenter } from "@/components/deck/presenter";
import { SlideView } from "@/components/deck/slides";
import type { Deck } from "@/lib/deck";

const deck: Deck = {
  id: "t",
  title: "Test deck",
  subtitle: "A test",
  lastVerified: "2026-08",
  slides: [
    { id: "title", type: "title", title: "Hello room", body: "Welcome.", notes: "Open warmly.", media: { photo: "deck-title" } },
    {
      id: "method-find",
      type: "method",
      kicker: "Method 01",
      title: "FIND",
      items: ["Primary source first", "Search like an operator", "Triangulate"],
      body: "Drill: find one thing you do not know.",
      notes: "Run the drill.",
      media: { icon: "find" },
    },
    { id: "stages", type: "diagram", title: "Five stages", notes: "Point at the map.", media: { diagram: "journey-map" } },
    {
      id: "clock",
      type: "drill",
      title: "The drill",
      minutes: 25,
      items: ["Do the thing"],
      source: { label: "Run-sheet", url: "https://hirefrom.ph/educators" },
      notes: "Keep time.",
    },
    {
      id: "close",
      type: "close",
      title: "Pass it on",
      body: "CC BY 4.0",
      source: { label: "CC BY 4.0", url: "https://creativecommons.org/licenses/by/4.0/" },
      notes: "Thank them.",
    },
  ],
};

beforeAll(() => {
  // jsdom has no ResizeObserver; SlideFrame only needs it to exist.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

describe("SlideView", () => {
  it("renders the title slide with its photo and the first heading as h1", () => {
    render(<SlideView deck={deck} slide={deck.slides[0]} n={1} attribution="CC BY" />);
    expect(screen.getByRole("heading", { level: 1, name: "Hello room" })).toBeInTheDocument();
    expect(document.querySelector("img.deck-photo")).toHaveAttribute("src", "/images/deck-title.jpg");
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("renders a method slide with its icon, numbered moves and drill line", () => {
    render(<SlideView deck={deck} slide={deck.slides[1]} n={2} attribution="CC BY" />);
    expect(document.querySelector(".deck-method__icon img")).toHaveAttribute("src", "/images/deck/icons/find.png");
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText(/Drill: find one thing/)).toBeInTheDocument();
  });

  it("mounts the diagram and the minutes badge where the type asks for them", () => {
    const { unmount } = render(<SlideView deck={deck} slide={deck.slides[2]} n={3} attribution="CC BY" />);
    expect(document.querySelector("[data-diagram='journey-map'] svg")).toBeInTheDocument();
    unmount();
    render(<SlideView deck={deck} slide={deck.slides[3]} n={4} attribution="CC BY" />);
    expect(screen.getByText("25 min")).toBeInTheDocument();
    expect(screen.getByText(/hirefrom\.ph\/educators/)).toBeInTheDocument();
  });

  it("prints the attribution when a slide has no source", () => {
    render(<SlideView deck={deck} slide={deck.slides[1]} n={2} attribution="Hire From PH · CC BY 4.0" />);
    expect(screen.getByText("Hire From PH · CC BY 4.0")).toBeInTheDocument();
  });
});

describe("Presenter", () => {
  it("moves with the arrow keys and keeps the slide number in the hash", async () => {
    const user = userEvent.setup();
    window.location.hash = "";
    render(<Presenter deck={deck} attribution="CC BY" />);
    expect(screen.getByText("1 / 5", { selector: ".deck-presenter__count" })).toBeInTheDocument();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByText("2 / 5", { selector: ".deck-presenter__count" })).toBeInTheDocument();
    expect(window.location.hash).toBe("#2");

    await user.keyboard("{End}");
    expect(screen.getByText("5 / 5", { selector: ".deck-presenter__count" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next slide" })).toBeDisabled();
  });

  it("toggles speaker notes with N", async () => {
    const user = userEvent.setup();
    window.location.hash = "";
    render(<Presenter deck={deck} attribution="CC BY" />);
    expect(screen.queryByRole("complementary", { name: "Speaker notes" })).not.toBeInTheDocument();
    await user.keyboard("n");
    expect(screen.getByRole("complementary", { name: "Speaker notes" })).toHaveTextContent("Open warmly.");
  });
});
