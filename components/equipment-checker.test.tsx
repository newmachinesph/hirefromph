import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import equipment from "@/data/equipment.json";
import { PathProvider } from "@/lib/path-context";
import { EquipmentChecker } from "@/components/equipment-checker";

const renderChecker = () =>
  render(
    <PathProvider>
      <EquipmentChecker categories={equipment.categories} />
    </PathProvider>,
  );

describe("EquipmentChecker", () => {
  it("renders one card per category with a tier group", async () => {
    renderChecker();
    expect((await screen.findAllByRole("group")).length).toBe(equipment.categories.length);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("ticking 'I already have this' moves the readiness bar", async () => {
    const user = userEvent.setup();
    renderChecker();
    const boxes = await screen.findAllByRole("checkbox", { name: /i already have this/i });
    const before = screen.getByRole("progressbar").getAttribute("aria-valuenow");
    await user.click(boxes[0]);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).not.toBe(before);
  });
});
