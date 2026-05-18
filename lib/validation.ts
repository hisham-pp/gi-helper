import { z } from "zod";

export const inventorySchema = z.object({
  materialId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(999999),
});

export const authSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(6).max(100),
});

export const goalSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(180).optional().or(z.literal("")),
});

export const goalMaterialSchema = z.object({
  goalId: z.string().min(1),
  materialId: z.string().min(1),
  required: z.coerce.number().int().min(0).max(999999),
});

export const deleteGoalSchema = z.object({
  goalId: z.string().min(1),
});

export const completeGoalSchema = z.object({
  goalId: z.string().min(1),
});

export const deleteGoalMaterialSchema = z.object({
  goalMaterialId: z.string().min(1),
});

export const createGoalsFromTemplatesSchema = z.object({
  type: z.enum(["character", "weapon"]),
  templateIds: z.array(z.string().min(1)).min(1).max(72),
});

export const materialCategories = [
  "Elite Drop",
  "Enemy Drop",
  "Local Specialty",
  "Talent Book",
  "Weapon Ascension",
  "Boss Material",
  "Gem",
] as const;

export const categorySchema = z.enum(materialCategories);
export type MaterialCategory = z.infer<typeof categorySchema>;

export const materialSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(200),
  iconName: z.string().trim().min(1).max(200),
  rarity: z.coerce.number().int().min(1).max(5),
  category: categorySchema,
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  combinable: z.boolean().optional(),
  combineRatio: z.coerce.number().int().nullable().optional(),
  parentMaterialId: z.string().nullable().optional(),
});

export const inventoryImportSchema = z.object({
  items: z.array(
    z.object({
      materialId: z.string().min(1),
      quantity: z.coerce.number().int().min(0).max(999999),
    }),
  ),
});

export const characterSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(200),
  iconName: z.string().trim().min(1).max(200),
  rarity: z.coerce.number().int().min(1).max(5),
  element: z.string().trim().min(1),
  weaponType: z.string().trim().min(1),
  region: z.string().trim().min(1),
});
