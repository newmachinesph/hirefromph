import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import learning from "@/data/learning.json";
import {
  ProtocolResult,
  StudyProtocol,
  buildProtocol,
  techniqueAnchor,
} from "@/components/study-protocol";

const ADVANCE_MS = 500;

/** One valid answer per question: the first option of each. */
const FIRST_ANSWERS = Object.fromEntries(
  learning.protocol.questions.map((q) => [q.id, q.options[0].value]),
);

describe("StudyProtocol", () => {
  it("renders the first question as a radio group", () => {
    render(<StudyProtocol />);
    expect(screen.getAllByRole("radio").length).toBeGreaterThan(1);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("choosing an option advances the wizard", async () => {
    const user = userEvent.setup();
    render(<StudyProtocol />);
    const first = screen.getAllByRole("radio")[0];
    const before = screen.getByRole("progressbar").getAttribute("aria-valuenow");
    await user.click(first);
    await new Promise((r) => setTimeout(r, ADVANCE_MS));
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).not.toBe(before);
  });

  it("keeps the after-result slot hidden until the protocol exists", () => {
    render(<StudyProtocol afterResult={<p>Start a session</p>} />);
    expect(screen.queryByText("Start a session")).not.toBeInTheDocument();
  });
});

describe("buildProtocol", () => {
  it("returns null until the shape and goal answers exist", () => {
    expect(buildProtocol({})).toBeNull();
    expect(buildProtocol({ attention: "short" })).toBeNull();
  });

  it("assembles three techniques and the copy text from a full answer set", () => {
    const summary = buildProtocol(FIRST_ANSWERS);
    expect(summary).not.toBeNull();
    expect(summary?.techniques).toHaveLength(3);
    expect(summary?.text).toContain("MY STUDY PROTOCOL");
    // The copy carries the how-to even though the card only links to it.
    expect(summary?.text).toContain(summary?.techniques[0].how ?? "");
  });
});

describe("ProtocolResult", () => {
  it("links each technique to its one explanation instead of repeating it", () => {
    const summary = buildProtocol(FIRST_ANSWERS);
    if (!summary) throw new Error("expected a protocol");
    render(
      <ProtocolResult summary={summary} onRestart={() => {}} after={<p>Start a session</p>} />,
    );

    expect(screen.getByText("Why this shape")).toBeInTheDocument();
    expect(screen.getByText("Start a session")).toBeInTheDocument();

    const links = screen.getAllByRole("link", { name: /how to run it/i });
    expect(links).toHaveLength(3);
    for (const [i, link] of links.entries()) {
      expect(link.getAttribute("href")).toBe(`#${techniqueAnchor(summary.techniques[i].id)}`);
    }
    for (const t of summary.techniques) {
      expect(screen.queryByText(t.how)).not.toBeInTheDocument();
    }
  });
});
