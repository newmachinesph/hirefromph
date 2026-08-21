import { Text } from "@/components/ui";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Subtle "Last verified · Mon YYYY" stamp from a "YYYY-MM" string. */
export function FreshnessNote({ date }: { date: string }) {
  const [year, month] = date.split("-");
  const name = MONTHS[Number(month) - 1];
  const label = name ? `${name} ${year}` : date; // fall back to raw string
  return (
    <Text size="caption" tone="faint" className="uppercase tracking-wider">
      Last verified · {label}
    </Text>
  );
}
