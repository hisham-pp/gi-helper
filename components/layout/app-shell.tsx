"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  CookingPot,
  Download,
  Gem,
  Home,
  LogIn,
  LogOut,
  Menu,
  MoonStar,
  PackageSearch,
  Search,
  Shield,
  Sparkles,
  SunMedium,
  Swords,
  Target,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useTheme as useNextTheme } from "next-themes";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ElementType,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { alpha, styled, useTheme } from "@mui/material/styles";

import { logoutAction } from "@/app/actions";
import AppTextField from "@/components/core/app-textfield";
import AppButton from "@/components/core/button";
import AppIconButton from "@/components/core/icon-button";
import NavigationButton from "@/components/core/navigation-button";

const drawerWidth = 288;

type ImportProgress = {
  label: string;
  completed: number;
  total: number;
};

type ImportStreamEvent =
  | {
      type: "progress";
      label: string;
      completed: number;
      total: number;
    }
  | {
      type: "complete";
      imported: {
        materials: number;
        inventory: number;
        goals: number;
        cookingProgress: number;
      };
    }
  | {
      type: "error";
      error: string;
    };

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/inventory", label: "Inventory", icon: PackageSearch },
  { href: "/cooking", label: "Cooking", icon: CookingPot },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/materials", label: "Materials", icon: Gem },
  { href: "/characters", label: "Characters", icon: Users },
  { href: "/map", label: "Map", icon: Compass },
  { href: "/collectibles", label: "Items", icon: Sparkles },
  { href: "/shrines", label: "Shrines", icon: Shield },
  { href: "/challenges", label: "Combat", icon: Swords },
] satisfies Array<{ href: Route; label: string; icon: typeof Home }>;

const ShellRoot = styled(Box)(({ theme }) => ({
  display: "flex",
  minHeight: "100vh",
  overflow: "hidden",
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
}));

const Main = styled("main")(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  height: "100vh",
  overflowY: "auto",
  paddingTop: 64,
  [theme.breakpoints.up("lg")]: {
    paddingTop: 0,
  },
}));

