"use client";

import CssBaseline from "@mui/material/CssBaseline";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState, type PropsWithChildren } from "react";

export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MuiThemeBridge>{children}</MuiThemeBridge>
    </NextThemesProvider>
  );
}

function MuiThemeBridge({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mode = mounted && resolvedTheme === "dark" ? "dark" : "light";

  const theme = useMemo(
    () =>
      createTheme({
        cssVariables: true,
        palette: {
          mode,
          primary: {
            main: mode === "dark" ? "#4edad9" : "#006a6a",
            contrastText: mode === "dark" ? "#003737" : "#ffffff",
          },
          secondary: {
            main: mode === "dark" ? "#b0cccc" : "#4a6363",
            contrastText: mode === "dark" ? "#1b3333" : "#ffffff",
          },
          error: {
            main: mode === "dark" ? "#ffb4ab" : "#ba1a1a",
          },
          background: {
            default: mode === "dark" ? "#191c1c" : "#fafdfc",
            paper: mode === "dark" ? "#191c1c" : "#fafdfc",
          },
          text: {
            primary: mode === "dark" ? "#e1e3e2" : "#191c1c",
            secondary: mode === "dark" ? "#bec9c8" : "#3f4949",
          },
          divider: mode === "dark" ? "#3f4949" : "#bec9c8",
        },
        shape: {
          borderRadius: 20,
        },
        typography: {
          fontFamily:
            "var(--font-plus-jakarta-sans), ui-sans-serif, system-ui, sans-serif",
          button: {
            fontWeight: 700,
            textTransform: "none",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 999,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 999,
                minHeight: 48,
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </MuiThemeProvider>
  );
}
