"use client";

import {
  createContext,
  useContext,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  current: string;
  setValue: (next: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tab, TabList and TabPanel must be used inside <Tabs>.");
  return ctx;
}

export type TabsProps = {
  children: ReactNode;
  /** Controlled value. Omit to let Tabs own the state. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
};

export function Tabs({
  children,
  value,
  defaultValue,
  onValueChange,
  className,
}: TabsProps) {
  const baseId = useId();
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = value ?? internal;

  function setValue(next: string) {
    if (value === undefined) setInternal(next);
    onValueChange?.(next);
  }

  return (
    <TabsContext.Provider value={{ current, setValue, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

const NAV_KEYS = ["ArrowRight", "ArrowLeft", "Home", "End"];

export function TabList({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!NAV_KEYS.includes(event.key)) return;
    const tabs = Array.from(
      ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not([disabled])') ?? [],
    );
    if (tabs.length === 0) return;

    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const from = index === -1 ? 0 : index;
    const target =
      event.key === "Home"
        ? tabs[0]
        : event.key === "End"
          ? tabs[tabs.length - 1]
          : event.key === "ArrowRight"
            ? tabs[(from + 1) % tabs.length]
            : tabs[(from - 1 + tabs.length) % tabs.length];

    event.preventDefault();
    target.focus();
    // Automatic activation: selection follows focus (WAI-ARIA tabs pattern).
    target.click();
  }

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("flex flex-wrap gap-1 border-b border-line", className)}
    >
      {children}
    </div>
  );
}

export function Tab({
  value,
  children,
  icon,
  disabled = false,
  className,
}: {
  value: string;
  children: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const { current, setValue, baseId } = useTabs();
  const selected = current === value;
  return (
    <button
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      disabled={disabled}
      onClick={() => setValue(value)}
      className={cn(
        "-mb-px inline-flex items-center gap-2 rounded-t-sm border-b-2 px-4 py-2.5 text-base font-medium transition-colors duration-150 ease-out",
        selected ? "border-primary text-primary" : "border-transparent text-ink-soft hover:text-ink",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

export function TabPanel({
  value,
  children,
  className,
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const { current, baseId } = useTabs();
  if (current !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={cn("pt-5", className)}
    >
      {children}
    </div>
  );
}
