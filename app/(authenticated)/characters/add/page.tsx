"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppTextField from "@/components/core/app-textfield";
import { Select } from "@/components/ui/select";
import { createCharacterAction } from "@/app/actions";

type CharacterFormValues = {
  id: string;
  name: string;
  iconName: string;
  rarity: number;
  element: string;
  weaponType: string;
  region: string;
};

export default function AddCharacterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<CharacterFormValues>({
    defaultValues: {
      element: "Anemo",
      iconName: "",
      id: "",
      name: "",
      rarity: 5,
      region: "Mondstadt",
      weaponType: "Sword",
    },
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

  function handleSave(values: CharacterFormValues) {
    startTransition(async () => {
      const result = await createCharacterAction(values);

      if (!result.success) {
        setError("root", {
          message: result.error ?? "Unable to create character.",
        });
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
        <form onSubmit={handleSubmit(handleSave)}>
          <div className="grid gap-6 md:grid-cols-2">
            <AppTextField
              label="ID"
              error={Boolean(errors.id)}
              helperText={errors.id?.message ?? "Internal ID, e.g., 'amber'"}
              {...register("id", { required: "ID is required." })}
            />
            <AppTextField
              label="Name"
              error={Boolean(errors.name)}
              helperText={
                errors.name?.message ?? "Display name, e.g., 'Amber'"
              }
              {...register("name", {
                maxLength: {
                  value: 200,
                  message: "Name must be 200 characters or fewer.",
                },
                required: "Name is required.",
              })}
            />
            <AppTextField
              label="Icon Name"
              className="md:col-span-2"
              error={Boolean(errors.iconName)}
              helperText={
                errors.iconName?.message ??
                "UI Icon identifier, e.g., 'UI_AvatarIcon_Ambor'"
              }
              {...register("iconName", {
                maxLength: {
                  value: 200,
                  message: "Icon name must be 200 characters or fewer.",
                },
                required: "Icon name is required.",
              })}
            />
            <AppTextField
              label="Rarity"
              type="number"
              min={1}
              max={5}
              error={Boolean(errors.rarity)}
              helperText={errors.rarity?.message}
              {...register("rarity", {
                max: { value: 5, message: "Rarity cannot be above 5." },
                min: { value: 1, message: "Rarity must be at least 1." },
                required: "Rarity is required.",
                valueAsNumber: true,
              })}
            />
            <Controller
              control={control}
              name="element"
              rules={{ required: "Element is required." }}
              render={({ field }) => (
                <div>
                  <Select
                    label="Element"
                    value={field.value}
                    onChange={field.onChange}
                    options={elements.map((e) => ({ label: e, value: e }))}
                  />
                  {errors.element?.message && (
                    <p className="mt-1 text-sm font-medium text-error">
                      {errors.element.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              control={control}
              name="weaponType"
              rules={{ required: "Weapon type is required." }}
              render={({ field }) => (
                <div>
                  <Select
                    label="Weapon Type"
                    value={field.value}
                    onChange={field.onChange}
                    options={weaponTypes.map((w) => ({ label: w, value: w }))}
                  />
                  {errors.weaponType?.message && (
                    <p className="mt-1 text-sm font-medium text-error">
                      {errors.weaponType.message}
                    </p>
                  )}
                </div>
              )}
            />
            <Controller
              control={control}
              name="region"
              rules={{ required: "Region is required." }}
              render={({ field }) => (
                <div>
                  <Select
                    label="Region"
                    value={field.value}
                    onChange={field.onChange}
                    options={regions.map((r) => ({ label: r, value: r }))}
                  />
                  {errors.region?.message && (
                    <p className="mt-1 text-sm font-medium text-error">
                      {errors.region.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
          {errors.root?.message && (
            <p className="mt-4 text-sm font-medium text-error">
              {errors.root.message}
            </p>
          )}

          <div className="mt-8 flex justify-end gap-3">
            <Link href="/characters">
              <Button type="button" variant="text">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isPending} className="gap-2">
              <Save className="h-4 w-4" />
              Save Character
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
