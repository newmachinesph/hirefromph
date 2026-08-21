"use client";

import { useState } from "react";
import { Button, Icon } from "@/components/ui";

type Props = {
  value: string;
  label?: string;
  className?: string;
};

// Legacy fallback for contexts without navigator.clipboard (http, older
// in-app WebViews — a real audience here). Returns whether the copy took.
function execCopy(value: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = value;
  ta.style.cssText = "position:fixed;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}

export function CopyButton({ value, label = "Copy", className }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(value);
      ok = true;
    } catch {
      ok = execCopy(value);
    }
    setStatus(ok ? "copied" : "failed");
    setTimeout(() => setStatus("idle"), 1600);
  }

  const copied = status === "copied";
  const failed = status === "failed";
  const text = copied ? "Copied" : failed ? "Copy blocked" : label;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      aria-label={text}
      className={className}
      icon={<Icon name={copied ? "check" : failed ? "x" : "copy"} size={15} />}
    >
      {text}
    </Button>
  );
}
