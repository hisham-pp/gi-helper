export type SeedWeaponGoalTemplate = {
  weaponId: string;
  name: string;
  description: string;
  category: string;
  sortOrder: number;
  materials: Array<{
    materialId: string;
    required: number;
  }>;
};

export const weaponGoalTemplates: SeedWeaponGoalTemplate[] = [
  // Mistsplitter Reforged
  {
    weaponId: "mistsplitter",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension for Mistsplitter Reforged",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "old-handguard", required: 5 },
      { materialId: "slime-condensate", required: 3 },
    ],
  },
  {
    weaponId: "mistsplitter",
    name: "Ascension 2 (Lv. 40 → 50)",
    description: "Second ascension for Mistsplitter Reforged",
    category: "ascension",
    sortOrder: 2,
    materials: [
      { materialId: "kageuchi-handguard", required: 18 },
      { materialId: "slime-secretions", required: 12 },
    ],
  },

  // Staff of Homa
  {
    weaponId: "homa",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension for Staff of Homa",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "slime-condensate", required: 5 },
      { materialId: "damaged-mask", required: 3 },
    ],
  },

  // Prototype Rancour
  {
    weaponId: "prototype-rancour",
    name: "Ascension 1 (Lv. 20 → 40)",
    description: "First ascension for Prototype Rancour",
    category: "ascension",
    sortOrder: 1,
    materials: [
      { materialId: "treasure-hoarder-insignia", required: 3 },
      { materialId: "damaged-mask", required: 2 },
    ],
  },
];
