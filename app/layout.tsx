import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";

import "@/app/globals.css";

import { ServiceWorkerRegister } from "@/components/providers/service-worker-register";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: "Genshin Material Tracker",
  description: "Track Genshin Impact material inventory, goals, and recursive crafting progress.",
  applicationName: "Genshin Material Tracker"
};

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans"
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={plusJakartaSans.variable}>
        <ThemeProvider>
          <ServiceWorkerRegister />
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
