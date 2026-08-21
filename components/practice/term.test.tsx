import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Term } from "@/components/practice/term";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Term", () => {
  it("leaves the sentence alone when the id is unknown", () => {
    render(
      <p>
        A <Term id="not-a-term">retainer</Term> is fine.
      </p>,
    );
    expect(screen.getByText(/A retainer is fine\./)).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders the term as a button that carries its definition for screen readers", () => {
    render(<Term id="retainer" />);
    const button = screen.getByRole("button", { name: "Retainer" });
    const describedBy = button.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy ?? "")).toHaveTextContent(
      /A fixed monthly fee for an agreed scope/,
    );
  });

  it("keeps the popover closed until it is asked for", () => {
    render(<Term id="retainer" />);
    expect(screen.getByRole("button", { name: "Retainer" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("opens the popover on click and closes it on Escape", async () => {
    const user = userEvent.setup();
    render(<Term id="retainer" />);
    const button = screen.getByRole("button", { name: "Retainer" });

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("note")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  it("shows the Taglish gloss and the link to the guide", async () => {
    const user = userEvent.setup();
    render(<Term id="retainer" />);
    await user.click(screen.getByRole("button", { name: "Retainer" }));
    expect(screen.getByText(/Buwanang bayad/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Where this is explained/i })).toHaveAttribute(
      "href",
      "/salary",
    );
  });

  it("uses the author's wording when children are given", () => {
    render(<Term id="retainer">retainers</Term>);
    expect(screen.getByRole("button", { name: "retainers" })).toBeInTheDocument();
  });
});
