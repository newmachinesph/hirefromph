import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileDrawer } from "@/components/site/mobile-drawer";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

async function openDrawer() {
  const user = userEvent.setup();
  render(<MobileDrawer />);
  await user.click(screen.getByRole("button", { name: /open menu/i }));
  return user;
}

describe("MobileDrawer", () => {
  it("renders nothing but the trigger until it is opened", () => {
    render(<MobileDrawer />);
    expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Find your path" })).toBeNull();
  });

  it("puts the CTA above the accordion groups", async () => {
    await openDrawer();
    const cta = screen.getByRole("link", { name: "Find your path" });
    const learn = screen.getByText("Learn");
    expect(cta.compareDocumentPosition(learn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders one accordion group per dropdown", async () => {
    await openDrawer();
    for (const label of ["Path", "Learn", "Work"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "The Method" })).toBeInTheDocument();
  });

  it("renders Reality Check as a direct link, not a group", async () => {
    await openDrawer();
    expect(screen.getByRole("link", { name: "Reality Check" })).toHaveAttribute("href", "/reality");
  });

  it("puts Library and Privacy at the bottom and hides pending routes", async () => {
    await openDrawer();
    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute("href", "/library");
    expect(screen.getByRole("link", { name: "Privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.queryByRole("link", { name: /For educators/i })).toBeNull();
    expect(screen.queryByRole("link", { name: "Glossary" })).toBeNull();
  });

  it("focuses the CTA as the first focusable element when opened", async () => {
    await openDrawer();
    const cta = screen.getByRole("link", { name: "Find your path" });
    expect(document.activeElement).toBe(cta);
  });
});
