"use client";

import React from "react";
import {
  Eye,
  EyeOff,
  MousePointer2,
  Redo2,
  RotateCcw,
  Scan,
  SquarePlus,
  Trash2,
  Undo2,
} from "lucide-react";
import type { EditorTool } from "./DetectionCanvas";

interface EditorToolbarProps {
  imageName: string;
  imageWidth: number;
  imageHeight: number;
  tool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  canUndo: boolean;
  canRedo: boolean;
  canReset: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  showEmptySlots: boolean;
  onToggleEmptySlots: () => void;
  onDeleteImage: () => void;
}

const TOOLS: { id: EditorTool; label: string; hint: string; icon: typeof MousePointer2 }[] = [
  { id: "select", label: "Select", hint: "Select, move and resize cards; drag the background to pan (V)", icon: MousePointer2 },
  { id: "add", label: "Add card", hint: "Drag on the image to add a missed card (A)", icon: SquarePlus },
  { id: "region", label: "Region", hint: "Drag to limit detection to a region, then re-run", icon: Scan },
];

function IconButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function EditorToolbar({
  imageName,
  imageWidth,
  imageHeight,
  tool,
  onToolChange,
  canUndo,
  canRedo,
  canReset,
  onUndo,
  onRedo,
  onReset,
  showEmptySlots,
  onToggleEmptySlots,
  onDeleteImage,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-xs font-bold text-white">{imageName}</span>
        <span className="flex-shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">
          {imageWidth}×{imageHeight}px
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <div className="flex items-center rounded-xl border border-white/10 bg-black/40 p-0.5">
          {TOOLS.map(({ id, label, hint, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onToolChange(id)}
              title={hint}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold transition-all ${
                tool === id ? "bg-primary text-primary-foreground" : "text-white/70 hover:text-white"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        <span className="mx-1 h-5 w-px bg-white/10" />
        <IconButton onClick={onUndo} disabled={!canUndo} label="Undo (Ctrl+Z)">
          <Undo2 className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton onClick={onRedo} disabled={!canRedo} label="Redo (Ctrl+Shift+Z)">
          <Redo2 className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton onClick={onReset} disabled={!canReset} label="Discard manual edits">
          <RotateCcw className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          onClick={onToggleEmptySlots}
          label={showEmptySlots ? "Hide empty slots" : "Show empty slots"}
        >
          {showEmptySlots ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </IconButton>
        <span className="mx-1 h-5 w-px bg-white/10" />
        <IconButton onClick={onDeleteImage} label="Remove image from session">
          <Trash2 className="h-3.5 w-3.5 text-red-400" />
        </IconButton>
      </div>
    </div>
  );
}

/** Colour legend for the overlay states. */
export function OverlayLegend() {
  const items = [
    { label: "High confidence", style: "border-emerald-400" },
    { label: "Low confidence", style: "border-amber-400 border-dashed" },
    { label: "Manual", style: "border-sky-400" },
    { label: "Empty slot", style: "border-white/40 border-dotted" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 text-[11px] text-white/60">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className={`inline-block h-3 w-4 rounded-sm border-2 ${i.style}`} />
          {i.label}
        </span>
      ))}
      <span className="ml-auto hidden text-white/40 md:inline">
        Ctrl+wheel zooms · drag to pan · Del removes · arrows nudge · Esc deselects
      </span>
    </div>
  );
}
