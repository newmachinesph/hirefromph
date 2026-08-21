import type { ImgHTMLAttributes } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// next/image needs the Next image loader; the stub keeps the assertions on the
// markup Figure owns (src, alt, caption, placeholder).
vi.mock("next/image", () => ({
  default: ({ src, alt, ...rest }: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={typeof src === "string" ? src : ""} alt={alt ?? ""} {...rest} />
  ),
}));

vi.mock("@/lib/visuals", () => ({
  getVisual: (id: string) => {
    if (id === "home-hero") {
      return {
        id: "home-hero",
        src: { webp: "/images/home-hero.webp", jpg: "/images/home-hero.jpg" },
        width: 1200,
        height: 1500,
        alt: "A woman reviews a spreadsheet at a home desk",
        generated: true,
      };
    }
    if (id === "journey-map") {
      return {
        id: "journey-map",
        src: { jpg: "/images/journey-map.jpg" },
        width: 1200,
        height: 800,
        alt: "The five stages laid out left to right",
        caption: "The path, end to end",
      };
    }
    return undefined;
  },
  listVisuals: () => [],
  normaliseManifest: () => [],
}));

import { Figure } from "@/components/ui/figure";

describe("Figure", () => {
  it("always captions a generated image as illustrative", () => {
    render(<Figure id="home-hero" ratio="hero" />);
    expect(
      screen.getByAltText("A woman reviews a spreadsheet at a home desk"),
    ).toBeInTheDocument();
    expect(screen.getByText(/Illustrative image/)).toBeInTheDocument();
  });

  it("keeps the author's caption alongside the illustrative note", () => {
    render(<Figure id="home-hero" caption="A corner desk in Cebu" />);
    const caption = screen.getByText(/Illustrative image/);
    expect(caption).toHaveTextContent("A corner desk in Cebu");
  });

  it("does not add the illustrative note to a non-generated image", () => {
    render(<Figure id="journey-map" />);
    expect(screen.getByText("The path, end to end")).toBeInTheDocument();
    expect(screen.queryByText(/Illustrative image/)).toBeNull();
  });

  it("renders a visible labelled placeholder for an unknown id, never a crash", () => {
    const { container } = render(<Figure id="not-generated-yet" ratio="3/2" />);
    expect(container.querySelector("img")).toBeNull();
    const placeholder = screen.getByRole("img", { name: /not-generated-yet/ });
    expect(placeholder).toBeInTheDocument();
    expect(screen.getByText(/Image not available/)).toBeInTheDocument();
  });

  it("accepts a direct src without touching the manifest", () => {
    render(
      <Figure
        src="/images/one-off.jpg"
        alt="A printed checklist beside a laptop"
        width={1200}
        height={800}
      />,
    );
    const img = screen.getByAltText("A printed checklist beside a laptop");
    expect(img).toHaveAttribute("src", "/images/one-off.jpg");
  });
});
