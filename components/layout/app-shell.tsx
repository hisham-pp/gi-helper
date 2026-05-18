"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  Compass,
  Download,
  Gem,
  Home,
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
import List from "@mui/material/List";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { alpha, styled, useTheme } from "@mui/material/styles";

import { logoutAction } from "@/app/actions";
import AppButton from "@/components/core/button";
import AppIconButton from "@/components/core/icon-button";
import NavigationButton from "@/components/core/navigation-button";

const drawerWidth = 288;

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/search", label: "Search", icon: Search },
  { href: "/inventory", label: "Inventory", icon: PackageSearch },
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
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  // Close sidebar on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const isDark = mounted && resolvedTheme === "dark";

  async function handleExportAll() {
    try {
      const response = await fetch("/api/export/all");
      if (!response.ok) throw new Error("Export failed");
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
      toast.success("All data exported.");
    } catch (error) {
      console.error("Export all failed", error);
      toast.error("Unable to export all data.");
    }
  }

  async function handleImportAll(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const response = await fetch("/api/import/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      if (!response.ok) throw new Error("Import failed");
      toast.success("All data imported.");
      window.location.reload();
    } catch (error) {
      console.error("Import all failed", error);
      toast.error("Unable to import backup file.");
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div className="fixed inset-0 flex min-h-0 overflow-hidden bg-background text-on-background">
      {/* Mobile Top App Bar */}
      <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-outline-variant bg-surface/80 px-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <Button
            variant="text"
            className="h-10 w-10 p-0"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <span className="font-bold tracking-tight">GMT</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="text"
            className="h-10 w-10 rounded-full p-0"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? (
              <SunMedium className="h-5 w-5" />
            ) : (
              <MoonStar className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Sidebar / Navigation Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-outline-variant bg-surface transition-transform duration-300 lg:static lg:min-h-0 lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Box
          sx={{ display: "flex", minWidth: 0, alignItems: "center", gap: 1.5 }}
        >
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

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <div className="text-on-surface-variant mb-4 px-3 text-[11px] font-bold uppercase tracking-wider opacity-60">
            Navigation
          </div>
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

        {userRole === "master" && (
          <>
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
                label="Export All Data"
                onClick={handleExportAll}
              />
              <NavigationButton
                icon={<Upload size={20} />}
                label="Import Backup"
                onClick={() => importInputRef.current?.click()}
              />
            </List>
          </>
        )}
      </Box>

      {userLabel && (
        <Box sx={{ borderTop: `1px solid ${muiTheme.palette.divider}`, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
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
        </Box>
      )}
    </DrawerContent>
  );

      {/* Main Content Area */}
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto pt-16 lg:pt-0">
        <input
          ref={importInputRef}
          hidden
          onChange={handleImportAll}
          type="file"
          accept="application/json"
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
