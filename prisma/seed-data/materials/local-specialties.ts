import { createThreeTierFamily } from "@/prisma/seed-data/helpers";

export const localSpecialties = [
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "valberry",
      name: "Valberry",
      iconId: "UI_ItemIcon_100001",
      rarity: 1,
      description:
        "A berry that grows in Cider Lake. Sweet but with a slight astringency.",
    },
    {
      id: "fine-valberry",
      name: "Fine Valberry",
      iconId: "UI_ItemIcon_100002",
      rarity: 2,
      description:
        "High-quality Valberries selected and dried for better preservation.",
    },
    {
      id: "premium-valberry",
      name: "Premium Valberry",
      iconId: "UI_ItemIcon_100003",
      rarity: 3,
      description:
        "The finest Valberries, prized for their perfect balance of sweetness and astringency.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "calla-lily",
      name: "Calla Lily",
      iconId: "UI_ItemIcon_100005",
      rarity: 1,
      description:
        "A white flower found in the wetlands. Commonly used in traditional arrangements.",
    },
    {
      id: "pristine-calla-lily",
      name: "Pristine Calla Lily",
      iconId: "UI_ItemIcon_100011",
      rarity: 2,
      description:
        "Calla Lilies in perfect condition, with pristine petals and strong stems.",
    },
    {
      id: "eternal-calla-lily",
      name: "Eternal Calla Lily",
      iconId: "UI_ItemIcon_100012",
      rarity: 3,
      description: "A legendary Calla Lily said to bloom only in starlight.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "sunspice-pheasant-egg",
      name: "Sunspice Pheasant Egg",
      iconId: "UI_ItemIcon_100013",
      rarity: 1,
      description:
        "An egg from pheasants in the Sunspice fields. Prized for its richness.",
    },
    {
      id: "refined-pheasant-egg",
      name: "Refined Pheasant Egg",
      iconId: "UI_ItemIcon_100014",
      rarity: 2,
      description:
        "Pheasant eggs processed to enhance their natural qualities.",
    },
    {
      id: "supreme-pheasant-egg",
      name: "Supreme Pheasant Egg",
      iconId: "UI_ItemIcon_100015",
      rarity: 3,
      description:
        "The most precious pheasant eggs, reserved for the finest dishes.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "wolfhook",
      name: "Wolfhook",
      iconId: "UI_ItemIcon_100016",
      rarity: 1,
      description:
        "A thorn-covered plant that grows in the Wolf Valley. Has a bitter taste.",
    },
    {
      id: "cultivated-wolfhook",
      name: "Cultivated Wolfhook",
      iconId: "UI_ItemIcon_100017",
      rarity: 2,
      description:
        "Wolfhooks that have been carefully cultivated for better flavor balance.",
    },
    {
      id: "prized-wolfhook",
      name: "Prized Wolfhook",
      iconId: "UI_ItemIcon_100018",
      rarity: 3,
      description: "Exceptional Wolfhooks, sought after by Mondstadt's chefs.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "cecilia",
      name: "Cecilia",
      iconId: "UI_ItemIcon_100021",
      rarity: 1,
      description:
        "A beautiful flower that only grows where harsh winds blow. It is as intangible as the true heart of an unbound spirit.",
    },
    {
      id: "fine-cecilia",
      name: "Fine Cecilia",
      iconId: "UI_ItemIcon_100022",
      rarity: 2,
      description: "Cecilias that have maintained their purity and fragrance.",
    },
    {
      id: "premium-cecilia",
      name: "Premium Cecilia",
      iconId: "UI_ItemIcon_100023",
      rarity: 3,
      description:
        "The most exquisite Cecilias, representing eternal friendship and loyalty.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "windwheel-aster",
      name: "Windwheel Aster",
      iconId: "UI_ItemIcon_100024",
      rarity: 1,
      description:
        "A plant that adores the wind. To the proud children of the wind, Windwheel Asters are the visible winds.",
    },
    {
      id: "fine-windwheel-aster",
      name: "Fine Windwheel Aster",
      iconId: "UI_ItemIcon_100025",
      rarity: 2,
      description: "Windwheel Asters with vibrant petals and strong stems.",
    },
    {
      id: "premium-windwheel-aster",
      name: "Premium Windwheel Aster",
      iconId: "UI_ItemIcon_100026",
      rarity: 3,
      description: "Perfect Windwheel Asters, spinning with grace and beauty.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "small-lamp-grass",
      name: "Small Lamp Grass",
      iconId: "UI_ItemIcon_100034",
      rarity: 1,
      description:
        "A wild grass that emits a soft light at night. Used in cooking to enhance flavors.",
    },
    {
      id: "fine-small-lamp-grass",
      name: "Fine Small Lamp Grass",
      iconId: "UI_ItemIcon_100035",
      rarity: 2,
      description: "Small Lamp Grass that glows with a steady, gentle light.",
    },
    {
      id: "premium-small-lamp-grass",
      name: "Premium Small Lamp Grass",
      iconId: "UI_ItemIcon_100036",
      rarity: 3,
      description:
        "The brightest Small Lamp Grass, prized for its exceptional flavor.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "philanemo-mushroom",
      name: "Philanemo Mushroom",
      iconId: "UI_ItemIcon_100054",
      rarity: 1,
      description:
        "A mushroom that grows in the warm caress of the wind. To some, it is as precious as the wind itself.",
    },
    {
      id: "fine-philanemo-mushroom",
      name: "Fine Philanemo Mushroom",
      iconId: "UI_ItemIcon_100055",
      rarity: 2,
      description: "Philanemo Mushrooms with a robust texture and aroma.",
    },
    {
      id: "premium-philanemo-mushroom",
      name: "Premium Philanemo Mushroom",
      iconId: "UI_ItemIcon_100056",
      rarity: 3,
      description:
        "The finest Philanemo Mushrooms, found only in the breeziest spots.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "silk-flower",
      name: "Silk Flower",
      iconId: "UI_ItemIcon_100058",
      rarity: 1,
      description:
        "A crimson flower that blooms like rainbow clouds in Liyue. Can be made into silky-smooth fabric.",
    },
    {
      id: "fine-silk-flower",
      name: "Fine Silk Flower",
      iconId: "UI_ItemIcon_100059",
      rarity: 2,
      description: "Silk Flowers with exceptionally soft and vibrant petals.",
    },
    {
      id: "premium-silk-flower",
      name: "Premium Silk Flower",
      iconId: "UI_ItemIcon_100060",
      rarity: 3,
      description: "The most luxurious Silk Flowers, used for royal garments.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "glaze-lily",
      name: "Glaze Lily Specialty",
      iconId: "UI_ItemIcon_100027",
      rarity: 1,
      description:
        "An extremely ancient flower that was said to be common in Liyue. It transforms memories into fragrance.",
    },
    {
      id: "fine-glaze-lily",
      name: "Fine Glaze Lily",
      iconId: "UI_ItemIcon_100028",
      rarity: 2,
      description: "Glaze Lilies that have captured long-lost memories.",
    },
    {
      id: "premium-glaze-lily",
      name: "Premium Glaze Lily",
      iconId: "UI_ItemIcon_100029",
      rarity: 3,
      description:
        "Perfect Glaze Lilies, radiating with the wisdom of the past.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "qingxin",
      name: "Qingxin Specialty",
      iconId: "UI_ItemIcon_100030",
      rarity: 1,
      description:
        "A beautiful white flower that only grows on the highest stone peaks. It avoids the heat and humidity of the plains to gaze into the distance from the solitary mountain tops.",
    },
    {
      id: "fine-qingxin",
      name: "Fine Qingxin",
      iconId: "UI_ItemIcon_100031",
      rarity: 2,
      description: "Qingxin flowers that have withstood the harshest winds.",
    },
    {
      id: "premium-qingxin",
      name: "Premium Qingxin",
      iconId: "UI_ItemIcon_100032",
      rarity: 3,
      description: "The most serene Qingxin, symbols of purity and solitude.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "noctilucous-jade",
      name: "Noctilucous Jade",
      iconId: "UI_ItemIcon_100033",
      rarity: 1,
      description:
        "A rare mineral that glimmers in the dark. It is said to be a mutated gemstone condensed from the flourishing elements of the world.",
    },
    {
      id: "fine-noctilucous-jade",
      name: "Fine Noctilucous Jade",
      iconId: "UI_ItemIcon_100045",
      rarity: 2,
      description: "Noctilucous Jade with a steady and vibrant glow.",
    },
    {
      id: "premium-noctilucous-jade",
      name: "Premium Noctilucous Jade",
      iconId: "UI_ItemIcon_100046",
      rarity: 3,
      description: "The most brilliant Noctilucous Jade, full of energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "cor-lapis",
      name: "Cor Lapis",
      iconId: "UI_ItemIcon_100047",
      rarity: 1,
      description:
        "A precious crystal of condensed pure Geo element that usually grows along with other minerals. It's also commonly called 'Cor Lapis.'",
    },
    {
      id: "fine-cor-lapis",
      name: "Fine Cor Lapis",
      iconId: "UI_ItemIcon_100048",
      rarity: 2,
      description: "Cor Lapis with high purity and elemental resonance.",
    },
    {
      id: "premium-cor-lapis",
      name: "Premium Cor Lapis",
      iconId: "UI_ItemIcon_100049",
      rarity: 3,
      description: "The heart of the mountain, a flawless Cor Lapis.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "jueyun-chili",
      name: "Jueyun Chili",
      iconId: "UI_ItemIcon_100020",
      rarity: 1,
      description:
        "A spicy plant native to Liyue. Merely smelling it makes one hot and thirsty.",
    },
    {
      id: "fine-jueyun-chili",
      name: "Fine Jueyun Chili",
      iconId: "UI_ItemIcon_100052",
      rarity: 2,
      description: "Jueyun Chilies with an intense and fiery flavor profile.",
    },
    {
      id: "premium-jueyun-chili",
      name: "Premium Jueyun Chili",
      iconId: "UI_ItemIcon_100053",
      rarity: 3,
      description: "The hottest Chilies, favored by the bravest of gourmets.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "dandelion-seed",
      name: "Dandelion Seed",
      iconId: "UI_ItemIcon_100037",
      rarity: 1,
      description:
        "A tiny seed that rides on the wind. It carries the hopes and dreams of the people.",
    },
    {
      id: "fine-dandelion-seed",
      name: "Fine Dandelion Seed",
      iconId: "UI_ItemIcon_100038",
      rarity: 2,
      description: "Dandelion Seeds that have traveled far on the breeze.",
    },
    {
      id: "premium-dandelion-seed",
      name: "Premium Dandelion Seed",
      iconId: "UI_ItemIcon_100039",
      rarity: 3,
      description: "Perfect Dandelion Seeds, ready to sprout new life.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "violetgrass",
      name: "Violetgrass",
      iconId: "UI_ItemIcon_100040",
      rarity: 1,
      description:
        "A small flower with a strong vitality. It is said that its downward-blooming flower keeps its fragrance from dissipating.",
    },
    {
      id: "fine-violetgrass",
      name: "Fine Violetgrass",
      iconId: "UI_ItemIcon_100041",
      rarity: 2,
      description: "Violetgrass with a rich and enduring scent.",
    },
    {
      id: "premium-violetgrass",
      name: "Premium Violetgrass",
      iconId: "UI_ItemIcon_100042",
      rarity: 3,
      description: "The most fragrant Violetgrass, highly valued by alchemists.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "qingxin-flower",
      name: "Qingxin Flower",
      iconId: "UI_ItemIcon_100030",
      rarity: 1,
      description: "A flower that grows on the highest peaks of Liyue.",
    },
    {
      id: "fine-qingxin-flower",
      name: "Fine Qingxin Flower",
      iconId: "UI_ItemIcon_100031",
      rarity: 2,
      description: "A pristine Qingxin flower.",
    },
    {
      id: "premium-qingxin-flower",
      name: "Premium Qingxin Flower",
      iconId: "UI_ItemIcon_100032",
      rarity: 3,
      description: "A rare and perfect Qingxin flower.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "sakura-bloom",
      name: "Sakura Bloom",
      iconId: "UI_ItemIcon_101221",
      rarity: 1,
      description:
        "Blossoms from the Sacred Sakura Tree. Carries a faint electrical charge.",
    },
    {
      id: "fine-sakura-bloom",
      name: "Fine Sakura Bloom",
      iconId: "UI_ItemIcon_101220",
      rarity: 2,
      description:
        "High-quality Sakura Blooms with enhanced electro properties.",
    },
    {
      id: "premium-sakura-bloom",
      name: "Premium Sakura Bloom",
      iconId: "UI_ItemIcon_101220",
      rarity: 3,
      description:
        "The finest Sakura Blooms, radiating with concentrated electro energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "romaritime-flower",
      name: "Romaritime Flower",
      iconId: "UI_ItemIcon_101221",
      rarity: 1,
      description:
        "A flower that grows near the waters of Fontaine. Adapts to its environment.",
    },
    {
      id: "fine-romaritime-flower",
      name: "Fine Romaritime Flower",
      iconId: "UI_ItemIcon_101220",
      rarity: 2,
      description:
        "High-quality Romaritime Flowers with enhanced adaptability.",
    },
    {
      id: "premium-romaritime-flower",
      name: "Premium Romaritime Flower",
      iconId: "UI_ItemIcon_101221",
      rarity: 3,
      description:
        "The finest Romaritime Flowers, perfectly adapted to their environment.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "starconch",
      name: "Starconch",
      iconId: "UI_ItemIcon_101222",
      rarity: 1,
      description:
        "A spiral-shaped shell found on the beaches of Liyue. Resembles a star.",
    },
    {
      id: "fine-starconch",
      name: "Fine Starconch",
      iconId: "UI_ItemIcon_101223",
      rarity: 2,
      description:
        "High-quality Starconches selected for their perfect shape and luster.",
    },
    {
      id: "premium-starconch",
      name: "Premium Starconch",
      iconId: "UI_ItemIcon_101224",
      rarity: 3,
      description: "The finest Starconches, prized for their celestial beauty.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "brilliant-chrysanthemum",
      name: "Brilliant Chrysanthemum Specialty",
      iconId: "UI_ItemIcon_101228",
      rarity: 1,
      description: "A flower that glows with a brilliant light.",
    },
    {
      id: "fine-brilliant-chrysanthemum",
      name: "Fine Brilliant Chrysanthemum",
      iconId: "UI_ItemIcon_101229",
      rarity: 2,
      description: "A high-quality Brilliant Chrysanthemum.",
    },
    {
      id: "premium-brilliant-chrysanthemum",
      name: "Premium Brilliant Chrysanthemum",
      iconId: "UI_ItemIcon_101230",
      rarity: 3,
      description: "A perfect Brilliant Chrysanthemum.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "clearwater-jade",
      name: "Clearwater Jade Specialty",
      iconId: "UI_ItemIcon_101231",
      rarity: 1,
      description: "A jade that is as clear as water.",
    },
    {
      id: "fine-clearwater-jade",
      name: "Fine Clearwater Jade",
      iconId: "UI_ItemIcon_101232",
      rarity: 2,
      description: "A refined Clearwater Jade.",
    },
    {
      id: "premium-clearwater-jade",
      name: "Premium Clearwater Jade",
      iconId: "UI_ItemIcon_101233",
      rarity: 3,
      description: "A legendary Clearwater Jade.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "purifying-light-rose",
      name: "Purifying Light Rose Specialty",
      iconId: "UI_ItemIcon_101234",
      rarity: 1,
      description: "A rose that purifies the light around it.",
    },
    {
      id: "fine-purifying-light-rose",
      name: "Fine Purifying Light Rose",
      iconId: "UI_ItemIcon_101235",
      rarity: 2,
      description: "A vibrant Purifying Light Rose.",
    },
    {
      id: "premium-purifying-light-rose",
      name: "Premium Purifying Light Rose",
      iconId: "UI_ItemIcon_101236",
      rarity: 3,
      description: "A radiant Purifying Light Rose.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "saurian-claw-succulent",
      name: "Saurian Claw Succulent Specialty",
      iconId: "UI_ItemIcon_101237",
      rarity: 1,
      description: "A plant that looks like a saurian claw.",
    },
    {
      id: "fine-saurian-claw-succulent",
      name: "Fine Saurian Claw Succulent",
      iconId: "UI_ItemIcon_101238",
      rarity: 2,
      description: "A well-grown Saurian Claw Succulent.",
    },
    {
      id: "premium-saurian-claw-succulent",
      name: "Premium Saurian Claw Succulent",
      iconId: "UI_ItemIcon_101239",
      rarity: 3,
      description: "A giant Saurian Claw Succulent.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "skysplit-gembloom",
      name: "Skysplit Gembloom Specialty",
      iconId: "UI_ItemIcon_101240",
      rarity: 1,
      description: "A flower that looks like a gem from the sky.",
    },
    {
      id: "fine-skysplit-gembloom",
      name: "Fine Skysplit Gembloom",
      iconId: "UI_ItemIcon_101241",
      rarity: 2,
      description: "A shimmering Skysplit Gembloom.",
    },
    {
      id: "premium-skysplit-gembloom",
      name: "Premium Skysplit Gembloom",
      iconId: "UI_ItemIcon_101242",
      rarity: 3,
      description: "A brilliant Skysplit Gembloom.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "sprayfeather-gill",
      name: "Sprayfeather Gill Specialty",
      iconId: "UI_ItemIcon_101243",
      rarity: 1,
      description: "A mushroom that looks like a feather.",
    },
    {
      id: "fine-sprayfeather-gill",
      name: "Fine Sprayfeather Gill",
      iconId: "UI_ItemIcon_101244",
      rarity: 2,
      description: "A soft Sprayfeather Gill.",
    },
    {
      id: "premium-sprayfeather-gill",
      name: "Premium Sprayfeather Gill",
      iconId: "UI_ItemIcon_101245",
      rarity: 3,
      description: "A golden Sprayfeather Gill.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "withering-purpurbloom",
      name: "Withering Purpurbloom Specialty",
      iconId: "UI_ItemIcon_101246",
      rarity: 1,
      description: "A purple flower that withers quickly.",
    },
    {
      id: "fine-withering-purpurbloom",
      name: "Fine Withering Purpurbloom",
      iconId: "UI_ItemIcon_101247",
      rarity: 2,
      description: "A preserved Withering Purpurbloom.",
    },
    {
      id: "premium-withering-purpurbloom",
      name: "Premium Withering Purpurbloom",
      iconId: "UI_ItemIcon_101248",
      rarity: 3,
      description: "An eternal Withering Purpurbloom.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "rainbow-rose",
      name: "Rainbow Rose Specialty",
      iconId: "UI_ItemIcon_101233",
      rarity: 1,
      description: "A beautiful rose that grows in Fontaine.",
    },
    {
      id: "fine-rainbow-rose",
      name: "Fine Rainbow Rose",
      iconId: "UI_ItemIcon_101233",
      rarity: 2,
      description: "A well-preserved Rainbow Rose.",
    },
    {
      id: "premium-rainbow-rose",
      name: "Premium Rainbow Rose",
      iconId: "UI_ItemIcon_101233",
      rarity: 3,
      description: "A perfect Rainbow Rose.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "sea-ganoderma",
      name: "Sea Ganoderma Specialty",
      iconId: "UI_ItemIcon_101224",
      rarity: 1,
      description: "A plant species that grows in certain ocean areas.",
    },
    {
      id: "fine-sea-ganoderma",
      name: "Fine Sea Ganoderma",
      iconId: "UI_ItemIcon_101224",
      rarity: 2,
      description: "A vibrant Sea Ganoderma.",
    },
    {
      id: "premium-sea-ganoderma",
      name: "Premium Sea Ganoderma",
      iconId: "UI_ItemIcon_101224",
      rarity: 3,
      description: "A rare and powerful Sea Ganoderma.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "winter-icelea",
      name: "Winter Icelea Specialty",
      iconId: "UI_ItemIcon_101242",
      rarity: 1,
      description: "A flower that thrives in the frozen north.",
    },
    {
      id: "fine-winter-icelea",
      name: "Fine Winter Icelea",
      iconId: "UI_ItemIcon_101242",
      rarity: 2,
      description: "A frost-resistant Icelea.",
    },
    {
      id: "premium-winter-icelea",
      name: "Premium Winter Icelea",
      iconId: "UI_ItemIcon_101242",
      rarity: 3,
      description: "An eternal winter blossom.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "frostlamp-flower",
      name: "Frostlamp Flower Specialty",
      iconId: "UI_ItemIcon_101241",
      rarity: 1,
      description: "A flower that glows with a cold light.",
    },
    {
      id: "fine-frostlamp-flower",
      name: "Fine Frostlamp Flower",
      iconId: "UI_ItemIcon_101241",
      rarity: 2,
      description: "A bright Frostlamp Flower.",
    },
    {
      id: "premium-frostlamp-flower",
      name: "Premium Frostlamp Flower",
      iconId: "UI_ItemIcon_101241",
      rarity: 3,
      description: "A radiant Frostlamp Flower.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "dracolite",
      name: "Dracolite Specialty",
      iconId: "UI_ItemIcon_101249",
      rarity: 1,
      description: "A rare stone containing draconic power.",
    },
    {
      id: "fine-dracolite",
      name: "Fine Dracolite",
      iconId: "UI_ItemIcon_101250",
      rarity: 2,
      description: "A purified Dracolite.",
    },
    {
      id: "premium-dracolite",
      name: "Premium Dracolite",
      iconId: "UI_ItemIcon_101251",
      rarity: 3,
      description: "A legendary Dracolite.",
    },
  ]),
];
