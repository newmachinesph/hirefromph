import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Accordion, AccordionItem } from "@/components/ui/accordion";

function detailsFor(title: string) {
  return screen.getByText(title).closest("details") as HTMLDetailsElement;
}

describe("Accordion", () => {
  it("starts closed and opens on click", async () => {
    render(
      <Accordion>
        <AccordionItem id="free" title="Is it really free?">
          Yes. Walang bayad, walang catch.
        </AccordionItem>
      </Accordion>,
    );
    expect(detailsFor("Is it really free?").open).toBe(false);
    await userEvent.click(screen.getByText("Is it really free?"));
    expect(detailsFor("Is it really free?").open).toBe(true);
  });

  it("closes the open item in single mode", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="single">
        <AccordionItem id="a" title="Question one">
          Answer one
        </AccordionItem>
        <AccordionItem id="b" title="Question two">
          Answer two
        </AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByText("Question one"));
    expect(detailsFor("Question one").open).toBe(true);

    await user.click(screen.getByText("Question two"));
    expect(detailsFor("Question two").open).toBe(true);
    expect(detailsFor("Question one").open).toBe(false);
  });

  it("keeps several items open in multiple mode", async () => {
    const user = userEvent.setup();
    render(
      <Accordion type="multiple">
        <AccordionItem id="a" title="Question one">
          Answer one
        </AccordionItem>
        <AccordionItem id="b" title="Question two">
          Answer two
        </AccordionItem>
      </Accordion>,
    );
    await user.click(screen.getByText("Question one"));
    await user.click(screen.getByText("Question two"));
    expect(detailsFor("Question one").open).toBe(true);
    expect(detailsFor("Question two").open).toBe(true);
  });

  it("honours defaultOpen", () => {
    render(
      <Accordion type="single" defaultOpen="b">
        <AccordionItem id="a" title="Question one">
          Answer one
        </AccordionItem>
        <AccordionItem id="b" title="Question two">
          Answer two
        </AccordionItem>
      </Accordion>,
    );
    expect(detailsFor("Question two").open).toBe(true);
    expect(detailsFor("Question one").open).toBe(false);
  });
});
