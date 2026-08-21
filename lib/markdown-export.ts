/**
 * Client-side file export (spec §7.4.4).
 *
 * THE RULE: export is for what the user wrote; never for anything we wrote.
 * `labToMarkdown` drops every section the visitor left empty for exactly that
 * reason — a downloaded file must not contain our prompts, our examples, or
 * our copy, only their answers. Anything a visitor could rename and pass off
 * as their own work has no business in a download.
 */

export type MarkdownSection = { label: string; body: string };

export function labToMarkdown(
  title: string,
  sections: readonly MarkdownSection[],
): string {
  const written = sections
    .map((section) => ({ label: section.label, body: section.body.trim() }))
    .filter((section) => section.body.length > 0);

  const blocks = [
    `# ${title}`,
    ...written.map((section) => `## ${section.label}\n\n${section.body}`),
  ];

  return `${blocks.join("\n\n")}\n`;
}

export const CSV_BOM = "﻿";

/** RFC 4180: quote when the cell holds a comma, quote, CR, LF, or edge space. */
function csvCell(value: string): string {
  const needsQuotes = /[",\r\n]/.test(value) || value !== value.trim();
  if (!needsQuotes) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

export function rowsToCsv(
  header: readonly string[],
  rows: readonly (readonly string[])[],
): string {
  const lines = [header, ...rows].map((row) => row.map(csvCell).join(","));
  return lines.join("\r\n");
}

export type ExportMime =
  | "text/markdown;charset=utf-8"
  | "text/calendar;charset=utf-8"
  | "text/csv;charset=utf-8";

export function safeFilename(value: string, extension: string): string {
  const stem = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${stem || "hire-from-ph"}.${extension}`;
}

export function downloadText(filename: string, text: string, mime: ExportMime): void {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    // The anchor and the object URL are cleaned up even when a browser policy
    // blocks the click, so a blocked download never leaks memory or DOM.
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}
