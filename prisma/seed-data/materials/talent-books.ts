import { createThreeTierFamily } from "@/prisma/seed-data/helpers";

export const talentBooks = [
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-freedom",
      name: "Teachings of Freedom",
      iconId: "UI_ItemIcon_104301",
      rarity: 2,
      description:
        "Talent teachings from Mondstadt emphasizing the ideals of freedom.",
    },
    {
      id: "guide-to-freedom",
      name: "Guide to Freedom",
      iconId: "UI_ItemIcon_104302",
      rarity: 3,
      description: "A more complete manuscript detailing the path of freedom.",
    },
    {
      id: "philosophies-of-freedom",
      name: "Philosophies of Freedom",
      iconId: "UI_ItemIcon_104303",
      rarity: 4,
      description: "A complete philosophical treatise on freedom.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-resistance",
      name: "Teachings of Resistance",
      iconId: "UI_ItemIcon_104304",
      rarity: 2,
      description: "Talent teachings from Mondstadt that focus on resistance.",
    },
    {
      id: "guide-to-resistance",
      name: "Guide to Resistance",
      iconId: "UI_ItemIcon_104305",
      rarity: 3,
      description: "A guidebook for those who push forward against hardship.",
    },
    {
      id: "philosophies-of-resistance",
      name: "Philosophies of Resistance",
      iconId: "UI_ItemIcon_104306",
      rarity: 4,
      description: "A complete collection of Mondstadt's resistance teachings.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-ballad",
      name: "Teachings of Ballad",
      iconId: "UI_ItemIcon_104307",
      rarity: 2,
      description:
        "Talent teachings from Mondstadt celebrating poetry and song.",
    },
    {
      id: "guide-to-ballad",
      name: "Guide to Ballad",
      iconId: "UI_ItemIcon_104308",
      rarity: 3,
      description: "A fuller manual of ballad and artistry.",
    },
    {
      id: "philosophies-of-ballad",
      name: "Philosophies of Ballad",
      iconId: "UI_ItemIcon_104309",
      rarity: 4,
      description: "A refined volume on the spirit of ballad.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-prosperity",
      name: "Teachings of Prosperity",
      iconId: "UI_ItemIcon_104310",
      rarity: 2,
      description:
        "Liyue talent teachings built around the idea of prosperity.",
    },
    {
      id: "guide-to-prosperity",
      name: "Guide to Prosperity",
      iconId: "UI_ItemIcon_104311",
      rarity: 3,
      description: "A practical guide for those pursuing prosperity.",
    },
    {
      id: "philosophies-of-prosperity",
      name: "Philosophies of Prosperity",
      iconId: "UI_ItemIcon_104312",
      rarity: 4,
      description: "The highest form of Liyue's prosperity teachings.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-diligence",
      name: "Teachings of Diligence",
      iconId: "UI_ItemIcon_104313",
      rarity: 2,
      description: "Liyue talent teachings focused on persistence and effort.",
    },
    {
      id: "guide-to-diligence",
      name: "Guide to Diligence",
      iconId: "UI_ItemIcon_104314",
      rarity: 3,
      description: "A fuller record of the path of diligence.",
    },
    {
      id: "philosophies-of-diligence",
      name: "Philosophies of Diligence",
      iconId: "UI_ItemIcon_104315",
      rarity: 4,
      description: "The most complete writings on diligence in Liyue.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-gold",
      name: "Teachings of Gold",
      iconId: "UI_ItemIcon_104316",
      rarity: 2,
      description:
        "Liyue talent teachings centered on value and responsibility.",
    },
    {
      id: "guide-to-gold",
      name: "Guide to Gold",
      iconId: "UI_ItemIcon_104317",
      rarity: 3,
      description: "An advanced guide covering the principles of gold.",
    },
    {
      id: "philosophies-of-gold",
      name: "Philosophies of Gold",
      iconId: "UI_ItemIcon_104318",
      rarity: 4,
      description: "The highest compilation of Liyue's teachings on gold.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-transience",
      name: "Teachings of Transience",
      iconId: "UI_ItemIcon_104319",
      rarity: 2,
      description:
        "Inazuman teachings reflecting the fleeting nature of all things.",
    },
    {
      id: "guide-to-transience",
      name: "Guide to Transience",
      iconId: "UI_ItemIcon_104320",
      rarity: 3,
      description: "A deeper guide to the lesson of transience.",
    },
    {
      id: "philosophies-of-transience",
      name: "Philosophies of Transience",
      iconId: "UI_ItemIcon_104321",
      rarity: 4,
      description: "The most complete volume on transience.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-elegance",
      name: "Teachings of Elegance",
      iconId: "UI_ItemIcon_104322",
      rarity: 2,
      description: "Inazuman teachings on grace, discipline, and refinement.",
    },
    {
      id: "guide-to-elegance",
      name: "Guide to Elegance",
      iconId: "UI_ItemIcon_104323",
      rarity: 3,
      description: "An advanced guidebook expanding the theme of elegance.",
    },
    {
      id: "philosophies-of-elegance",
      name: "Philosophies of Elegance",
      iconId: "UI_ItemIcon_104324",
      rarity: 4,
      description: "The most refined expression of Inazuman elegance.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-light",
      name: "Teachings of Light",
      iconId: "UI_ItemIcon_104325",
      rarity: 2,
      description: "Inazuman teachings on illumination, justice, and sight.",
    },
    {
      id: "guide-to-light",
      name: "Guide to Light",
      iconId: "UI_ItemIcon_104326",
      rarity: 3,
      description: "A wider guide to the principles of light.",
    },
    {
      id: "philosophies-of-light",
      name: "Philosophies of Light",
      iconId: "UI_ItemIcon_104327",
      rarity: 4,
      description: "The final, complete teachings on light.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-admonition",
      name: "Teachings of Admonition",
      iconId: "UI_ItemIcon_104328",
      rarity: 2,
      description:
        "Sumeru talent teachings representing the lessons of the jungle.",
    },
    {
      id: "guide-to-admonition",
      name: "Guide to Admonition",
      iconId: "UI_ItemIcon_104329",
      rarity: 3,
      description: "A more thorough manual of the path of admonition.",
    },
    {
      id: "philosophies-of-admonition",
      name: "Philosophies of Admonition",
      iconId: "UI_ItemIcon_104330",
      rarity: 4,
      description: "The peak of Sumerian wisdom regarding admonition.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-ingenuity",
      name: "Teachings of Ingenuity",
      iconId: "UI_ItemIcon_104331",
      rarity: 2,
      description:
        "Sumeru talent teachings that emphasize creativity and cleverness.",
    },
    {
      id: "guide-to-ingenuity",
      name: "Guide to Ingenuity",
      iconId: "UI_ItemIcon_104332",
      rarity: 3,
      description:
        "A practical guide for applying ingenuity to complex problems.",
    },
    {
      id: "philosophies-of-ingenuity",
      name: "Philosophies of Ingenuity",
      iconId: "UI_ItemIcon_104333",
      rarity: 4,
      description: "The most advanced philosophical treatise on ingenuity.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-praxis",
      name: "Teachings of Praxis",
      iconId: "UI_ItemIcon_104334",
      rarity: 2,
      description: "Sumeru talent teachings focused on practice and action.",
    },
    {
      id: "guide-to-praxis",
      name: "Guide to Praxis",
      iconId: "UI_ItemIcon_104335",
      rarity: 3,
      description:
        "A manual for those who seek to master praxis through diligence.",
    },
    {
      id: "philosophies-of-praxis",
      name: "Philosophies of Praxis",
      iconId: "UI_ItemIcon_104336",
      rarity: 4,
      description: "The definitive guide to the philosophy of praxis.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-equity",
      name: "Teachings of Equity",
      iconId: "UI_ItemIcon_104337",
      rarity: 2,
      description:
        "Fontaine talent teachings emphasizing the principles of fairness.",
    },
    {
      id: "guide-to-equity",
      name: "Guide to Equity",
      iconId: "UI_ItemIcon_104338",
      rarity: 3,
      description: "A more complete manuscript detailing the path of equity.",
    },
    {
      id: "philosophies-of-equity",
      name: "Philosophies of Equity",
      iconId: "UI_ItemIcon_104339",
      rarity: 4,
      description: "A complete philosophical treatise on equity.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-justice",
      name: "Teachings of Justice",
      iconId: "UI_ItemIcon_104340",
      rarity: 2,
      description:
        "Fontaine talent teachings that focus on the ideal of justice.",
    },
    {
      id: "guide-to-justice",
      name: "Guide to Justice",
      iconId: "UI_ItemIcon_104341",
      rarity: 3,
      description: "A guidebook for those who uphold the laws of Fontaine.",
    },
    {
      id: "philosophies-of-justice",
      name: "Philosophies of Justice",
      iconId: "UI_ItemIcon_104342",
      rarity: 4,
      description:
        "The highest compilation of Fontaine's teachings on justice.",
    },
  ]),
  ...createThreeTierFamily("Talent Book", [
    {
      id: "teachings-of-order",
      name: "Teachings of Order",
      iconId: "UI_ItemIcon_104343",
      rarity: 2,
      description: "Fontaine talent teachings celebrating structure and law.",
    },
    {
      id: "guide-to-order",
      name: "Guide to Order",
      iconId: "UI_ItemIcon_104344",
      rarity: 3,
      description: "A manual for maintaining order in the Court of Fontaine.",
    },
    {
      id: "philosophies-of-order",
      name: "Philosophies of Order",
      iconId: "UI_ItemIcon_104345",
      rarity: 4,
      description: "The final, most complete teachings on order.",
    },
  ]),
];
