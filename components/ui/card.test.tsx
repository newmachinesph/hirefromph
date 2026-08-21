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

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardFooter, CardMedia } from "@/components/ui/card";
import { Kicker } from "@/components/ui/kicker";

describe("Card", () => {
  it("is bordered and never shadowed or lifted", () => {
    render(<Card>Stage 1</Card>);
    const card = screen.getByText("Stage 1");
    expect(card.className).toContain("border-line");
    expect(card.className).toContain("rounded-md");
    expect(card.className).not.toContain("shadow");
    expect(card.className).not.toContain("translate");
  });

  it("uses the stronger hairline on a band", () => {
    render(<Card onBand>On band</Card>);
    expect(screen.getByText("On band").className).toContain("border-line-strong");
  });

  it("hovers on border and background only when interactive", () => {
    render(<Card interactive>Hover me</Card>);
    const card = screen.getByText("Hover me");
    expect(card.className).toContain("hover:border-ink");
    expect(card.className).toContain("hover:bg-band");
    expect(card.className).not.toContain("translate");
  });

  it("renders the whole card as a link when href is set", () => {
    render(
      <Card href="/start" padding="none">
        <CardMedia ratio="3/2">
          <div data-testid="media" />
        </CardMedia>
        <CardBody>Start here</CardBody>
        <CardFooter>Stage 1</CardFooter>
      </Card>,
    );
    const link = screen.getByRole("link", { name: /Start here/ });
    expect(link).toHaveAttribute("href", "/start");
    expect(screen.getByTestId("media")).toBeInTheDocument();
  });
});

describe("Badge", () => {
  it("defaults to a neutral soft pill", () => {
    render(<Badge>Guide</Badge>);
    const badge = screen.getByText("Guide");
    expect(badge.className).toContain("rounded-pill");
    expect(badge.className).toContain("bg-band");
  });

  it("takes its accent classes from lib/accent", () => {
    render(<Badge tone="verified">Sourced</Badge>);
    expect(screen.getByText("Sourced").className).toContain("bg-verified-tint");
  });

  it("outline variant has no fill", () => {
    render(
      <Badge tone="caution" variant="outline">
        Vendor-grade
      </Badge>,
    );
    const badge = screen.getByText("Vendor-grade");
    expect(badge.className).toContain("bg-transparent");
    expect(badge.className).toContain("border-caution");
  });
});

describe("Kicker", () => {
  it("renders an uppercase outlined pill with no dot", () => {
    const { container } = render(<Kicker>Stage 2 of 5</Kicker>);
    const kicker = screen.getByText("Stage 2 of 5");
    expect(kicker.className).toContain("uppercase");
    expect(kicker.className).toContain("rounded-pill");
    expect(container.querySelectorAll("span")).toHaveLength(1);
  });

  it("accepts an accent tone", () => {
    render(<Kicker tone="info">Notes</Kicker>);
    expect(screen.getByText("Notes").className).toContain("text-info");
  });
});
