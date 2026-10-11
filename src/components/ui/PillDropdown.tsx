"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export interface PillDropdownOption<T extends string = string> {
  value: T;
  label: string;
}

interface PillDropdownProps<T extends string = string> {
  /** Options to display in the dropdown list */
  options: PillDropdownOption<T>[];
  /** Currently selected value */
  value: T;
  /** Called when the user picks a different option */
  onChange: (value: T) => void;
  /** Optional label shown before the selected option text (e.g. "Sort:") */
  label?: string;
  /** Optional icon rendered before the label */
  icon?: React.ReactNode;
  /** Tailwind border-radius class for the trigger button (default: "rounded-full") */
  triggerRadius?: string;
  /** Tailwind border-radius class for the dropdown panel (default: "rounded-2xl") */
  panelRadius?: string;
  /** Tailwind z-index class applied to the dropdown panel (default: "z-[200]") */
  panelZIndex?: string;
  /** Extra class names for the root wrapper */
  className?: string;
}

/**
 * Pill-styled dropdown shared across the app.
 * The panel is rendered via a React portal at document.body so it always
 * escapes any stacking contexts (backdrop-blur, transform, etc.) created
 * by ancestor elements.
 */
export function PillDropdown<T extends string = string>({
  options,
  value,
  onChange,
  label,
  icon,
  triggerRadius = "rounded-full",
  panelRadius = "rounded-2xl",
  panelZIndex = "z-[200]",
  className = "",
}: PillDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Position the portal panel below the trigger on open
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left: rect.left,
    });
  }, [open]);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
      });
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedInsideWrapper = wrapperRef.current?.contains(target);
      const clickedInsidePanel = document
        .getElementById("pill-dropdown-portal")
        ?.contains(target);
      if (!clickedInsideWrapper && !clickedInsidePanel) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            id="pill-dropdown-portal"
            style={panelStyle}
            className={`flex max-h-60 min-w-max flex-col gap-1 overflow-y-auto border border-white/10 bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl ${panelRadius} ${panelZIndex}`}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full shrink-0 rounded-full px-3 py-2 text-left text-sm transition-all ${
                  opt.value === value
                    ? "bg-primary/20 font-semibold text-primary"
                    : "font-medium text-foreground hover:bg-white/10"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((prev) => !prev)}
        className={`text-on-surface flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-xs shadow-sm backdrop-blur-md transition-all hover:bg-white/10 active:scale-95 sm:text-sm ${triggerRadius}`}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {label && (
          <span className="hidden text-white/50 sm:inline">{label}</span>
        )}
        <span className="font-semibold text-white">
          {selected?.label ?? "Select…"}
        </span>
        <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {panel}
    </div>
  );
}
