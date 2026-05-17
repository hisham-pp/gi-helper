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
      description: "The finest Wolfhooks, with a perfect balance of flavors.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "small-lamp-grass",
      name: "Small Lamp Grass",
      iconId: "UI_ItemIcon_100019",
      rarity: 1,
      description:
        "A glowing grass found in caves. Its light is soft and calming.",
    },
    {
      id: "bright-lamp-grass",
      name: "Bright Lamp Grass",
      iconId: "UI_ItemIcon_100020",
      rarity: 2,
      description:
        "Lamp Grass that shines brighter than usual, with enhanced luminescence.",
    },
    {
      id: "radiant-lamp-grass",
      name: "Radiant Lamp Grass",
      iconId: "UI_ItemIcon_100021",
      rarity: 3,
      description:
        "Extremely rare Lamp Grass that glows with an ethereal light.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "silk-flower",
      name: "Silk Flower",
      iconId: "UI_ItemIcon_100022",
      rarity: 1,
      description:
        "A delicate flower with silken petals. Often used in local crafts.",
    },
    {
      id: "refined-silk-flower",
      name: "Refined Silk Flower",
      iconId: "UI_ItemIcon_100023",
      rarity: 2,
      description:
        "Silk Flowers that have been carefully processed to preserve their delicate texture.",
    },
    {
      id: "exquisite-silk-flower",
      name: "Exquisite Silk Flower",
      iconId: "UI_ItemIcon_100024",
      rarity: 3,
      description:
        "The most beautiful Silk Flowers, prized by artisans across the realm.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "dendrobium",
      name: "Dendrobium",
      iconId: "UI_ItemIcon_100025",
      rarity: 1,
      description:
        "A orchid-like flower that blooms in the forest. Sweet-scented.",
    },
    {
      id: "pristine-dendrobium",
      name: "Pristine Dendrobium",
      iconId: "UI_ItemIcon_100026",
      rarity: 2,
      description:
        "Dendrobiums in perfect condition, with vibrant colors and strong fragrance.",
    },
    {
      id: "celestial-dendrobium",
      name: "Celestial Dendrobium",
      iconId: "UI_ItemIcon_100027",
      rarity: 3,
      description:
        "A legendary Dendrobium said to blossom only once every hundred years.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "fluorescent-fungus",
      name: "Fluorescent Fungus",
      iconId: "UI_ItemIcon_100028",
      rarity: 1,
      description:
        "A bioluminescent fungus from the deep forest. Glows with a blue light.",
    },
    {
      id: "luminous-fungus",
      name: "Luminous Fungus",
      iconId: "UI_ItemIcon_100029",
      rarity: 2,
      description: "Highly luminescent fungi that glow brightly in darkness.",
    },
    {
      id: "celestial-fungus",
      name: "Celestial Fungus",
      iconId: "UI_ItemIcon_100030",
      rarity: 3,
      description:
        "Rare fungus that glows with colors of the stars and cosmos.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "kalpalata-lotus",
      name: "Kalpalata Lotus",
      iconId: "UI_ItemIcon_100031",
      rarity: 1,
      description:
        "A lotus flower from the sacred waters. Has a meditation-inducing fragrance.",
    },
    {
      id: "refined-kalpalata-lotus",
      name: "Refined Kalpalata Lotus",
      iconId: "UI_ItemIcon_100032",
      rarity: 2,
      description:
        "Kalpalata Lotus that has been carefully preserved and refined.",
    },
    {
      id: "blessed-kalpalata-lotus",
      name: "Blessed Kalpalata Lotus",
      iconId: "UI_ItemIcon_100033",
      rarity: 3,
      description:
        "The most sacred Kalpalata Lotus, blessed by ancient spirits.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "padisarah",
      name: "Padisarah",
      iconId: "UI_ItemIcon_100034",
      rarity: 1,
      description:
        "A desert flower with golden petals. Symbolizes hope in arid lands.",
    },
    {
      id: "golden-padisarah",
      name: "Golden Padisarah",
      iconId: "UI_ItemIcon_100041",
      rarity: 2,
      description:
        "Padisarah flowers with enhanced golden coloring and fragrance.",
    },
    {
      id: "radiant-padisarah",
      name: "Radiant Padisarah",
      iconId: "UI_ItemIcon_100051",
      rarity: 3,
      description: "The rarest Padisarah, said to glow with inner light.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "scarab",
      name: "Scarab",
      iconId: "UI_ItemIcon_100052",
      rarity: 1,
      description:
        "An iridescent beetle found in the desert. Harmless and colorful.",
    },
    {
      id: "prismatic-scarab",
      name: "Prismatic Scarab",
      iconId: "UI_ItemIcon_100053",
      rarity: 2,
      description:
        "Scarab beetles with enhanced iridescence and color variation.",
    },
    {
      id: "celestial-scarab",
      name: "Celestial Scarab",
      iconId: "UI_ItemIcon_100054",
      rarity: 3,
      description:
        "Legendary beetles that shimmer with the colors of the cosmos.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "moonfall-silver",
      name: "Moonfall Silver",
      iconId: "UI_ItemIcon_100055",
      rarity: 1,
      description: "A silvery plant found in Nod-Krai. Blooms under moonlight.",
    },
    {
      id: "refined-moonfall-silver",
      name: "Refined Moonfall Silver",
      iconId: "UI_ItemIcon_100056",
      rarity: 2,
      description:
        "Moonfall Silver carefully processed to enhance its properties.",
    },
    {
      id: "pristine-moonfall-silver",
      name: "Pristine Moonfall Silver",
      iconId: "UI_ItemIcon_100057",
      rarity: 3,
      description:
        "The finest Moonfall Silver, said to capture the essence of moonlight.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "frost-vein-petal",
      name: "Frost Vein Petal",
      iconId: "UI_ItemIcon_100058",
      rarity: 1,
      description:
        "A delicate petal from Nod-Krai's frozen regions. Cold to the touch.",
    },
    {
      id: "refined-frost-vein-petal",
      name: "Refined Frost Vein Petal",
      iconId: "UI_ItemIcon_100059",
      rarity: 2,
      description:
        "Frost Vein Petals carefully preserved to maintain their icy properties.",
    },
    {
      id: "pristine-frost-vein-petal",
      name: "Pristine Frost Vein Petal",
      iconId: "UI_ItemIcon_100060",
      rarity: 3,
      description:
        "The finest Frost Vein Petals, eternally frozen in perfect condition.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "windwheel-aster",
      name: "Windwheel Aster",
      iconId: "UI_ItemIcon_100055",
      rarity: 1,
      description:
        "A flower that spins in the wind. Found in Mondstadt's windswept plains.",
    },
    {
      id: "refined-windwheel-aster",
      name: "Refined Windwheel Aster",
      iconId: "UI_ItemIcon_100056",
      rarity: 2,
      description:
        "Windwheel Asters carefully preserved to maintain their spinning motion.",
    },
    {
      id: "pristine-windwheel-aster",
      name: "Pristine Windwheel Aster",
      iconId: "UI_ItemIcon_100057",
      rarity: 3,
      description:
        "The finest Windwheel Asters, perfectly balanced and eternally spinning.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "cinder-bloom",
      name: "Cinder Bloom",
      iconId: "UI_ItemIcon_100058",
      rarity: 1,
      description:
        "A fiery flower from Nod-Krai that blooms in volcanic regions.",
    },
    {
      id: "blazing-cinder-bloom",
      name: "Blazing Cinder Bloom",
      iconId: "UI_ItemIcon_100059",
      rarity: 2,
      description:
        "Cinder Blooms with intensified flames and enhanced properties.",
    },
    {
      id: "eternal-cinder-bloom",
      name: "Eternal Cinder Bloom",
      iconId: "UI_ItemIcon_100060",
      rarity: 3,
      description:
        "The rarest Cinder Blooms, said to burn with an eternal flame.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "philanemo-mushroom",
      name: "Philanemo Mushroom",
      iconId: "UI_ItemIcon_100061",
      rarity: 1,
      description:
        "A mushroom found in Mondstadt. Grows in shaded, windy areas.",
    },
    {
      id: "refined-philanemo-mushroom",
      name: "Refined Philanemo Mushroom",
      iconId: "UI_ItemIcon_100062",
      rarity: 2,
      description:
        "Philanemo Mushrooms carefully processed to enhance their properties.",
    },
    {
      id: "pristine-philanemo-mushroom",
      name: "Pristine Philanemo Mushroom",
      iconId: "UI_ItemIcon_100063",
      rarity: 3,
      description: "The finest Philanemo Mushrooms, perfectly preserved.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "quenepa-berry",
      name: "Quenepa Berry",
      iconId: "UI_ItemIcon_101201",
      rarity: 1,
      description: "A sweet and tart berry native to the forests of Natlan.",
    },
    {
      id: "fine-quenepa-berry",
      name: "Fine Quenepa Berry",
      iconId: "UI_ItemIcon_101202",
      rarity: 2,
      description:
        "High-quality Quenepa Berries selected for their perfect ripeness.",
    },
    {
      id: "premium-quenepa-berry",
      name: "Premium Quenepa Berry",
      iconId: "UI_ItemIcon_101203",
      rarity: 3,
      description:
        "The finest Quenepa Berries, prized for their exceptional flavor.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "overripe-flamegranate",
      name: "Overripe Flamegranate",
      iconId: "UI_ItemIcon_101204",
      rarity: 1,
      description: "A flame-infused fruit that has ripened to perfection.",
    },
    {
      id: "fine-flamegranate",
      name: "Fine Flamegranate",
      iconId: "UI_ItemIcon_101205",
      rarity: 2,
      description: "High-quality Flamegranates with enhanced fiery properties.",
    },
    {
      id: "premium-flamegranate",
      name: "Premium Flamegranate",
      iconId: "UI_ItemIcon_101206",
      rarity: 3,
      description:
        "The finest Flamegranates, burning with intense elemental energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "cloud-puff-berry",
      name: "Cloud Puff Berry",
      iconId: "UI_ItemIcon_101207",
      rarity: 1,
      description:
        "A fluffy berry that grows in the highlands of Natlan. Light as a cloud.",
    },
    {
      id: "fine-cloud-puff-berry",
      name: "Fine Cloud Puff Berry",
      iconId: "UI_ItemIcon_101208",
      rarity: 2,
      description:
        "High-quality Cloud Puff Berries with enhanced fluffiness and flavor.",
    },
    {
      id: "premium-cloud-puff-berry",
      name: "Premium Cloud Puff Berry",
      iconId: "UI_ItemIcon_101209",
      rarity: 3,
      description:
        "The finest Cloud Puff Berries, prized for their ethereal texture.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "trishiraite",
      name: "Trishiraite",
      iconId: "UI_ItemIcon_101210",
      rarity: 1,
      description:
        "A crystalline mineral found in the deserts of Sumeru. Glows with electro energy.",
    },
    {
      id: "fine-trishiraite",
      name: "Fine Trishiraite",
      iconId: "UI_ItemIcon_101211",
      rarity: 2,
      description:
        "High-quality Trishiraite with enhanced electro conductivity.",
    },
    {
      id: "premium-trishiraite",
      name: "Premium Trishiraite",
      iconId: "UI_ItemIcon_101212",
      rarity: 3,
      description:
        "The finest Trishiraite, pulsing with concentrated electro power.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "amakumo-fruit",
      name: "Amakumo Fruit",
      iconId: "UI_ItemIcon_101213",
      rarity: 1,
      description:
        "A fruit that grows on Seirai Island. Absorbs the energy of thunderstorms.",
    },
    {
      id: "fine-amakumo-fruit",
      name: "Fine Amakumo Fruit",
      iconId: "UI_ItemIcon_101214",
      rarity: 2,
      description: "High-quality Amakumo Fruits with enhanced electro energy.",
    },
    {
      id: "premium-amakumo-fruit",
      name: "Premium Amakumo Fruit",
      iconId: "UI_ItemIcon_101215",
      rarity: 3,
      description:
        "The finest Amakumo Fruits, pulsing with concentrated electro power.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "lumidouce-bell",
      name: "Lumidouce Bell",
      iconId: "UI_ItemIcon_101216",
      rarity: 1,
      description: "A glowing flower from Fontaine that blooms in moonlight.",
    },
    {
      id: "fine-lumidouce-bell",
      name: "Fine Lumidouce Bell",
      iconId: "UI_ItemIcon_101217",
      rarity: 2,
      description: "High-quality Lumidouce Bells with enhanced luminescence.",
    },
    {
      id: "premium-lumidouce-bell",
      name: "Premium Lumidouce Bell",
      iconId: "UI_ItemIcon_101218",
      rarity: 3,
      description: "The finest Lumidouce Bells, glowing with ethereal light.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "mourning-flower",
      name: "Mourning Flower",
      iconId: "UI_ItemIcon_101225",
      rarity: 1,
      description:
        "A flower that grows in the deserts of Sumeru. Symbolizes remembrance.",
    },
    {
      id: "fine-mourning-flower",
      name: "Fine Mourning Flower",
      iconId: "UI_ItemIcon_101226",
      rarity: 2,
      description: "High-quality Mourning Flowers with enhanced fragrance.",
    },
    {
      id: "premium-mourning-flower",
      name: "Premium Mourning Flower",
      iconId: "UI_ItemIcon_101227",
      rarity: 3,
      description:
        "The finest Mourning Flowers, carrying deep emotional resonance.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "nilotpala-lotus",
      name: "Nilotpala Lotus",
      iconId: "UI_ItemIcon_101228",
      rarity: 1,
      description:
        "A lotus that blooms in the sacred waters of Sumeru. Glows with dendro energy.",
    },
    {
      id: "fine-nilotpala-lotus",
      name: "Fine Nilotpala Lotus",
      iconId: "UI_ItemIcon_101229",
      rarity: 2,
      description:
        "High-quality Nilotpala Lotuses with enhanced dendro properties.",
    },
    {
      id: "premium-nilotpala-lotus",
      name: "Premium Nilotpala Lotus",
      iconId: "UI_ItemIcon_101230",
      rarity: 3,
      description:
        "The finest Nilotpala Lotuses, pulsing with concentrated dendro power.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "henna-berry",
      name: "Henna Berry",
      iconId: "UI_ItemIcon_101231",
      rarity: 1,
      description:
        "A berry used for traditional dyes in the deserts of Sumeru.",
    },
    {
      id: "fine-henna-berry",
      name: "Fine Henna Berry",
      iconId: "UI_ItemIcon_101232",
      rarity: 2,
      description: "High-quality Henna Berries with enhanced dye properties.",
    },
    {
      id: "premium-henna-berry",
      name: "Premium Henna Berry",
      iconId: "UI_ItemIcon_101233",
      rarity: 3,
      description: "The finest Henna Berries, prized for their vibrant color.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "rukkhashava-mushrooms",
      name: "Rukkhashava Mushrooms",
      iconId: "UI_ItemIcon_101234",
      rarity: 1,
      description:
        "Mushrooms that grow in the forests of Sumeru. Rich in dendro energy.",
    },
    {
      id: "fine-rukkhashava-mushrooms",
      name: "Fine Rukkhashava Mushrooms",
      iconId: "UI_ItemIcon_101235",
      rarity: 2,
      description:
        "High-quality Rukkhashava Mushrooms with enhanced dendro properties.",
    },
    {
      id: "premium-rukkhashava-mushrooms",
      name: "Premium Rukkhashava Mushrooms",
      iconId: "UI_ItemIcon_101236",
      rarity: 3,
      description:
        "The finest Rukkhashava Mushrooms, pulsing with concentrated dendro power.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "onikabuto",
      name: "Onikabuto",
      iconId: "UI_ItemIcon_101237",
      rarity: 1,
      description: "A beetle found in Inazuma. Its shell is as hard as iron.",
    },
    {
      id: "fine-onikabuto",
      name: "Fine Onikabuto",
      iconId: "UI_ItemIcon_101238",
      rarity: 2,
      description: "High-quality Onikabutos with enhanced shell durability.",
    },
    {
      id: "premium-onikabuto",
      name: "Premium Onikabuto",
      iconId: "UI_ItemIcon_101239",
      rarity: 3,
      description:
        "The finest Onikabutos, with shells as hard as legendary armor.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "cor-lapis",
      name: "Cor Lapis",
      iconId: "UI_ItemIcon_101240",
      rarity: 1,
      description:
        "A precious stone found in the mountains of Liyue. Contains geo energy.",
    },
    {
      id: "fine-cor-lapis",
      name: "Fine Cor Lapis",
      iconId: "UI_ItemIcon_101241",
      rarity: 2,
      description: "High-quality Cor Lapis with enhanced geo properties.",
    },
    {
      id: "premium-cor-lapis",
      name: "Premium Cor Lapis",
      iconId: "UI_ItemIcon_101242",
      rarity: 3,
      description: "The finest Cor Lapis, pulsing with concentrated geo power.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "violetgrass",
      name: "Violetgrass",
      iconId: "UI_ItemIcon_101243",
      rarity: 1,
      description:
        "A purple flower that grows on the cliffs of Liyue. Has medicinal properties.",
    },
    {
      id: "fine-violetgrass",
      name: "Fine Violetgrass",
      iconId: "UI_ItemIcon_101244",
      rarity: 2,
      description:
        "High-quality Violetgrass with enhanced medicinal properties.",
    },
    {
      id: "premium-violetgrass",
      name: "Premium Violetgrass",
      iconId: "UI_ItemIcon_101245",
      rarity: 3,
      description:
        "The finest Violetgrass, prized for its potent healing effects.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "noctilucous-jade",
      name: "Noctilucous Jade",
      iconId: "UI_ItemIcon_101246",
      rarity: 1,
      description:
        "A glowing crystal found in the mines of Liyue. Emits light in darkness.",
    },
    {
      id: "fine-noctilucous-jade",
      name: "Fine Noctilucous Jade",
      iconId: "UI_ItemIcon_101247",
      rarity: 2,
      description: "High-quality Noctilucous Jade with enhanced luminescence.",
    },
    {
      id: "premium-noctilucous-jade",
      name: "Premium Noctilucous Jade",
      iconId: "UI_ItemIcon_101248",
      rarity: 3,
      description: "The finest Noctilucous Jade, glowing with ethereal light.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "dandelion-seed",
      name: "Dandelion Seed",
      iconId: "UI_ItemIcon_101249",
      rarity: 1,
      description: "Seeds from dandelions that float in the wind of Mondstadt.",
    },
    {
      id: "fine-dandelion-seed",
      name: "Fine Dandelion Seed",
      iconId: "UI_ItemIcon_101250",
      rarity: 2,
      description:
        "High-quality Dandelion Seeds with enhanced anemo properties.",
    },
    {
      id: "premium-dandelion-seed",
      name: "Premium Dandelion Seed",
      iconId: "UI_ItemIcon_101251",
      rarity: 3,
      description:
        "The finest Dandelion Seeds, carrying the spirit of the wind.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "jueyun-chili",
      name: "Jueyun Chili",
      iconId: "UI_ItemIcon_101252",
      rarity: 1,
      description:
        "A spicy pepper that grows in the mountains of Liyue. Packs a fiery punch.",
    },
    {
      id: "fine-jueyun-chili",
      name: "Fine Jueyun Chili",
      iconId: "UI_ItemIcon_101253",
      rarity: 2,
      description: "High-quality Jueyun Chilis with enhanced pyro properties.",
    },
    {
      id: "premium-jueyun-chili",
      name: "Premium Jueyun Chili",
      iconId: "UI_ItemIcon_101254",
      rarity: 3,
      description:
        "The finest Jueyun Chilis, burning with concentrated fire energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "wither-valentia-nut",
      name: "Wither Valentia Nut",
      iconId: "UI_ItemIcon_101255",
      rarity: 1,
      description:
        "A nut that grows in the volcanic regions of Natlan. Contains pyro energy.",
    },
    {
      id: "fine-wither-valentia-nut",
      name: "Fine Wither Valentia Nut",
      iconId: "UI_ItemIcon_101256",
      rarity: 2,
      description:
        "High-quality Wither Valentia Nuts with enhanced pyro properties.",
    },
    {
      id: "premium-wither-valentia-nut",
      name: "Premium Wither Valentia Nut",
      iconId: "UI_ItemIcon_101257",
      rarity: 3,
      description:
        "The finest Wither Valentia Nuts, burning with concentrated fire energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "bulle-fruit",
      name: "Bulle Fruit",
      iconId: "UI_ItemIcon_101258",
      rarity: 1,
      description:
        "A fruit that grows in the forests of Fontaine. Has a unique flavor.",
    },
    {
      id: "fine-bulle-fruit",
      name: "Fine Bulle Fruit",
      iconId: "UI_ItemIcon_101259",
      rarity: 2,
      description: "High-quality Bulle Fruits with enhanced hydro properties.",
    },
    {
      id: "premium-bulle-fruit",
      name: "Premium Bulle Fruit",
      iconId: "UI_ItemIcon_101260",
      rarity: 3,
      description: "The finest Bulle Fruits, prized for their exquisite taste.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "sea-ganoderma",
      name: "Sea Ganoderma",
      iconId: "UI_ItemIcon_101261",
      rarity: 1,
      description:
        "A fungus that grows on the seafloor of Inazuma. Contains electro energy.",
    },
    {
      id: "fine-sea-ganoderma",
      name: "Fine Sea Ganoderma",
      iconId: "UI_ItemIcon_101262",
      rarity: 2,
      description:
        "High-quality Sea Ganoderma with enhanced electro properties.",
    },
    {
      id: "premium-sea-ganoderma",
      name: "Premium Sea Ganoderma",
      iconId: "UI_ItemIcon_101263",
      rarity: 3,
      description:
        "The finest Sea Ganoderma, charged with concentrated electro energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "rainbow-rose",
      name: "Rainbow Rose",
      iconId: "UI_ItemIcon_101264",
      rarity: 1,
      description:
        "A rare rose that grows in Fontaine. Changes color with the light.",
    },
    {
      id: "fine-rainbow-rose",
      name: "Fine Rainbow Rose",
      iconId: "UI_ItemIcon_101265",
      rarity: 2,
      description: "High-quality Rainbow Roses with enhanced hydro properties.",
    },
    {
      id: "premium-rainbow-rose",
      name: "Premium Rainbow Rose",
      iconId: "UI_ItemIcon_101266",
      rarity: 3,
      description:
        "The finest Rainbow Roses, shimmering with concentrated hydro energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "lakelight-lily",
      name: "Lakelight Lily",
      iconId: "UI_ItemIcon_101267",
      rarity: 1,
      description:
        "A lily that grows near lakes in Fontaine. Glows with soft light.",
    },
    {
      id: "fine-lakelight-lily",
      name: "Fine Lakelight Lily",
      iconId: "UI_ItemIcon_101268",
      rarity: 2,
      description:
        "High-quality Lakelight Lilies with enhanced hydro properties.",
    },
    {
      id: "premium-lakelight-lily",
      name: "Premium Lakelight Lily",
      iconId: "UI_ItemIcon_101269",
      rarity: 3,
      description:
        "The finest Lakelight Lilies, radiating with concentrated hydro energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "berryl-conch",
      name: "Berryl Conch",
      iconId: "UI_ItemIcon_101270",
      rarity: 1,
      description:
        "A conch that grows in the waters of Fontaine. Contains cryo energy.",
    },
    {
      id: "fine-berryl-conch",
      name: "Fine Berryl Conch",
      iconId: "UI_ItemIcon_101271",
      rarity: 2,
      description: "High-quality Berryl Conchs with enhanced cryo properties.",
    },
    {
      id: "premium-berryl-conch",
      name: "Premium Berryl Conch",
      iconId: "UI_ItemIcon_101272",
      rarity: 3,
      description:
        "The finest Berryl Conchs, charged with concentrated cryo energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "lumitoile",
      name: "Lumitoile",
      iconId: "UI_ItemIcon_101273",
      rarity: 1,
      description:
        "A flower that grows in the waters of Fontaine. Glows with hydro energy.",
    },
    {
      id: "fine-lumitoile",
      name: "Fine Lumitoile",
      iconId: "UI_ItemIcon_101274",
      rarity: 2,
      description: "High-quality Lumitoiles with enhanced hydro properties.",
    },
    {
      id: "premium-lumitoile",
      name: "Premium Lumitoile",
      iconId: "UI_ItemIcon_101275",
      rarity: 3,
      description:
        "The finest Lumitoiles, radiating with concentrated hydro energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "subdetection-unit",
      name: "Subdetection Unit",
      iconId: "UI_ItemIcon_101276",
      rarity: 1,
      description:
        "A mechanical device found in Fontaine. Contains cryo energy.",
    },
    {
      id: "fine-subdetection-unit",
      name: "Fine Subdetection Unit",
      iconId: "UI_ItemIcon_101277",
      rarity: 2,
      description:
        "High-quality Subdetection Units with enhanced cryo properties.",
    },
    {
      id: "premium-subdetection-unit",
      name: "Premium Subdetection Unit",
      iconId: "UI_ItemIcon_101278",
      rarity: 3,
      description:
        "The finest Subdetection Units, charged with concentrated cryo energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "sango-pearl",
      name: "Sango Pearl",
      iconId: "UI_ItemIcon_101203",
      rarity: 1,
      description: "A pearl that grows in Inazuma. Contains hydro energy.",
    },
    {
      id: "fine-sango-pearl",
      name: "Fine Sango Pearl",
      iconId: "UI_ItemIcon_101204",
      rarity: 2,
      description: "High-quality Sango Pearls with enhanced hydro properties.",
    },
    {
      id: "premium-sango-pearl",
      name: "Premium Sango Pearl",
      iconId: "UI_ItemIcon_101205",
      rarity: 3,
      description:
        "The finest Sango Pearls, radiating with concentrated hydro energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "naku-weed",
      name: "Naku Weed",
      iconId: "UI_ItemIcon_101206",
      rarity: 1,
      description: "A weed that grows in Inazuma. Contains pyro energy.",
    },
    {
      id: "fine-naku-weed",
      name: "Fine Naku Weed",
      iconId: "UI_ItemIcon_101207",
      rarity: 2,
      description: "High-quality Naku Weeds with enhanced pyro properties.",
    },
    {
      id: "premium-naku-weed",
      name: "Premium Naku Weed",
      iconId: "UI_ItemIcon_101208",
      rarity: 3,
      description:
        "The finest Naku Weeds, burning with concentrated pyro energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "crystal-marrow",
      name: "Crystal Marrow",
      iconId: "UI_ItemIcon_101209",
      rarity: 1,
      description: "A crystal that grows in Inazuma. Contains anemo energy.",
    },
    {
      id: "fine-crystal-marrow",
      name: "Fine Crystal Marrow",
      iconId: "UI_ItemIcon_101210",
      rarity: 2,
      description:
        "High-quality Crystal Marrows with enhanced anemo properties.",
    },
    {
      id: "premium-crystal-marrow",
      name: "Premium Crystal Marrow",
      iconId: "UI_ItemIcon_101211",
      rarity: 3,
      description:
        "The finest Crystal Marrows, radiating with concentrated anemo energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "cecilia",
      name: "Cecilia",
      iconId: "UI_ItemIcon_101212",
      rarity: 1,
      description: "A flower that grows in Mondstadt. Contains anemo energy.",
    },
    {
      id: "fine-cecilia",
      name: "Fine Cecilia",
      iconId: "UI_ItemIcon_101213",
      rarity: 2,
      description: "High-quality Cecilias with enhanced anemo properties.",
    },
    {
      id: "premium-cecilia",
      name: "Premium Cecilia",
      iconId: "UI_ItemIcon_101214",
      rarity: 3,
      description:
        "The finest Cecilias, radiating with concentrated anemo energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "sand-grease-pupae",
      name: "Sand Grease Pupae",
      iconId: "UI_ItemIcon_101215",
      rarity: 1,
      description:
        "A pupa found in the desert of Sumeru. Contains dendro energy.",
    },
    {
      id: "fine-sand-grease-pupae",
      name: "Fine Sand Grease Pupae",
      iconId: "UI_ItemIcon_101216",
      rarity: 2,
      description:
        "High-quality Sand Grease Pupae with enhanced dendro properties.",
    },
    {
      id: "premium-sand-grease-pupae",
      name: "Premium Sand Grease Pupae",
      iconId: "UI_ItemIcon_101217",
      rarity: 3,
      description:
        "The finest Sand Grease Pupae, radiating with concentrated dendro energy.",
    },
  ]),
  ...createThreeTierFamily("Local Specialty", [
    {
      id: "sakura-bloom",
      name: "Sakura Bloom",
      iconId: "UI_ItemIcon_101218",
      rarity: 1,
      description: "A flower that blooms in Inazuma. Contains electro energy.",
    },
    {
      id: "fine-sakura-bloom",
      name: "Fine Sakura Bloom",
      iconId: "UI_ItemIcon_101219",
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
];
