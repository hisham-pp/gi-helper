import { Scanner } from "@/components/scanner/Scanner";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function ScannerPage() {
  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8 flex flex-col items-center justify-start pt-12 relative z-10">
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <ThemeToggle />
      </div>
      <Scanner />
    </div>
  );
}
