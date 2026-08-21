"use client";

import { useState } from "react";
import {
  CSV_BOM,
  downloadText,
  type ExportMime,
} from "@/lib/markdown-export";
import { Button, Icon, type ButtonSize, type ButtonVariant } from "@/components/ui";

export type ExportKind = "markdown" | "ics" | "csv";

const MIME: Record<ExportKind, ExportMime> = {
  markdown: "text/markdown;charset=utf-8",
  ics: "text/calendar;charset=utf-8",
  csv: "text/csv;charset=utf-8",
};

const DEFAULT_LABEL: Record<ExportKind, string> = {
  markdown: "Download Markdown",
  ics: "Add to calendar",
  csv: "Download CSV",
};

const ICON: Record<ExportKind, string> = {
  markdown: "file-text",
  ics: "calendar-days",
  csv: "table",
};

export type ExportButtonProps = {
  /** What the file is, in the visitor's terms. Used for the accessible name. */
  title: string;
  kind: ExportKind;
  filename: string;
  /** Runs at click time — nothing is serialised until the visitor asks. */
  build: () => string;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
};

/**
 * THE RULE (spec §7.4.4, BUILD_GUIDE): export is for what the user wrote;
 * never for anything we wrote. Every `build` closure at every call site must
 * read user state only — their answers, their oath, their applications, their
 * plan-day ticks. A finished deliverable somebody could rename and pass off as
 * their own work has no business coming out of this button.
 */
export function ExportButton({
  title,
  kind,
  filename,
  build,
  label,
  variant = "outline",
  size = "sm",
  disabled = false,
}: ExportButtonProps) {
  const [done, setDone] = useState(false);
  const text = label ?? DEFAULT_LABEL[kind];

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      aria-label={`${text} of ${title}`}
      icon={<Icon name={done ? "check-circle-2" : ICON[kind]} size={16} />}
      onClick={() => {
        const body = build();
        if (body.trim().length === 0) return;
        downloadText(filename, kind === "csv" ? CSV_BOM + body : body, MIME[kind]);
        setDone(true);
        window.setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? "Saved" : text}
    </Button>
  );
}
