"use client";

import { useState } from "react";
import { Check, Download } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  filename: string;
  label?: string;
  className?: string;
};

/** Downloads `value` as a text/markdown file. The artifact is the user's own
 * words — the whole point of Build Labs is that you leave owning it. */
export function DownloadButton({ value, filename, label = "Download .md", className }: Props) {
  const [done, setDone] = useState(false);

  function handleDownload() {
    const blob = new Blob([value], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setDone(true);
    setTimeout(() => setDone(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-paper-2 px-3.5 py-1.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink hover:text-ink",
        done && "border-verified text-verified hover:border-verified hover:text-verified",
        className,
      )}
    >
      {done ? <Check size={15} /> : <Download size={15} />}
      {done ? "Saved" : label}
    </button>
  );
}
