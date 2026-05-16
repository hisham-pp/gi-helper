import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PlaceholderPage({
  title,
  description,
  bullets,
  username,
}: {
  title: string;
  description: string;
  bullets: string[];
  username: string;
}) {
  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-on-surface text-3xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-on-surface-variant mt-2">{description}</p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card variant="outlined" className="p-8">
          <h2 className="text-on-surface text-xl font-bold">Planned Scope</h2>
          <div className="mt-6 space-y-3">
            {bullets.map((bullet) => (
              <Card
                key={bullet}
                variant="filled"
                className="text-on-surface-variant px-4 py-4 text-sm font-medium"
              >
                {bullet}
              </Card>
            ))}
          </div>
        </Card>

        <Card variant="outlined" className="p-8">
          <h2 className="text-on-surface text-xl font-bold">Current Status</h2>
          <p className="text-on-surface-variant mt-4 text-sm leading-relaxed">
            This page is intentionally reserved so the route structure is ready
            before feature implementation begins.
          </p>
          <div className="mt-8">
            <Link href="/materials">
              <Button variant="filled" className="w-full sm:w-auto">
                Open material tracker
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </div>
  );
}
