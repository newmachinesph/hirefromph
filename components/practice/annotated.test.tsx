import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Annotated } from "@/components/practice/annotated";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: React.ComponentProps<"a">) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe("Annotated", () => {
  it("renders nothing for an id that does not exist", () => {
    const { container } = render(<Annotated exampleId="nope" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("puts the doctrine note above the example", () => {
    render(<Annotated exampleId="resume-junior" />);
    const note = screen.getByText(/Study it, extract the rules/);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(note.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders every hotspot as a button numbered in reading order", () => {
    render(<Annotated exampleId="resume-junior" />);
    const buttons = screen.getAllByTestId("hotspot");
    expect(buttons).toHaveLength(10);
    expect(buttons.map((button) => button.textContent)).toEqual(
      Array.from({ length: 10 }, (_, index) => String(index + 1)),
    );
  });

  it("names each hotspot for assistive technology rather than reading '1'", () => {
    render(<Annotated exampleId="resume-junior" />);
    expect(screen.getByRole("button", { name: /Note 1: One way to reach you/ })).toBeInTheDocument();
  });

  it("opens a dialog with the why and the rule, and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Annotated exampleId="resume-junior" />);
    await user.click(screen.getByRole("button", { name: /Note 1: One way to reach you/ }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/The header exists so a reader/)).toBeInTheDocument();
    expect(within(dialog).getByText(/One email, one link/)).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("links to the guide the example belongs to", () => {
    render(<Annotated exampleId="supplier-invoice" />);
    expect(screen.getByRole("link", { name: /Open the guide/i })).toHaveAttribute("href", "/legit");
  });
});
