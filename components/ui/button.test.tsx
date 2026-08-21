import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// next/link needs the App Router context, which jsdom cannot provide. The stub
// keeps every assertion on markup this component owns (href, target, rel).
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders an internal link when href is set", () => {
    render(<Button href="/start">Find your path</Button>);
    const link = screen.getByRole("link", { name: "Find your path" });
    expect(link).toHaveAttribute("href", "/start");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens external links in a new tab with a safe rel", () => {
    render(
      <Button href="https://psa.gov.ph" external variant="outline">
        Read the source
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Read the source" });
    expect(link).toHaveAttribute("href", "https://psa.gov.ph");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders a real button when there is no href", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("honours type=submit", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("never renders a disabled link", () => {
    render(
      <Button href="/start" disabled>
        Find your path
      </Button>,
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByRole("button", { name: "Find your path" })).toBeDisabled();
  });

  it("renders leading and trailing slots", () => {
    render(
      <Button icon={<span data-testid="lead" />} iconEnd={<span data-testid="trail" />}>
        Continue
      </Button>,
    );
    expect(screen.getByTestId("lead")).toBeInTheDocument();
    expect(screen.getByTestId("trail")).toBeInTheDocument();
  });
});
