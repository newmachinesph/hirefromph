import { sendGAEvent } from "@next/third-parties/google";

/**
 * Fire a GA4 custom event. Client-only; wrapped so analytics can never
 * throw into the UI. Call from event handlers in client components.
 */
export function track(
  event: string,
  params: Record<string, string | number> = {},
): void {
  try {
    sendGAEvent("event", event, params);
  } catch {
    /* analytics is best-effort — never break the interaction */
  }
}
