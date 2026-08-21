"use client";

import Link from "next/link";
import { Button, Icon } from "@/components/ui";
import trackNames from "@/data/track-names.json";
import { NAV_CTA } from "@/lib/nav";
import { usePath } from "@/lib/path-context";

/**
 * "Find your path" until a track is chosen, then the track pill (spec §6.1).
 * Reads the slim track-names map so the always-loaded header never pulls in
 * data/tracks.json.
 */
export function HeaderCta() {
  const { hasPath, hydrated, state } = usePath();
  const trackName = state.track ? (trackNames as Record<string, string>)[state.track] : undefined;

  if (hydrated && hasPath && trackName) {
    return (
      <Link
        href="/path"
        className="hidden min-h-12 items-center gap-2 rounded-pill border border-verified-fill/40 bg-verified-tint px-4 text-small font-semibold text-verified transition-colors duration-150 hover:border-verified sm:inline-flex"
      >
        <span aria-hidden className="inline-flex">
          <Icon name="check-circle-2" size={16} weight="fill" />
        </span>
        <span className="max-w-[10rem] truncate">{trackName}</span>
      </Link>
    );
  }

  return (
    <div className="hidden sm:block">
      <Button href={NAV_CTA.href} variant="primary" size="lg">
        {NAV_CTA.label}
      </Button>
    </div>
  );
}
