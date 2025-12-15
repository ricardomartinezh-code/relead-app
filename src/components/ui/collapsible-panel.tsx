"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/components/lib/utils";

export function CollapsiblePanel(props: {
  title: React.ReactNode;
  description?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  right?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  const {
    title,
    description,
    right,
    className,
    headerClassName,
    contentClassName,
    children,
  } = props;

  const isControlled = typeof props.open === "boolean" && !!props.onOpenChange;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    Boolean(props.defaultOpen)
  );
  const open = isControlled ? (props.open as boolean) : uncontrolledOpen;
  const setOpen = isControlled
    ? (props.onOpenChange as (next: boolean) => void)
    : setUncontrolledOpen;

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white", className)}>
      <button
        type="button"
        className={cn(
          "flex w-full items-start justify-between gap-3 rounded-xl px-4 py-3 text-left transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300",
          headerClassName
        )}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          {description ? (
            <div className="mt-0.5 text-xs text-slate-600">{description}</div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {right}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-500 transition-transform duration-200",
              open ? "rotate-180" : "rotate-0"
            )}
            aria-hidden="true"
          />
        </div>
      </button>

      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className={cn("px-4 pb-4", contentClassName)}>{children}</div>
        </div>
      </div>
    </div>
  );
}

