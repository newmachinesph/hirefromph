import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import english from "@/data/english.json";
import {
  CommsLab,
  MIN_WORDS_FOR_VERDICT,
  readDirectness,
  scan,
} from "@/components/comms-lab";

const byId = (text: string, id: string) => scan(text).groups.find((g) => g.id === id);

describe("scan", () => {
  it("counts a stock opener as filler only, not filler plus a hedge", () => {
    const result = scan("I just wanted to reach out about the invoice.");
    expect(result.total).toBe(2);
    expect(byId("I just wanted to reach out about the invoice.", "hedges")).toBeUndefined();
    expect(result.groups.map((g) => g.id)).toEqual(["filler"]);
  });

  it("counts 'kindly revert' once, as dated, not dated plus deference", () => {
    const text = "Please kindly revert with the files.";
    expect(scan(text).total).toBe(1);
    expect(byId(text, "dated")?.phrases).toEqual([{ phrase: "kindly revert", count: 1 }]);
    expect(byId(text, "deference")).toBeUndefined();
  });

  it("still flags a bare hedge or deference marker on its own", () => {
    const text = "I think we should just ship it, sir.";
    expect(byId(text, "hedges")?.total).toBe(2);
    expect(byId(text, "deference")?.total).toBe(1);
  });

  it("reports groups in the banlist's order regardless of scan priority", () => {
    const text = "Sorry po, I just wanted to check in, maybe you could kindly review this?";
    const ids = scan(text).groups.map((g) => g.id);
    const banlistOrder = english.banlist.categories.map((c) => c.id);
    expect(ids).toEqual(banlistOrder.filter((id) => ids.includes(id)));
  });
});

describe("readDirectness", () => {
  it("withholds a verdict on a short clean message", () => {
    expect(readDirectness(scan("Shipping Thursday.")).label).toBe("Too short");
  });

  it("calls a long clean message direct", () => {
    const longClean = Array.from(
      { length: MIN_WORDS_FOR_VERDICT },
      (_, i) => `word${i}`,
    ).join(" ");
    expect(readDirectness(scan(longClean)).label).toBe("Direct");
  });
});

describe("CommsLab", () => {
  it("renders both passes with labelled textareas", () => {
    render(<CommsLab />);
    expect(screen.getByLabelText(/paste a real message/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your rewrite/i)).toBeInTheDocument();
  });

  it("flags a hedged message as you type", async () => {
    const user = userEvent.setup();
    render(<CommsLab />);
    await user.type(
      screen.getByLabelText(/paste a real message/i),
      "Sorry po, I just wanted to check in, maybe you could kindly review this?",
    );
    expect(screen.getAllByText(/sorry/i).length).toBeGreaterThan(0);
  });

  it("fills the first textarea with the sample message on request", async () => {
    const user = userEvent.setup();
    render(<CommsLab />);
    await user.click(screen.getByRole("button", { name: english.lab.sampleLabel }));
    expect(screen.getByLabelText(/paste a real message/i)).toHaveValue(english.lab.sample);
    // The banlist copy also quotes the phrase, so look for the flag badge, not a unique node.
    expect(screen.getAllByText(/revert back/i).length).toBeGreaterThan(1);
  });

  it("keys the clean-scan copy off word count, not just zero flags", async () => {
    const user = userEvent.setup();
    render(<CommsLab />);
    const box = screen.getByLabelText(/paste a real message/i);
    await user.type(box, "Shipping Thursday.");
    expect(screen.getAllByText(english.lab.cleanShortBody).length).toBeGreaterThan(0);
  });
});
