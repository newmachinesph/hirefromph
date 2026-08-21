import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { KitPage } from "@/components/kit/kit-page";
import { KIT_LICENSE } from "@/lib/educators";

describe("KitPage", () => {
  it("prints the licence attribution and the page number on every sheet", () => {
    render(
      <KitPage n={2} of={4}>
        <p>Run-sheet body</p>
      </KitPage>,
    );
    expect(screen.getByText(KIT_LICENSE.attribution)).toBeInTheDocument();
    expect(screen.getByText("2 / 4")).toBeInTheDocument();
  });

  it("declares the paper size once, on the first sheet only", () => {
    const { container: first } = render(
      <KitPage size="a4-landscape" n={1} of={2}>
        <p>one</p>
      </KitPage>,
    );
    const style = first.querySelector("style");
    expect(style?.innerHTML).toContain("@page");
    expect(style?.innerHTML).toContain("A4 landscape");
    expect(style?.innerHTML).toContain("margin: 0");

    const { container: second } = render(
      <KitPage size="a4-landscape" n={2} of={2}>
        <p>two</p>
      </KitPage>,
    );
    expect(second.querySelector("style")).toBeNull();
  });

  it("carries the size and navy modifiers on the sheet element", () => {
    const { container } = render(
      <KitPage size="slide" n={1} of={16} navy>
        <p>title slide</p>
      </KitPage>,
    );
    const sheet = container.querySelector(".kit-page");
    expect(sheet?.className).toContain("kit-page--slide");
    expect(sheet?.className).toContain("kit-page--navy");
  });
});
