import { Scanner } from "@/components/scanner/Scanner";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";
import { Bug } from "lucide-react";

export default function ScannerPage() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-start bg-transparent p-4 pt-12 md:p-8">
      <div className="absolute right-4 top-4 flex items-center gap-3 md:right-8 md:top-8">
        <ThemeToggle />
      </div>
      <Scanner />
    </div>
  );
}
