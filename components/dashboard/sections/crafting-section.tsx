"use client";

import { CraftingResult } from "@/components/dashboard/crafting/crafting-result";
import { Panel } from "@/components/dashboard/common/panel";
import { Select } from "@/components/ui/select";
import { TextField } from "@/components/ui/text-field";
import type { CraftingSimulation, MaterialView } from "@/lib/types";

export function CraftingSection({
  materials,
  required,
  selectedMaterialId,
  simulation,
  setRequired,
  setSelectedMaterialId,
}: {
  materials: MaterialView[];
  required: number;
  selectedMaterialId: string;
  simulation: CraftingSimulation | null;
  setRequired: (required: number) => void;
  setSelectedMaterialId: (materialId: string) => void;
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.9fr_1.3fr]">
      <Panel title="Crafting Simulator" description="Recursive 3:1 crafting preview.">
        <div className="mt-4 space-y-4">
          <Select
            label="Select Material"
            variant="outlined"
            value={selectedMaterialId}
            onChange={setSelectedMaterialId}
            options={materials.map((material) => ({
              label: material.name,
              value: material.id,
            }))}
          />
          <TextField
            label="Required Quantity"
            variant="outlined"
            type="number"
            min={0}
            value={required}
            onChange={(event) => setRequired(Number(event.target.value))}
          />
        </div>
      </Panel>

      <Panel title="Simulation Result" description="Craftability and recursive breakdown.">
        <CraftingResult materials={materials} simulation={simulation} />
      </Panel>
    </section>
  );
}
