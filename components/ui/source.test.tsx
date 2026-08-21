import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Source, SourceList } from "@/components/ui/source";
import { Stat, StatStrip } from "@/components/ui/stat";

describe("Source", () => {
  it("renders the label as a safe external link", () => {
    render(<Source label="PSA Labour Force Survey" url="https://psa.gov.ph/lfs" />);
    const link = screen.getByRole("link", { name: "PSA Labour Force Survey" });
    expect(link).toHaveAttribute("href", "https://psa.gov.ph/lfs");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows the date when one is given", () => {
    render(
      <Source label="PSA Labour Force Survey" url="https://psa.gov.ph/lfs" date="2026-03-01" />,
    );
    expect(screen.getByText(/2026-03-01/)).toBeInTheDocument();
  });

  it("flags vendor-grade data and stays quiet for primary sources", () => {
    const { unmount } = render(
      <Source label="Agency rate guide" url="https://example.com/guide" grade="vendor" />,
    );
    expect(screen.getByText("Vendor-grade")).toBeInTheDocument();
    unmount();

    render(<Source label="PSA Labour Force Survey" url="https://psa.gov.ph/lfs" />);
    expect(screen.queryByText("Vendor-grade")).toBeNull();
  });

  it("SourceList renders one item per source", () => {
    render(
      <SourceList
        sources={[
          { label: "PSA", url: "https://psa.gov.ph" },
          { label: "BIR", url: "https://bir.gov.ph" },
        ]}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});

describe("Stat", () => {
  it("renders inside its own dl when used standalone", () => {
    const { container } = render(<Stat value="5" label="stages" />);
    expect(container.querySelector("dl > div > dt")).not.toBeNull();
  });

  it("every Stat in a StatStrip owns a valid dl (dt before dd), and the strip itself is not a dl", () => {
    const { container } = render(
      <StatStrip>
        <Stat value="5" label="stages" />
        <Stat value="12" label="days" />
      </StatStrip>,
    );
    const lists = container.querySelectorAll("dl");
    expect(lists).toHaveLength(2);
    lists.forEach((dl) => {
      expect(dl.querySelector("dt")).not.toBeNull();
      expect(dl.querySelector("dd")).not.toBeNull();
    });
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });
});
