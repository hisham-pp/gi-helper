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
  /** Stretch the trigger (and panel) to the wrapper's full width, like a form field */
  block?: boolean;
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
  block = false,
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
      ...(block ? { width: rect.width } : {}),
    });
  }, [open, block]);

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
        ...(block ? { width: rect.width } : {}),
      });
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, block]);

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

  // Glass panel + chips (src/styles/glass.css); the selected option uses the
  // raised "tab thumb" look via aria-selected.
  const panel =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            id="pill-dropdown-portal"
            role="listbox"
            style={panelStyle}
            className={`glass-card glass-card--raised flex max-h-72 min-w-max flex-col gap-1 overflow-y-auto p-1.5 ${panelRadius} ${panelZIndex}`}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="glass-chip glass-chip--ghost w-full shrink-0 px-3.5 py-2 text-left text-sm font-medium"
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
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`glass-chip px-3.5 py-2 text-xs sm:text-sm ${block ? "w-full justify-between py-2.5 text-left" : ""} ${triggerRadius}`}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {label && (
          <span className="hidden text-white/50 sm:inline">{label}</span>
        )}
        <span className={`font-semibold text-white ${block ? "flex-1 truncate" : ""}`}>
          {selected?.label ?? "Select…"}
        </span>
        <ChevronDown
          className={`ml-0.5 h-4 w-4 shrink-0 opacity-60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {panel}
    </div>
  );
}
