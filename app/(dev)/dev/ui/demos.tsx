"use client";

import { useState } from "react";
import { Button, ChoiceCard, Dialog, Field, Range, Switch, Text } from "@/components/ui";

export function DialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Vet this opportunity"
        description="Five gates. If two fail, walk away."
      >
        <Text>
          Every dialog traps Tab, closes on Escape, locks the page behind it, and
          returns focus to whatever opened it.
        </Text>
        <div className="mt-5 flex gap-3">
          <Button onClick={() => setOpen(false)}>Got it</Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </Dialog>
    </>
  );
}

export function SwitchDemo() {
  const [comfortable, setComfortable] = useState(false);
  const [lowData, setLowData] = useState(true);
  return (
    <div className="flex flex-col gap-3">
      <Switch
        checked={comfortable}
        onChange={setComfortable}
        label="Comfortable reading"
      />
      <Switch checked={lowData} onChange={setLowData} label="Low-data mode" />
      <Switch checked={false} onChange={() => {}} label="Disabled" disabled />
    </div>
  );
}

export function RangeDemo() {
  const [hours, setHours] = useState(20);
  return (
    <Field label="Hours a week" hint="Used by the rate worksheet.">
      <Range
        min={5}
        max={40}
        step={1}
        value={hours}
        onChange={(event) => setHours(Number(event.target.value))}
        valueLabel={`${hours} hours`}
      />
    </Field>
  );
}

export function ChoiceCardDemo() {
  const [choice, setChoice] = useState("direct");
  return (
    <Field as="group" label="Who holds the relationship?" hint="Pick one.">
      <div className="grid gap-3 sm:grid-cols-2">
        <ChoiceCard
          name="relationship"
          value="agency"
          label="Agency"
          description="They own the client. You own your craft."
          checked={choice === "agency"}
          onChange={setChoice}
        />
        <ChoiceCard
          name="relationship"
          value="direct"
          label="Direct"
          description="You own the client and the invoice."
          checked={choice === "direct"}
          onChange={setChoice}
        />
      </div>
    </Field>
  );
}
