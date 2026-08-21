import { LogoMark } from "@/components/site/logo";
import { cn } from "@/lib/utils";

export type KitHeaderProps = {
  kicker: string;
  title: string;
  /** One line under the title: the session's length and method, or a creed. */
  sub?: string;
  className?: string;
};

/**
 * The masthead on every printed sheet. `mono` draws the ladder mark in
 * currentColor, so it survives one-colour printing and the navy slide alike.
 * A <div>, not a <header>: the kit layout hides `body > header`.
 */
export function KitHeader({ kicker, title, sub, className }: KitHeaderProps) {
  return (
    <div className={cn("kit-head kit-avoid", className)}>
      <span className="kit-head__mark">
        <LogoMark size={26} mono />
      </span>
      <div>
        <p className="kit-kicker">{kicker}</p>
        <h1 className="kit-h1">{title}</h1>
        {sub && <p className="kit-small">{sub}</p>}
      </div>
    </div>
  );
}
