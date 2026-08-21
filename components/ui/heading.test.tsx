import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

describe("Heading", () => {
  it("keeps the semantic level independent of the visual size", () => {
    render(
      <Heading level={3} size="h5">
        Tools for this stage
      </Heading>,
    );
    const heading = screen.getByRole("heading", { level: 3 });
    expect(heading.tagName).toBe("H3");
    expect(heading.className).toContain("text-h5");
  });

  it("colours the trailing accent segment on a hero headline", () => {
    const { container } = render(
      <Heading level={1} size="hero" accent="online.">
        Build a career
      </Heading>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Build a career online.");
    const accent = container.querySelector(".text-primary");
    expect(accent).not.toBeNull();
    expect(accent).toHaveTextContent("online.");
  });

  it("still renders the accent copy at smaller sizes, uncoloured", () => {
    const { container } = render(
      <Heading level={2} size="h2" accent="that pays.">
        Work
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Work that pays.",
    );
    expect(container.querySelector(".text-primary")).toBeNull();
  });

  it("passes id through so Toc anchors resolve", () => {
    render(
      <Heading level={2} id="how">
        How it works
      </Heading>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", "how");
  });
});

describe("Text", () => {
  it("defaults to base size and soft ink", () => {
    render(<Text>Every number has a source.</Text>);
    const text = screen.getByText("Every number has a source.");
    expect(text.tagName).toBe("P");
    expect(text.className).toContain("text-ink-soft");
  });

  it("maps size and tone onto the token utilities", () => {
    render(
      <Text size="caption" tone="faint">
        Illustrative image
      </Text>,
    );
    const text = screen.getByText("Illustrative image");
    expect(text.className).toContain("text-caption");
    expect(text.className).toContain("text-ink-faint");
  });

  it("can render as another element", () => {
    render(
      <Text as="span" tone="inherit">
        inline
      </Text>,
    );
    expect(screen.getByText("inline").tagName).toBe("SPAN");
  });
});
