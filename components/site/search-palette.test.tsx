import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchPalette } from "@/components/site/search-palette";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/" }));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

async function openPalette() {
  const user = userEvent.setup();
  render(<SearchPalette />);
  await user.click(screen.getByRole("button", { name: /search pages/i }));
  return { user, input: screen.getByRole("combobox", { name: /search pages/i }) };
}

describe("SearchPalette", () => {
  it("filters the options as you type", async () => {
    const { user, input } = await openPalette();
    await user.type(input, "interview");

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Interview Prep");
  });

  it("matches a niche by name", async () => {
    const { user, input } = await openPalette();
    await user.type(input, "bookkeeping");

    expect(screen.getByRole("option", { name: /Bookkeeping & Accounting/ })).toBeInTheDocument();
  });

  it("navigates to the highlighted option on ArrowDown + Enter", async () => {
    push.mockClear();
    const { user, input } = await openPalette();
    // "stage" hits the five stage descriptions in library.json order:
    // Start Right, Get Hired, Deliver, Level Up, Own.
    await user.type(input, "stage");
    expect(screen.getAllByRole("option")).toHaveLength(5);

    await user.keyboard("{ArrowDown}{Enter}");

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/get-hired");
  });

  it("marks the highlighted option with aria-activedescendant", async () => {
    const { user, input } = await openPalette();
    await user.type(input, "stage");
    await user.keyboard("{ArrowDown}");

    const selected = screen.getAllByRole("option").find((o) => o.getAttribute("aria-selected") === "true");
    expect(selected).toBeDefined();
    expect(input).toHaveAttribute("aria-activedescendant", selected?.id);
  });

  it("shows a no-results line when nothing matches", async () => {
    const { user, input } = await openPalette();
    await user.type(input, "qqqqzzz");

    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText(/no pages match/i)).toBeInTheDocument();
  });

  it("scrolls the active option into view as the selection moves", async () => {
    const scrollIntoView = vi.fn();
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = scrollIntoView;
    try {
      const { user } = await openPalette();
      scrollIntoView.mockClear();

      await user.keyboard("{ArrowDown}");

      expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    } finally {
      Element.prototype.scrollIntoView = original;
    }
  });

  it("keeps every option out of the tab order, relying on aria-activedescendant", async () => {
    const { user, input } = await openPalette();
    await user.type(input, "stage");

    for (const option of screen.getAllByRole("option")) {
      expect(option).toHaveAttribute("tabindex", "-1");
    }
  });
});
