import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Heading } from "./heading";
import { Icon } from "./icon";
import { Text } from "./text";

export type EmptyStateProps = {
  title: string;
  body?: ReactNode;
  /** Kebab name from ICON_NAMES. */
  icon?: string;
  action?: ReactNode;
  /** A `Figure`, when the empty state earns an image. */
  media?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  body,
  icon,
  action,
  media,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-md border border-dashed border-line-strong bg-band px-6 py-12 text-center",
        className,
      )}
    >
      {media}
      {!media && icon && (
        <span className="grid h-12 w-12 place-items-center rounded-pill bg-primary-tint text-primary">
          <Icon name={icon} size={24} weight="duotone" />
        </span>
      )}
      <Heading level={3} size="h5">
        {title}
      </Heading>
      {body && (
        <Text size="small" className="max-w-md">
          {body}
        </Text>
      )}
      {action}
    </div>
  );
}
