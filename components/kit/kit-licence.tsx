import { KIT_LICENSE } from "@/lib/educators";
import { cn } from "@/lib/utils";

export type KitLicenceProps = {
  /** One line, for sheets with no room for the block. */
  compact?: boolean;
  className?: string;
};

/**
 * "How to use and cite this" — spec §7.5 puts it on the last page of every
 * PDF. Copy comes from data/educators.json.license; the URL prints in full.
 */
export function KitLicence({ compact = false, className }: KitLicenceProps) {
  if (compact) {
    return (
      <p className={cn("kit-note kit-avoid", className)}>
        {KIT_LICENSE.attribution}. Share and adapt with credit —{" "}
        <a href={KIT_LICENSE.url} className="kit-url">
          {KIT_LICENSE.url}
        </a>
      </p>
    );
  }

  return (
    <div className={cn("kit-card kit-card--tint kit-avoid", className)}>
      <p className="kit-kicker">How to use and cite this</p>
      <p className="kit-small">{KIT_LICENSE.summary}</p>
      <p className="kit-note">
        Credit: {KIT_LICENSE.attribution}. Licence {KIT_LICENSE.name} —{" "}
        <a href={KIT_LICENSE.url} className="kit-url">
          {KIT_LICENSE.url}
        </a>
      </p>
    </div>
  );
}
