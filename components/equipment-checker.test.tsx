import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import equipment from "@/data/equipment.json";
import { PathProvider } from "@/lib/path-context";
import { COUNT_IN_LABEL, EquipmentChecker } from "@/components/equipment-checker";

const renderChecker = () =>
  render(
    <PathProvider>
      <EquipmentChecker categories={equipment.categories} />
    </PathProvider>,
  );

/** Mirrors the component's floor: the low end of the Standard tier, one-time ranges only. */
const lowEnd = (cat: (typeof equipment.categories)[number]) => {
  const tier = cat.tiers[Math.min(1, cat.tiers.length - 1)];
  if (/\/mo/i.test(tier.price)) return 0;
  const match = tier.price.replace(/,/g, "").match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

const pesos = (n: number) => `₱${n.toLocaleString("en-PH")}`;

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

  it("a blank visit totals the essentials only; optional items join when counted in", async () => {
    const user = userEvent.setup();
    renderChecker();
    await screen.findAllByRole("group");

    const essentials = equipment.categories.filter((c) => c.essential);
    const optionals = equipment.categories.filter((c) => !c.essential);
    const floor = essentials.reduce((sum, c) => sum + lowEnd(c), 0);
    expect(screen.getByText(pesos(floor))).toBeInTheDocument();

    const countIn = screen.getAllByRole("checkbox", { name: COUNT_IN_LABEL });
    expect(countIn.length).toBe(optionals.length);
    countIn.forEach((box) => expect(box).not.toBeChecked());

    await user.click(countIn[0]);
    expect(screen.getByText(pesos(floor + lowEnd(optionals[0])))).toBeInTheDocument();
  });

  it("the summary precedes the category cards in the DOM so it sits above them on a phone", async () => {
    renderChecker();
    const [firstBox] = await screen.findAllByRole("checkbox");
    const bar = screen.getByRole("progressbar");
    expect(bar.compareDocumentPosition(firstBox) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
