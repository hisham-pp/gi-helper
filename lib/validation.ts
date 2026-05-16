import { z } from "zod";

export const inventorySchema = z.object({
  materialId: z.string().min(1),
  quantity: z.coerce.number().int().min(0).max(999999)
});

export const goalSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(180).optional().or(z.literal(""))
});

export const goalMaterialSchema = z.object({
  goalId: z.string().min(1),
  materialId: z.string().min(1),
  required: z.coerce.number().int().min(0).max(999999)
});

export const deleteGoalSchema = z.object({
  goalId: z.string().min(1)
});

export const deleteGoalMaterialSchema = z.object({
  goalMaterialId: z.string().min(1)
});

export const inventoryImportSchema = z.object({
  items: z.array(
    z.object({
      materialId: z.string().min(1),
      quantity: z.coerce.number().int().min(0).max(999999)
    })
  )
});
