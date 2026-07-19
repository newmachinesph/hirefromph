"use client";

import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <button
      type="button"
      onClick={handleCopy}
      aria-label={text}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-paper-2 px-3.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink",
        copied && "border-emerald text-emerald hover:border-emerald hover:text-emerald",
        failed && "border-coral text-coral hover:border-coral hover:text-coral",
        className,
      )}
    >
      {copied ? <Check size={15} /> : failed ? <X size={15} /> : <Copy size={15} />}
      {text}
    </button>
  );
}
