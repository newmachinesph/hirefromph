import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavDesktop, splitColumns } from "@/components/site/nav-desktop";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("NavDesktop", () => {
  it("renders the four top-level items", () => {
    render(<NavDesktop />);
    expect(screen.getByRole("button", { name: "Path" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Learn" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Work" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reality Check" })).toBeInTheDocument();
  });

  it("opens the panel on click and toggles aria-expanded", async () => {
    const user = userEvent.setup();
    render(<NavDesktop />);
    const trigger = screen.getByRole("button", { name: "Learn" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /The Method/ })).toBeNull();

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /The Method/ })).toBeInTheDocument();
    expect(screen.getByText("Work like a professional")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Browse everything in the library/ }),
    ).toHaveAttribute("href", "/library");
  });

  it("hides links whose route ships in a later phase", async () => {
    const user = userEvent.setup();
    render(<NavDesktop />);
    await user.click(screen.getByRole("button", { name: "Learn" }));
    expect(screen.queryByRole("link", { name: /Glossary/ })).toBeNull();
  });

  it("opens on ArrowDown from the trigger", async () => {
    const user = userEvent.setup();
    render(<NavDesktop />);
    const trigger = screen.getByRole("button", { name: "Path" });

    trigger.focus();
    await user.keyboard("{ArrowDown}");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /Your dashboard/ })).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<NavDesktop />);
    const trigger = screen.getByRole("button", { name: "Work" });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("keeps only one panel open at a time", async () => {
    const user = userEvent.setup();
    render(<NavDesktop />);
    const path = screen.getByRole("button", { name: "Path" });
    const work = screen.getByRole("button", { name: "Work" });

    await user.click(path);
    await user.click(work);

    expect(path).toHaveAttribute("aria-expanded", "false");
    expect(work).toHaveAttribute("aria-expanded", "true");
  });

  it("gives every trigger and every open-panel link a 44px minimum touch target", async () => {
    const user = userEvent.setup();
    render(<NavDesktop />);

    for (const button of screen.getAllByRole("button")) {
      expect(button).toHaveClass("min-h-11");
    }

    await user.click(screen.getByRole("button", { name: "Learn" }));

    const panelLinks = document.querySelectorAll("a[data-nav-item]");
    expect(panelLinks.length).toBeGreaterThan(0);
    for (const link of panelLinks) {
      expect(link).toHaveClass("min-h-11");
    }
  });

  it("wraps a long group into columns of at most five links", async () => {
    const user = userEvent.setup();
    const { container } = render(<NavDesktop />);
    await user.click(screen.getByRole("button", { name: "Learn" }));

    const columns = container.querySelectorAll("[data-nav-column]");
    expect(columns.length).toBeGreaterThanOrEqual(3);
    columns.forEach((column) => {
      expect(column.querySelectorAll("a").length).toBeLessThanOrEqual(5);
    });
  });
});

describe("splitColumns", () => {
  const link = (n: number) => ({ label: `L${n}`, href: `/l${n}` });

  it("keeps short groups as one column each", () => {
    const out = splitColumns([
      { title: "A", links: [link(1), link(2)] },
      { title: "B", links: [link(3)] },
    ]);
    expect(out.map((c) => [c.title, c.part, c.links.length])).toEqual([
      ["A", 0, 2],
      ["B", 0, 1],
    ]);
  });

  it("balances a nine-link group into 5 + 4 and skips pending links", () => {
    const links = Array.from({ length: 9 }, (_, i) => link(i));
    const out = splitColumns([{ title: "A", links: [...links, { ...link(99), pending: true }] }]);
    expect(out.map((c) => c.links.length)).toEqual([5, 4]);
    expect(out[1].part).toBe(1);
  });
});
