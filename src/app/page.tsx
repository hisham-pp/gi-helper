import { Scanner } from "@/components/scanner/Scanner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center justify-start pt-12 relative">
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <ThemeToggle />
      </div>
      <Scanner />
    </div>
  );
}
