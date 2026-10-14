"use client";

import React from "react";
import { Search } from "lucide-react";
import { GlassInput } from "./GlassInput";

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
    <GlassInput
      // Text, not type="search": that adds the browser's own clear button next to ours
      enterKeyHint="search"
      value={value}
      onValueChange={onChange}
      placeholder={placeholder}
      icon={Search}
      clearable
      shape="pill"
      className="flex-1"
    />
  );
}
