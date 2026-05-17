"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { Select } from "@/components/ui/select";
import { createCharacterAction } from "@/app/actions";

export default function AddCharacterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    id: "",
    name: "",
    iconName: "",
    rarity: 5,
    element: "Anemo",
    weaponType: "Sword",
    region: "Mondstadt",
  });

  const elements = [
    "Anemo",
    "Geo",
    "Electro",
    "Dendro",
    "Hydro",
    "Pyro",
    "Cryo",
  ];
  const weaponTypes = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"];
  const regions = [
    "Mondstadt",
    "Liyue",
    "Inazuma",
    "Sumeru",
    "Fontaine",
    "Natlan",
    "Snezhnaya",
    "Khaenri'ah",
  ];

  function handleSave() {
    startTransition(async () => {
      const result = await createCharacterAction(form);

      if (!result.success) {
        toast.error(result.error ?? "Unable to create character.");
        return;
      }

      toast.success("Character created.");
      router.push("/characters");
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/characters">
          <Button variant="text" className="p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-on-surface text-3xl font-bold tracking-tight">
          Add Character
        </h1>
      </div>

      <Card className="p-6" variant="outlined">
        <div className="grid gap-6 md:grid-cols-2">
          <TextField
            label="ID"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            helperText="Internal ID, e.g., 'amber'"
          />
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            helperText="Display name, e.g., 'Amber'"
          />
          <TextField
            label="Icon Name"
            className="md:col-span-2"
            value={form.iconName}
            onChange={(e) => setForm({ ...form, iconName: e.target.value })}
            helperText="UI Icon identifier, e.g., 'UI_AvatarIcon_Ambor'"
          />
          <TextField
            label="Rarity"
            type="number"
            min={1}
            max={5}
            value={form.rarity}
            onChange={(e) =>
              setForm({ ...form, rarity: Number(e.target.value) })
            }
          />
          <Select
            label="Element"
            value={form.element}
            onChange={(val) => setForm({ ...form, element: val })}
            options={elements.map((e) => ({ label: e, value: e }))}
          />
          <Select
            label="Weapon Type"
            value={form.weaponType}
            onChange={(val) => setForm({ ...form, weaponType: val })}
            options={weaponTypes.map((w) => ({ label: w, value: w }))}
          />
          <Select
            label="Region"
            value={form.region}
            onChange={(val) => setForm({ ...form, region: val })}
            options={regions.map((r) => ({ label: r, value: r }))}
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Link href="/characters">
            <Button variant="text">Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={isPending} className="gap-2">
            <Save className="h-4 w-4" />
            Save Character
          </Button>
        </div>
      </Card>
    </div>
  );
}
