import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs";

function Example() {
  return (
    <Tabs defaultValue="agency">
      <TabList label="Client type">
        <Tab value="agency">Agency</Tab>
        <Tab value="direct">Direct</Tab>
        <Tab value="platform">Platform</Tab>
      </TabList>
      <TabPanel value="agency">The agency holds the relationship.</TabPanel>
      <TabPanel value="direct">You hold the relationship.</TabPanel>
      <TabPanel value="platform">The platform holds the relationship.</TabPanel>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("shows only the selected panel", () => {
    render(<Example />);
    expect(screen.getByText("The agency holds the relationship.")).toBeInTheDocument();
    expect(screen.queryByText("You hold the relationship.")).toBeNull();
  });

  it("labels the tablist and wires each panel to its tab", () => {
    render(<Example />);
    expect(screen.getByRole("tablist", { name: "Client type" })).toBeInTheDocument();
    const selected = screen.getByRole("tab", { name: "Agency" });
    const panel = screen.getByRole("tabpanel");
    expect(selected).toHaveAttribute("aria-selected", "true");
    expect(panel).toHaveAttribute("aria-labelledby", selected.id);
  });

  it("uses a roving tabindex", () => {
    render(<Example />);
    expect(screen.getByRole("tab", { name: "Agency" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Direct" })).toHaveAttribute("tabindex", "-1");
  });

  it("moves selection with the arrow keys and wraps", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("tab", { name: "Agency" }));

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Direct" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("You hold the relationship.")).toBeInTheDocument();

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Platform" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("jumps to the first and last tab with Home and End", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("tab", { name: "Agency" }));

    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Platform" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "Agency" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
