import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function PlaceholderPage({
  title,
  description,
  bullets,
  username
}: {
  title: string;
  description: string;
  bullets: string[];
  username: string;
}) {
  return (
    <AppShell title={title} description={description} userLabel={username}>
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Card variant="outlined" className="p-8">
          <h2 className="text-xl font-bold text-on-surface">Planned Scope</h2>
          <div className="mt-6 space-y-3">
            {bullets.map((bullet) => (
              <Card key={bullet} variant="filled" className="px-4 py-4 text-sm font-medium text-on-surface-variant">
                {bullet}
              </Card>
            ))}
          </div>
        </Card>

        <Card variant="outlined" className="p-8">
          <h2 className="text-xl font-bold text-on-surface">Current Status</h2>
          <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">
            This page is intentionally reserved so the route structure is ready before feature implementation begins.
          </p>
          <div className="mt-8">
            <Link href="/materials">
              <Button variant="filled" className="w-full sm:w-auto">
                Open material tracker
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
