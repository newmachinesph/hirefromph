import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LibraryBrowser } from "@/components/site/library-browser";
import { LIVE_LIBRARY } from "@/lib/nav";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/library",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("LibraryBrowser", () => {
  it("shows every live library entry by default", () => {
    render(<LibraryBrowser />);
    expect(screen.getAllByRole("link")).toHaveLength(LIVE_LIBRARY.length);
    expect(screen.getByText(`${LIVE_LIBRARY.length} of ${LIVE_LIBRARY.length} pages`)).toBeInTheDocument();
  });

  it("never lists a page whose route ships in a later phase", () => {
    render(<LibraryBrowser />);
    expect(screen.queryByRole("link", { name: /Flashcards and quizzes/ })).toBeNull();
  });

  it("narrows the grid when a group chip is pressed, and mirrors it to the URL", async () => {
    replace.mockClear();
    const user = userEvent.setup();
    render(<LibraryBrowser />);
    const before = screen.getAllByRole("link").length;

    await user.click(screen.getByRole("button", { name: "The path" }));

    const after = screen.getAllByRole("link").length;
    expect(after).toBe(5);
    expect(after).toBeLessThan(before);
    expect(replace).toHaveBeenCalledWith("/library?group=path", { scroll: false });
  });

  it("marks the pressed chip", async () => {
    const user = userEvent.setup();
    render(<LibraryBrowser />);
    const chip = screen.getByRole("button", { name: "Workshop" });

    expect(chip).toHaveAttribute("aria-pressed", "false");
    await user.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
  });

  it("filters by the search query over label and description", async () => {
    const user = userEvent.setup();
    render(<LibraryBrowser />);

    await user.type(screen.getByRole("searchbox", { name: /search the library/i }), "japanese");

    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /Languages/ })).toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<LibraryBrowser />);

    await user.type(screen.getByRole("searchbox", { name: /search the library/i }), "qqqqzzz");

    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getByText(/no pages match/i)).toBeInTheDocument();
  });

  it("gives every filter chip a 44px minimum touch target", () => {
    render(<LibraryBrowser />);
    const chips = screen
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("aria-pressed"));

    expect(chips.length).toBeGreaterThan(0);
    chips.forEach((chip) => {
      expect(chip).toHaveClass("min-h-11");
    });
  });
});
