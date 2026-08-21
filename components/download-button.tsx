"use client";

import { useState } from "react";
import { Button, Icon } from "@/components/ui";

type Props = {
  value: string;
  filename: string;
  label?: string;
  className?: string;
};

/** Downloads `value` as a text/markdown file. The artifact is the user's own
 * words — the whole point of Build Labs is that you leave owning it. */
export function DownloadButton({
  value,
  filename,
  label = "Download .md",
  className,
}: Props) {
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
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      aria-label={label}
      className={className}
      icon={<Icon name={done ? "check" : "download"} size={15} />}
    >
      {done ? "Saved" : label}
    </Button>
  );
}
