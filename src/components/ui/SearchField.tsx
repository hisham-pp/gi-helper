"use client";

import React from "react";
import { Search, X } from "lucide-react";

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/** Glass search input with a clear button; grows to fill its row. */
export function SearchField({
  value,
  onChange,
  placeholder,
}: SearchFieldProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="glass-input w-full rounded-full py-2.5 pl-10 pr-9 text-sm"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="glass-icon-btn absolute right-2.5 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full"
          title="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
