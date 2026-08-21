import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type KitTableProps = {
  head: ReactNode[];
  rows: ReactNode[][];
  /** Column widths in percent, one per column. */
  widths?: number[];
  className?: string;
};

/** Timed run-sheet steps and mistake/fix pairs. Rows never break across pages. */
export function KitTable({ head, rows, widths, className }: KitTableProps) {
  return (
    <table className={cn("kit-table", className)}>
      {widths && (
        <colgroup>
          {widths.map((width, index) => (
            <col key={`col-${index}`} style={{ width: `${width}%` }} />
          ))}
        </colgroup>
      )}
      <thead>
        <tr>
          {head.map((cell, index) => (
            <th key={`th-${index}`} scope="col">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`tr-${rowIndex}`}>
            {row.map((cell, cellIndex) => (
              <td key={`td-${rowIndex}-${cellIndex}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
