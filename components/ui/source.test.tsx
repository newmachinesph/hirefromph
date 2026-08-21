import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Source, SourceList } from "@/components/ui/source";

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
