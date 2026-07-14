import * as Lucide from "lucide-react";
import type { LucideProps } from "lucide-react";

/** Resolve a kebab/snake icon name (from JSON) to a Lucide component. */
function toPascal(name: string): string {
  return name
    .split(/[-_ ]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

type Props = LucideProps & { name: string };

export function Icon({ name, ...rest }: Props) {
  const key = toPascal(name);
  const Cmp =
    (Lucide as unknown as Record<string, React.ComponentType<LucideProps>>)[
      key
    ] ?? Lucide.Sparkles;
  return <Cmp {...rest} />;
}
