import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const choosePath = vi.fn();
vi.mock("@/lib/path-context", () => ({
  usePath: () => ({ state: { track: null }, choosePath, hydrated: true }),
}));

const report = vi.fn();
vi.mock("@/lib/analytics", () => ({ track: (...args: unknown[]) => report(...args) }));

import { PathChooser } from "@/components/journey/path-chooser";

describe("PathChooser", () => {
  it("shows every track when no limit is given", () => {
    render(<PathChooser />);
    expect(screen.getAllByRole("radio")).toHaveLength(22);
  });

  it("shows only the featured subset, strongest demand first", () => {
    render(<PathChooser limit={6} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(6);
    expect(radios[0]).toHaveAccessibleName(/AI Agent Operations/);
    expect(screen.queryByRole("radio", { name: /Localization/ })).toBeNull();
  });

  it("renders the more-link when one is configured", () => {
    render(<PathChooser limit={6} moreHref="/niches" moreLabel="See all 22 niches" />);
    expect(screen.getByRole("link", { name: "See all 22 niches" })).toHaveAttribute(
      "href",
      "/niches",
    );
  });

  it("renders no more-link by default", () => {
    render(<PathChooser limit={6} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("names the group for assistive technology", () => {
    render(<PathChooser limit={2} />);
    expect(screen.getByRole("group", { name: /Pick your lane/i })).toBeInTheDocument();
  });

  it("saves the choice, reports it, and redirects when asked", async () => {
    const user = userEvent.setup();
    render(<PathChooser limit={3} redirectTo="/path" />);
    await user.click(screen.getAllByRole("radio")[0]);
    expect(report).toHaveBeenCalledWith("path_chosen", { track: "ai-agent-ops" });
    expect(choosePath).toHaveBeenCalledWith("ai-agent-ops");
    expect(push).toHaveBeenCalledWith("/path");
  });
});
