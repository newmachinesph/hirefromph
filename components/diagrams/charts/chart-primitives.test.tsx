import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Bars, Legend, Line } from "@/components/diagrams/charts";

describe("Bars", () => {
  it("draws one primary bar per datum and prints every value", () => {
    const { container, getByText } = render(
      <Bars
        data={[
          { id: "a", label: "Writing", value: 21 },
          { id: "b", label: "Coding", value: -12, focal: true },
        ]}
        diverging
        format={(v) => `${v > 0 ? "+" : "−"}${Math.abs(v)}%`}
      />,
    );
    expect(container.querySelectorAll("rect[rx='4']")).toHaveLength(2);
    expect(getByText("Writing")).toBeInTheDocument();
    expect(getByText("+21%")).toBeInTheDocument();
  });

  it("adds a second dashed bar when a datum carries `compare`", () => {
    const { container } = render(
      <Bars data={[{ id: "a", label: "Autonomy", value: 84, compare: 45 }]} />,
    );
    expect(container.querySelectorAll("rect[stroke-dasharray]")).toHaveLength(1);
  });

  it("draws the reference line when one is given", () => {
    const { container, getByText } = render(
      <Bars
        data={[{ id: "a", label: "Reading", value: 560 }]}
        max={800}
        reference={{ value: 488, label: "global average" }}
      />,
    );
    expect(getByText("global average")).toBeInTheDocument();
    expect(container.querySelectorAll("line[stroke-dasharray='4 3']")).toHaveLength(1);
  });
});

describe("Line", () => {
  it("draws one path per series and a dot only on the focal one", () => {
    const { container } = render(
      <Line
        series={[
          {
            id: "base",
            label: "Baseline",
            points: [
              { x: 0, y: 10 },
              { x: 1, y: 12 },
            ],
            dashed: true,
          },
          {
            id: "path",
            label: "Your path",
            points: [
              { x: 0, y: 10 },
              { x: 1, y: 30 },
            ],
            focal: true,
          },
        ]}
        xDomain={[0, 1]}
        yDomain={[0, 40]}
      />,
    );
    expect(container.querySelectorAll("path[fill='none']")).toHaveLength(2);
    expect(container.querySelectorAll("circle")).toHaveLength(1);
  });

  it("draws the risk band as a filled polygon when asked", () => {
    const { container } = render(
      <Line
        series={[
          {
            id: "path",
            label: "Your path",
            points: [
              { x: 0, y: 10 },
              { x: 1, y: 30 },
            ],
            focal: true,
          },
        ]}
        xDomain={[0, 1]}
        yDomain={[0, 40]}
        band={{ seriesId: "path", drop: 0.31 }}
      />,
    );
    expect(container.querySelectorAll("path[fill='var(--primary)']")).toHaveLength(1);
  });
});

describe("Legend", () => {
  it("renders one list item per key with its label as real text", () => {
    const { getAllByRole, getByText } = render(
      <Legend
        items={[
          { id: "base", label: "If you stay generic", kind: "dashed" },
          { id: "path", label: "Your path", kind: "line", focal: true },
        ]}
      />,
    );
    expect(getAllByRole("listitem")).toHaveLength(2);
    expect(getByText("Your path")).toBeInTheDocument();
  });
});
