import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { ICON_NAMES, Icon } from "@/components/ui/icon";

describe("Icon", () => {
  it("exposes every registry name, sorted", () => {
    expect(ICON_NAMES.length).toBeGreaterThan(100);
    expect(ICON_NAMES).toContain("compass");
    expect(ICON_NAMES).toContain("arrow-right");
    expect([...ICON_NAMES]).toEqual([...ICON_NAMES].sort());
  });

  it("renders an svg for a known name", () => {
    const { container } = render(<Icon name="compass" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("falls back instead of crashing on an unknown name", () => {
    const { container } = render(<Icon name="definitely-not-an-icon" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("is decorative by default and labelled on request", () => {
    const { container: plain } = render(<Icon name="compass" />);
    expect(plain.querySelector("svg")).toHaveAttribute("aria-hidden", "true");

    const { container: labelled } = render(
      <Icon name="compass" aria-label="Open the method" />,
    );
    const svg = labelled.querySelector("svg");
    expect(svg).not.toHaveAttribute("aria-hidden");
    expect(svg).toHaveAttribute("aria-label", "Open the method");
  });

  it("passes className through", () => {
    const { container } = render(<Icon name="compass" className="text-primary" />);
    expect(container.querySelector("svg")).toHaveClass("text-primary");
  });
});
