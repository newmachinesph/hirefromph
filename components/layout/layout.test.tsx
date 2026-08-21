import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// next/link needs the App Router context, which jsdom cannot provide.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";

describe("Breadcrumb", () => {
  it("is a labelled nav whose last crumb is the current page", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "The Path", href: "/start" },
          { label: "Stage 2" },
        ]}
      />,
    );
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");

    const current = screen.getByText("Stage 2");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current.tagName).not.toBe("A");
  });

  it("never links the final crumb even when it has an href", () => {
    render(
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Reality Check", href: "/reality" },
        ]}
      />,
    );
    expect(screen.queryByRole("link", { name: "Reality Check" })).toBeNull();
  });
});

describe("Container", () => {
  it("uses the content max-width and the gutter token by default", () => {
    render(<Container>content</Container>);
    const el = screen.getByText("content");
    expect(el.className).toContain("max-w-(--maxw)");
    expect(el.className).toContain("px-(--gutter)");
  });

  it("switches width tokens by size", () => {
    const { rerender } = render(<Container size="narrow">prose</Container>);
    expect(screen.getByText("prose").className).toContain("max-w-(--maxw-narrow)");

    rerender(<Container size="wide">bleed</Container>);
    expect(screen.getByText("bleed").className).toContain("max-w-(--maxw-wide)");
  });
});

describe("Section", () => {
  it("alternates bands and carries on-navy text on the ink band", () => {
    const { container, rerender } = render(<Section band="tint">band</Section>);
    expect(container.querySelector("section")?.className).toContain("bg-band");

    rerender(<Section band="navy">navy</Section>);
    const navy = container.querySelector("section");
    expect(navy?.className).toContain("bg-ink");
    expect(navy?.className).toContain("text-on-navy");
  });

  it("applies the rhythm tokens and can opt out", () => {
    const { container, rerender } = render(<Section>default</Section>);
    expect(container.querySelector("section")?.className).toContain("py-16");

    rerender(<Section spacing="hero">hero</Section>);
    expect(container.querySelector("section")?.className).toContain("py-20");

    rerender(<Section spacing="none">flush</Section>);
    const flush = container.querySelector("section");
    expect(flush?.className).not.toContain("py-16");
    expect(flush?.className).not.toContain("py-20");
  });
});
