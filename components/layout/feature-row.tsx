import { Heading, Icon, Text } from "../ui/index";
import { cn } from "@/lib/utils";

export type Feature = {
  /** Kebab name from ICON_NAMES. */
  icon: string;
  title: string;
  body: string;
};

/** Icon + title + one sentence, three up. No cards, no borders (spec §8.1.2). */
export function FeatureRow({
  items,
  className,
}: {
  items: Feature[];
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-8 sm:grid-cols-3", className)}>
      {items.map((feature) => (
        <div key={feature.title} className="flex flex-col items-start gap-3">
          <Icon name={feature.icon} size={28} weight="duotone" className="text-primary" />
          <Heading level={3} size="h5">
            {feature.title}
          </Heading>
          <Text>{feature.body}</Text>
        </div>
      ))}
    </div>
  );
}
