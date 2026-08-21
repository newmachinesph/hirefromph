import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

function describedText(el: HTMLElement) {
  const ids = (el.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean);
  return ids.map((id) => document.getElementById(id)?.textContent ?? "");
}

describe("Field", () => {
  it("associates the label with the control", () => {
    render(
      <Field label="Client rate">
        <Input defaultValue="25" />
      </Field>,
    );
    expect(screen.getByLabelText(/Client rate/)).toHaveValue("25");
  });

  it("wires a hint through aria-describedby", () => {
    render(
      <Field label="Email" hint="We never send anything here.">
        <Input type="email" />
      </Field>,
    );
    const input = screen.getByLabelText(/Email/);
    expect(describedText(input)).toEqual(["We never send anything here."]);
    expect(input).not.toHaveAttribute("aria-invalid");
  });

  it("wires hint and error together, hint first, and marks the control invalid", () => {
    render(
      <Field label="Email" hint="Use the one you check." error="Enter a valid email.">
        <Input type="email" />
      </Field>,
    );
    const input = screen.getByLabelText(/Email/);
    expect(describedText(input)).toEqual([
      "Use the one you check.",
      "Enter a valid email.",
    ]);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email.");
  });

  it("propagates required to the control", () => {
    render(
      <Field label="Niche" required>
        <Input />
      </Field>,
    );
    expect(screen.getByLabelText(/Niche/)).toBeRequired();
  });

  it("renders a fieldset in group mode", () => {
    render(
      <Field as="group" label="Pick a stage" hint="You can change this later.">
        <Input aria-label="Stage one" />
      </Field>,
    );
    const group = screen.getByRole("group", { name: /Pick a stage/ });
    expect(group.tagName).toBe("FIELDSET");
    expect(describedText(group)).toEqual(["You can change this later."]);
  });
});

describe("Switch", () => {
  it("exposes switch semantics and toggles", async () => {
    function Harness() {
      const [on, setOn] = useState(false);
      return <Switch checked={on} onChange={setOn} label="Comfortable reading" />;
    }
    render(<Harness />);
    const control = screen.getByRole("switch", { name: "Comfortable reading" });
    expect(control).toHaveAttribute("aria-checked", "false");
    await userEvent.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("does not fire when disabled", async () => {
    const onChange = vi.fn();
    render(
      <Switch checked={false} onChange={onChange} label="Low-data mode" disabled />,
    );
    await userEvent.click(screen.getByRole("switch", { name: "Low-data mode" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
