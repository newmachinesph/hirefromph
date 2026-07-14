"use client";

import * as Phosphor from "@phosphor-icons/react";
import type { ComponentType } from "react";

/**
 * DevUp icon set — Phosphor Icons, resolved by the kebab names stored in JSON.
 * Most names map straight through (kebab -> PascalCase). The map below covers
 * the ones whose Phosphor name differs, so nothing falls back silently.
 */
const NAME_MAP: Record<string, string> = {
  award: "Medal",
  "badge-check": "SealCheck",
  banknote: "Money",
  battery: "BatteryHigh",
  bot: "Robot",
  boxes: "Stack",
  "building-2": "Buildings",
  "calendar-clock": "CalendarBlank",
  "calendar-days": "CalendarDots",
  "check-circle-2": "CheckCircle",
  clapperboard: "FilmSlate",
  "clipboard-check": "ClipboardText",
  "clipboard-list": "ClipboardText",
  "clipboard-paste": "ClipboardText",
  "file-signature": "FileText",
  gem: "Diamond",
  "git-compare": "GitDiff",
  "heart-handshake": "Handshake",
  "help-circle": "Question",
  home: "House",
  inbox: "Tray",
  "key-round": "Key",
  languages: "Translate",
  layers: "Stack",
  "layout-dashboard": "SquaresFour",
  "layout-grid": "GridFour",
  "layout-template": "Layout",
  library: "Books",
  "life-buoy": "Lifebuoy",
  mail: "Envelope",
  "memory-stick": "Memory",
  "message-circle": "ChatCircle",
  "message-square": "Chat",
  "message-square-quote": "ChatText",
  "messages-square": "Chats",
  mic: "Microphone",
  "package-check": "Package",
  "pen-line": "PenNib",
  "pen-tool": "PenNib",
  pickaxe: "Hammer",
  "pie-chart": "ChartPie",
  puzzle: "PuzzlePiece",
  quote: "Quotes",
  "receipt-text": "Receipt",
  "refresh-ccw": "ArrowsClockwise",
  "rotate-ccw": "ArrowCounterClockwise",
  save: "FloppyDisk",
  scale: "Scales",
  "scan-eye": "Scan",
  "scan-search": "Scan",
  search: "MagnifyingGlass",
  "search-check": "MagnifyingGlass",
  send: "PaperPlaneTilt",
  "shield-alert": "ShieldWarning",
  smile: "Smiley",
  sparkles: "Sparkle",
  split: "GitFork",
  sunrise: "SunHorizon",
  "trending-up": "TrendUp",
  unlock: "LockOpen",
  "user-round": "User",
  "user-search": "UserFocus",
  wifi: "WifiHigh",
  workflow: "FlowArrow",
  zap: "Lightning",
};

function toPascal(name: string): string {
  return name
    .split(/[-_ ]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

type IconProps = {
  name: string;
  size?: number | string;
  className?: string;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
};

export function Icon({ name, weight = "regular", ...rest }: IconProps) {
  const key = NAME_MAP[name] ?? toPascal(name);
  const registry = Phosphor as unknown as Record<
    string,
    ComponentType<{ size?: number | string; className?: string; weight?: string }>
  >;
  const Cmp = registry[key] ?? Phosphor.Sparkle;
  return <Cmp weight={weight} {...rest} />;
}
