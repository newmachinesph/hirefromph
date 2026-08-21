import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toc } from "@/components/layout/toc";

const ITEMS = [
  { id: "warning", label: "Warning label" },
  { id: "in-demand", label: "In demand" },
];

describe("Toc", () => {
  it("renders the sidebar variant by default, hidden below xl", () => {
    const { container } = render(<Toc items={ITEMS} />);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    expect(nav.className).toContain("hidden");
    expect(nav.className).toContain("xl:block");
    expect(container.querySelector("details")).toBeNull();
    expect(screen.getByRole("link", { name: "In demand" })).toHaveAttribute("href", "#in-demand");
  });

  it("renders the mobile variant as a collapsed disclosure holding the same links", () => {
    render(<Toc items={ITEMS} mobile />);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    expect(nav.className).toContain("xl:hidden");

    const details = screen.getByText("On this page").closest("details") as HTMLDetailsElement;
    expect(details).not.toBeNull();
    expect(details.open).toBe(false);

    const links = Array.from(details.querySelectorAll("a"));
    expect(links.map((a) => a.getAttribute("href"))).toEqual(["#warning", "#in-demand"]);
    expect(links.map((a) => a.textContent)).toEqual(["Warning label", "In demand"]);
  });

  it("renders nothing without items", () => {
    const { container } = render(<Toc items={[]} mobile />);
    expect(container).toBeEmptyDOMElement();
  });
});
