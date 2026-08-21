"use client";

import { useId } from "react";
import { PRACTICE_KEYS, type FontSize } from "@/lib/practice-store";
import { cn } from "@/lib/utils";
import { Switch, Text } from "@/components/ui";
import { useReaderPrefs } from "./hooks";

/**
 * The pre-paint script (spec §5.2b: "applied as classes on `<html>` before
 * paint to avoid flicker").
 *
 * `app/layout.tsx` inlines this string as the first child of `<body>`, so it
 * runs before any page content is parsed. It is deliberately tiny, ES5, and
 * wrapped in try/catch: a blocked `localStorage` must cost the visitor a
 * preference, never a blank page. No template literals and no `</script`
 * substring, because it is injected with `dangerouslySetInnerHTML`.
 */
export const READER_SCRIPT =
  '(function(){try{var r=localStorage.getItem("' +
  PRACTICE_KEYS.reader +
  '");if(!r)return;var p=JSON.parse(r);if(!p||typeof p!=="object")return;var e=document.documentElement;var s=p.size;if(s==="sm"||s==="md"||s==="lg"){e.classList.add("text-size-"+s);}if(p.comfort===true){e.classList.add("reading-comfort");}if(p.lowData===true){e.classList.add("low-data");}}catch(err){}})();';

const SIZES: { value: FontSize; label: string }[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

/**
 * Font size, comfortable reading, and low-data mode (spec §7.4.7). Rendered in
 * the site footer and in the mobile drawer.
 */
export function ReaderControls({ layout = "stack" }: { layout?: "row" | "stack" }) {
  const baseId = useId();
  const { prefs, setPrefs } = useReaderPrefs();

  return (
    <div
      role="group"
      aria-label="Reading preferences"
      className={cn(
        "flex gap-5",
        layout === "row" ? "flex-row flex-wrap items-center" : "flex-col",
      )}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="text-kicker uppercase text-ink-faint">Text size</legend>
        <div className="flex gap-2">
          {SIZES.map((size) => (
            <label
              key={size.value}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center rounded-pill border px-4 py-2 text-small transition-colors duration-150 ease-out",
                prefs.size === size.value
                  ? "border-primary bg-primary-tint text-primary-deep"
                  : "border-line-strong text-ink-soft hover:border-ink hover:text-ink",
              )}
            >
              <input
                type="radio"
                name={`${baseId}-size`}
                value={size.value}
                checked={prefs.size === size.value}
                onChange={() => setPrefs({ ...prefs, size: size.value })}
                className="sr-only"
              />
              {size.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Switch
        checked={prefs.comfort}
        onChange={(next) => setPrefs({ ...prefs, comfort: next })}
        label="Comfortable reading"
      />

      <div className="flex flex-col gap-1">
        <Switch
          checked={prefs.lowData}
          onChange={(next) => setPrefs({ ...prefs, lowData: next })}
          label="Low-data mode"
        />
        <Text size="caption" tone="faint">
          Hides photographs. Diagrams and text stay.
        </Text>
      </div>
    </div>
  );
}
