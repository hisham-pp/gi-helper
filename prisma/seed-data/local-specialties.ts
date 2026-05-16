import { createThreeTierFamily } from "@/prisma/seed-data/helpers";

export const localSpecialties = [
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "valberry",
      name: "Valberry",
      iconId: "UI_ItemIcon_100001",
      rarity: 1,
      description: "A berry that grows in Cider Lake. Sweet but with a slight astringency."
    },
    {
      id: "fine-valberry",
      name: "Fine Valberry",
      iconId: "UI_ItemIcon_100002",
      rarity: 2,
      description: "High-quality Valberries selected and dried for better preservation."
    },
    {
      id: "premium-valberry",
      name: "Premium Valberry",
      iconId: "UI_ItemIcon_100003",
      rarity: 3,
      description: "The finest Valberries, prized for their perfect balance of sweetness and astringency."
    }
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "calla-lily",
      name: "Calla Lily",
      iconId: "UI_ItemIcon_100005",
      rarity: 1,
      description: "A white flower found in the wetlands. Commonly used in traditional arrangements."
    },
    {
      id: "pristine-calla-lily",
      name: "Pristine Calla Lily",
      iconId: "UI_ItemIcon_100011",
      rarity: 2,
      description: "Calla Lilies in perfect condition, with pristine petals and strong stems."
    },
    {
      id: "eternal-calla-lily",
      name: "Eternal Calla Lily",
      iconId: "UI_ItemIcon_100012",
      rarity: 3,
      description: "A legendary Calla Lily said to bloom only in starlight."
    }
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "sunspice-pheasant-egg",
      name: "Sunspice Pheasant Egg",
      iconId: "UI_ItemIcon_100013",
      rarity: 1,
      description: "An egg from pheasants in the Sunspice fields. Prized for its richness."
    },
    {
      id: "refined-pheasant-egg",
      name: "Refined Pheasant Egg",
      iconId: "UI_ItemIcon_100014",
      rarity: 2,
      description: "Pheasant eggs processed to enhance their natural qualities."
    },
    {
      id: "supreme-pheasant-egg",
      name: "Supreme Pheasant Egg",
      iconId: "UI_ItemIcon_100015",
      rarity: 3,
      description: "The most precious pheasant eggs, reserved for the finest dishes."
    }
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "wolfhook",
      name: "Wolfhook",
      iconId: "UI_ItemIcon_100016",
      rarity: 1,
      description: "A thorn-covered plant that grows in the Wolf Valley. Has a bitter taste."
    },
    {
      id: "cultivated-wolfhook",
      name: "Cultivated Wolfhook",
      iconId: "UI_ItemIcon_100017",
      rarity: 2,
      description: "Wolfhooks that have been carefully cultivated for better flavor balance."
    },
    {
      id: "prized-wolfhook",
      name: "Prized Wolfhook",
      iconId: "UI_ItemIcon_100018",
      rarity: 3,
      description: "The finest Wolfhooks, with a perfect balance of flavors."
    }
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "small-lamp-grass",
      name: "Small Lamp Grass",
      iconId: "UI_ItemIcon_100019",
      rarity: 1,
      description: "A glowing grass found in caves. Its light is soft and calming."
    },
    {
      id: "bright-lamp-grass",
      name: "Bright Lamp Grass",
      iconId: "UI_ItemIcon_100020",
      rarity: 2,
      description: "Lamp Grass that shines brighter than usual, with enhanced luminescence."
    },
    {
      id: "radiant-lamp-grass",
      name: "Radiant Lamp Grass",
      iconId: "UI_ItemIcon_100021",
      rarity: 3,
      description: "Extremely rare Lamp Grass that glows with an ethereal light."
    }
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "silk-flower",
      name: "Silk Flower",
      iconId: "UI_ItemIcon_100022",
      rarity: 1,
      description: "A delicate flower with silken petals. Often used in local crafts."
    },
    {
      id: "refined-silk-flower",
      name: "Refined Silk Flower",
      iconId: "UI_ItemIcon_100023",
      rarity: 2,
      description: "Silk Flowers that have been carefully processed to preserve their delicate texture."
    },
    {
      id: "exquisite-silk-flower",
      name: "Exquisite Silk Flower",
      iconId: "UI_ItemIcon_100024",
      rarity: 3,
      description: "The most beautiful Silk Flowers, prized by artisans across the realm."
    }
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "dendrobium",
      name: "Dendrobium",
      iconId: "UI_ItemIcon_100025",
      rarity: 1,
      description: "A orchid-like flower that blooms in the forest. Sweet-scented."
    },
    {
      id: "pristine-dendrobium",
      name: "Pristine Dendrobium",
      iconId: "UI_ItemIcon_100026",
      rarity: 2,
      description: "Dendrobiums in perfect condition, with vibrant colors and strong fragrance."
    },
    {
      id: "celestial-dendrobium",
      name: "Celestial Dendrobium",
      iconId: "UI_ItemIcon_100027",
      rarity: 3,
      description: "A legendary Dendrobium said to blossom only once every hundred years."
    }
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "fluorescent-fungus",
      name: "Fluorescent Fungus",
      iconId: "UI_ItemIcon_100028",
      rarity: 1,
      description: "A bioluminescent fungus from the deep forest. Glows with a blue light."
    },
    {
      id: "luminous-fungus",
      name: "Luminous Fungus",
      iconId: "UI_ItemIcon_100029",
      rarity: 2,
      description: "Highly luminescent fungi that glow brightly in darkness."
    },
    {
      id: "celestial-fungus",
      name: "Celestial Fungus",
      iconId: "UI_ItemIcon_100030",
      rarity: 3,
      description: "Rare fungus that glows with colors of the stars and cosmos."
    }
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "kalpalata-lotus",
      name: "Kalpalata Lotus",
      iconId: "UI_ItemIcon_100031",
      rarity: 1,
      description: "A lotus flower from the sacred waters. Has a meditation-inducing fragrance."
    },
    {
      id: "refined-kalpalata-lotus",
      name: "Refined Kalpalata Lotus",
      iconId: "UI_ItemIcon_100032",
      rarity: 2,
      description: "Kalpalata Lotus that has been carefully preserved and refined."
    },
    {
      id: "blessed-kalpalata-lotus",
      name: "Blessed Kalpalata Lotus",
      iconId: "UI_ItemIcon_100033",
      rarity: 3,
      description: "The most sacred Kalpalata Lotus, blessed by ancient spirits."
    }
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "padisarah",
      name: "Padisarah",
      iconId: "UI_ItemIcon_100034",
      rarity: 1,
      description: "A desert flower with golden petals. Symbolizes hope in arid lands."
    },
    {
      id: "golden-padisarah",
      name: "Golden Padisarah",
      iconId: "UI_ItemIcon_100041",
      rarity: 2,
      description: "Padisarah flowers with enhanced golden coloring and fragrance."
    },
    {
      id: "radiant-padisarah",
      name: "Radiant Padisarah",
      iconId: "UI_ItemIcon_100051",
      rarity: 3,
      description: "The rarest Padisarah, said to glow with inner light."
    }
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "scarab",
      name: "Scarab",
      iconId: "UI_ItemIcon_100052",
      rarity: 1,
      description: "An iridescent beetle found in the desert. Harmless and colorful."
    },
    {
      id: "prismatic-scarab",
      name: "Prismatic Scarab",
      iconId: "UI_ItemIcon_100053",
      rarity: 2,
      description: "Scarab beetles with enhanced iridescence and color variation."
    },
    {
      id: "celestial-scarab",
      name: "Celestial Scarab",
      iconId: "UI_ItemIcon_100054",
      rarity: 3,
      description: "Legendary beetles that shimmer with the colors of the cosmos."
    }
  ]),
];
