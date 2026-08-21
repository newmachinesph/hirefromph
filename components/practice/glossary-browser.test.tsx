import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TERMS, groupByLetter } from "@/lib/glossary";
import { GlossaryBrowser } from "@/components/practice/glossary-browser";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const LETTERS = groupByLetter(TERMS).map((group) => group.letter);

describe("GlossaryBrowser", () => {
  it("renders an A–Z jump row that links only to the letters that exist", () => {
    render(<GlossaryBrowser />);
    const jump = screen.getByRole("navigation", { name: /jump to a letter/i });
    const links = within(jump).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(LETTERS);
    for (const link of links) {
      expect(link).toHaveAttribute("href", `#letter-${link.textContent}`);
    }
    expect(jump.className).toMatch(/lg:sticky/);
  });

  it("points every jump link at a heading with that id", () => {
    render(<GlossaryBrowser />);
    // One id lookup per letter; a role query per letter walks the whole 50-card tree each time.
    for (const letter of LETTERS) {
      const target = document.getElementById(`letter-${letter}`);
      expect(target?.tagName).toBe("H2");
      expect(target).toHaveTextContent(letter);
    }
  });

  it("narrows the list and the jump row together when filtering", async () => {
    const user = userEvent.setup();
    render(<GlossaryBrowser />);
    // A single-word term keeps the typed query free of regex and URL specials.
    const word = TERMS.find((term) => /^[A-Za-z]+$/.test(term.term))!;
    await user.type(screen.getByRole("searchbox", { name: /filter the glossary/i }), word.term);
    expect(screen.getByText(new RegExp(`matching “${word.term}”`))).toBeInTheDocument();
    const jump = screen.getByRole("navigation", { name: /jump to a letter/i });
    const letters = within(jump)
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(letters).toContain(word.term[0].toUpperCase());
    expect(letters.length).toBeLessThan(LETTERS.length);
  });

  it("drops the jump row and explains when nothing matches", async () => {
    const user = userEvent.setup();
    render(<GlossaryBrowser />);
    await user.type(screen.getByRole("searchbox", { name: /filter the glossary/i }), "zzzzqqq");
    expect(screen.queryByRole("navigation", { name: /jump to a letter/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Nothing matches that/i)).toBeInTheDocument();
  });
});
