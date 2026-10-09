import type { Metadata } from "next";
import "@/app/globals.css"; // Note: we need to fix this import too!

export const metadata: Metadata = {
  title: "Genshin Scanner",
  description: "Scanner",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
