/**
 * iCalendar export for the 30-day plan (spec §7.4.4).
 *
 * RFC 5545, the parts that matter here:
 *  - §3.1  lines are CRLF-terminated and folded at 75 *octets* with CRLF + one
 *          leading space; a folded line must never split a character.
 *  - §3.3.11 TEXT values escape backslash, semicolon, comma, and newline.
 *  - §3.6.1 an all-day event uses `VALUE=DATE` and an *exclusive* DTEND, so a
 *          one-day event ends on the following date.
 *  - §3.8.4.7 UID must be stable: re-exporting an unchanged plan has to update
 *          the same events rather than duplicate them in the visitor's calendar.
 *
 * Nothing here reads the clock. `stamp` defaults to midnight UTC on the start
 * date so two exports of the same plan are byte-identical.
 */

import { addDays, type IsoDate } from "./dates";

export type IcsDay = { n: number; title: string; desc?: string };

export type IcsPlan = {
  title: string;
  startDate: IsoDate;
  days: readonly IcsDay[];
  /** Domain half of the UID. Only change it in a test. */
  uidNamespace?: string;
  /** `YYYYMMDDTHHMMSSZ`. Defaults to midnight UTC on `startDate`. */
  stamp?: string;
};

const MAX_OCTETS = 75;

export function toIcsDate(iso: IsoDate): string {
  return iso.replace(/-/g, "");
}

export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

const encoder = new TextEncoder();

export function foldLine(line: string): string {
  if (encoder.encode(line).length <= MAX_OCTETS) return line;

  const chunks: string[] = [];
  let current = "";
  let octets = 0;
  // The first chunk gets all 75 octets; every continuation spends one on the
  // leading space the unfolder strips back off.
  let limit = MAX_OCTETS;

  for (const char of line) {
    const size = encoder.encode(char).length;
    if (octets + size > limit) {
      chunks.push(current);
      current = "";
      octets = 0;
      limit = MAX_OCTETS - 1;
    }
    current += char;
    octets += size;
  }
  chunks.push(current);

  return chunks.join("\r\n ");
}

export function planToIcs({
  title,
  startDate,
  days,
  uidNamespace = "hirefrom.ph",
  stamp,
}: IcsPlan): string {
  const dtstamp = stamp ?? `${toIcsDate(startDate)}T000000Z`;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hire From PH//Practice layer//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(title)}`,
  ];

  for (const day of days) {
    const start = addDays(startDate, day.n - 1);
    lines.push(
      "BEGIN:VEVENT",
      `UID:hfph-plan-day-${day.n}@${uidNamespace}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${toIcsDate(start)}`,
      `DTEND;VALUE=DATE:${toIcsDate(addDays(start, 1))}`,
      `SUMMARY:${escapeText(`Day ${day.n} — ${day.title}`)}`,
    );
    if (day.desc) lines.push(`DESCRIPTION:${escapeText(day.desc)}`);
    lines.push("TRANSP:TRANSPARENT", "END:VEVENT");
  }

  lines.push("END:VCALENDAR");

  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