const DrawerContent = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "100%",
  flexDirection: "column",
  borderRight: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const BrandMark = styled(Box)(({ theme }) => ({
  display: "grid",
  height: 40,
  width: 40,
  flexShrink: 0,
  placeItems: "center",
  borderRadius: 12,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: `0 10px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
}));

export function AppShell({
  userLabel,
  userRole,
  children,
}: Readonly<{
  userLabel?: string;
  userRole?: string;
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const muiTheme = useTheme();
  const { resolvedTheme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(
    null,
  );
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const isDark = mounted && resolvedTheme === "dark";

  async function handleExportAll() {
    try {
      const response = await fetch("/api/export/all");
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Export failed");
      }
      const payload = await response.json();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "genshin-material-tracker-all-data.json";
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Backup exported.");
    } catch (error) {
      console.error("Export all failed", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to export backup.",
      );
    }
  }

  async function handleImportAll(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (isImporting) return;

    try {
      setIsImporting(true);
      setImportProgress({
        label: "Reading backup file...",
        completed: 0,
        total: 1,
      });
      const text = await file.text();
      const parsed = JSON.parse(text);
      const response = await fetch("/api/import/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Import failed");
      }

      if (!response.body) {
        throw new Error("Import progress stream was not available.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let importCompleted = false;

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) {
            continue;
          }

          const event = JSON.parse(line) as ImportStreamEvent;

          if (event.type === "progress") {
            setImportProgress({
              label: event.label,
              completed: event.completed,
              total: event.total,
            });
          }

          if (event.type === "error") {
            throw new Error(event.error);
          }

          if (event.type === "complete") {
            importCompleted = true;
            setImportProgress({
              label: "Import complete.",
              completed: 1,
              total: 1,
            });
            toast.success(
              `Backup imported: ${event.imported.inventory} inventory items, ${event.imported.goals} goals.`,
            );
          }
        }

        if (done) {
          break;
        }
      }

      if (!importCompleted) {
        throw new Error("Import stopped before it finished.");
      }

      window.location.reload();
    } catch (error) {
      console.error("Import all failed", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to import backup file.",
      );
    } finally {
      setIsImporting(false);
      setImportProgress(null);
      event.target.value = "";
    }
  }

  const drawer = (
    <DrawerContent>
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          gap: 1.5,
          justifyContent: "space-between",
          minHeight: 72,
          px: 2.5,
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", gap: 1.5 }}>
          <BrandMark>
            <Target size={24} />
          </BrandMark>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              noWrap
              variant="h6"
              sx={{ fontWeight: 800, lineHeight: 1.1 }}
            >
              Genshin Tracker
            </Typography>
            <Typography
              noWrap
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 800,
                letterSpacing: 1.6,
              }}
            >
              Material Suite
            </Typography>
          </Box>
        </Box>
        <AppIconButton
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
          sx={{ display: { lg: "none" } }}
        >
          <X size={22} />
        </AppIconButton>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1.5, py: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: "text.secondary",
            display: "block",
            fontWeight: 800,
            px: 1.5,
          }}
        >
          Navigation
        </Typography>
        <List disablePadding sx={{ mt: 1 }}>
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;

            return (
              <NavigationButton
                key={item.href}
                active={active}
                component={Link as ElementType}
                href={item.href}
                icon={<Icon size={20} />}
                label={item.label}
              />
            );
          })}
        </List>

        <Divider sx={{ my: 2.5 }} />
        <Typography
          variant="overline"
          sx={{
            color: "text.secondary",
            display: "block",
            fontWeight: 800,
            px: 1.5,
          }}
        >
          Tools & Actions
        </Typography>
        <List disablePadding sx={{ mt: 1 }}>
          <NavigationButton
            icon={<Download size={20} />}
            label={userRole === "master" ? "Export All Data" : "Export My Data"}
            onClick={handleExportAll}
          />
          <NavigationButton
            icon={<Upload size={20} />}
            label={
              isImporting
                ? "Importing..."
                : userRole === "master"
                  ? "Import Backup"
                  : "Import My Data"
            }
            disabled={isImporting}
            onClick={() => importInputRef.current?.click()}
          />
        </List>
        {importProgress && (
          <Box sx={{ px: 1.5, py: 1 }}>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                gap: 1,
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 800 }}
              >
                {importProgress.label}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 800 }}
              >
                {Math.round(
                  (importProgress.completed /
                    Math.max(1, importProgress.total)) *
                    100,
                )}
                %
              </Typography>
            </Box>
            <LinearProgress
              value={
                (importProgress.completed / Math.max(1, importProgress.total)) *
                100
              }
              variant="determinate"
              sx={{ mt: 1, borderRadius: 999 }}
            />
          </Box>
        )}
      </Box>

      <Box sx={{ borderTop: `1px solid ${muiTheme.palette.divider}`, p: 2 }}>
        {userLabel ? (
          <>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                gap: 1.5,
                px: 1,
                pb: 2,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "secondary.main",
                  color: "secondary.contrastText",
                }}
              >
                {userLabel[0].toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography noWrap variant="body2" sx={{ fontWeight: 800 }}>
                  @{userLabel}
                </Typography>
                <Typography
                  noWrap
                  variant="caption"
                  sx={{ color: "text.secondary" }}
                >
                  Standard Plan
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <AppButton
                fullWidth
                color="secondary"
                startIcon={
                  isDark ? <SunMedium size={17} /> : <MoonStar size={17} />
                }
                variant="filled"
                onClick={() => setTheme(isDark ? "light" : "dark")}
              >
                {isDark ? "Light" : "Dark"}
              </AppButton>
              <Box component="form" action={logoutAction} sx={{ flex: 1 }}>
                <AppButton
                  fullWidth
                  color="error"
                  startIcon={<LogOut size={17} />}
                  type="submit"
                  variant="outlined"
                >
                  Logout
                </AppButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ display: "grid", gap: 1 }}>
            <AppButton
              fullWidth
              color="primary"
              component={Link as ElementType}
              href={"/login" as Route}
              startIcon={<LogIn size={17} />}
              variant="filled"
            >
              Login
            </AppButton>
            <AppButton
              fullWidth
              color="secondary"
              component={Link as ElementType}
              href={"/register" as Route}
              startIcon={<UserPlus size={17} />}
              variant="outlined"
            >
              Register
            </AppButton>
          </Box>
        )}
      </Box>
    </DrawerContent>
  );

  return (
    <ShellRoot>
      <AppBar
        color="default"
        elevation={0}
        position="fixed"
        sx={{
          borderBottom: `1px solid ${muiTheme.palette.divider}`,
          display: { lg: "none" },
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
            <AppIconButton
              aria-label="Open navigation"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={22} />
            </AppIconButton>
            <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
              <Target size={22} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                GMT
              </Typography>
            </Box>
          </Box>
          <AppIconButton
            aria-label="Toggle color mode"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? <SunMedium size={20} /> : <MoonStar size={20} />}
          </AppIconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ flexShrink: { lg: 0 }, width: { lg: drawerWidth } }}
      >
        <Drawer
          open={isSidebarOpen}
          variant="temporary"
          onClose={() => setIsSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          open
          variant="permanent"
          sx={{
            display: { xs: "none", lg: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Main>
        <AppTextField
          inputRef={importInputRef}
          type="file"
          onChange={(event) =>
            handleImportAll(event as ChangeEvent<HTMLInputElement>)
          }
          slotProps={{ htmlInput: { accept: "application/json" } }}
          sx={{ display: "none" }}
        />
        <Box
          sx={{
            mx: "auto",
            width: "100%",
            maxWidth: 1600,
            p: { xs: 2, sm: 3, lg: 4 },
          }}
        >
          {children}
        </Box>
      </Main>
    </ShellRoot>
  );
}
