"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  // resolvedTheme is what's on screen; theme can be "system"
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      // Same size as the button, so nothing shifts when it mounts
      <div className="glass-track h-9 w-9" />
    );
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      // Same recessed glass as the top bar's page pill (glass-track)
      className="glass-track flex h-9 w-9 items-center justify-center text-white/55 transition-[color,transform] duration-200 hover:text-white/85 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
      aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
