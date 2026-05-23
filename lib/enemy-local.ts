// Generated from local data/enemies and data/boss/weekly-boss on 2026-05-23.
// This avoids runtime filesystem scanning in Vercel serverless functions.

export type LocalEnemyEntry = {
  id: string;
  name: string;
  type: string;
  family: string;
  faction: string | null;
  region: string;
  description: string;
  elements: string[];
  drops: unknown;
  image: string | null;
  portrait: string | null;
};

export const localEnemyEntries = [
  {
    "id": "abyss-herald",
    "name": "Abyss Heralds",
    "type": "Elite Enemies",
    "family": "The Abyss",
    "faction": "Abyss Order",
    "region": "Global",
    "description": "N/A",
    "elements": [
      "Hydro",
      "Cryo"
    ],
    "drops": [
      {
        "name": "Dead Ley Line Branch",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Dead Ley Line Leaves",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Ley Line Sprout",
        "rarity": 4,
        "minimum-level": 60
      },
      {
        "name": "Gloomy Statuette",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Dark Statuette",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Deathly Statuette",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "abyss-lector",
    "name": "Abyss Lector",
    "type": "Elite Enemies",
    "family": "The Abyss",
    "faction": "Abyss Order",
    "region": "Global",
    "description": "N/A",
    "elements": [
      "Pyro",
      "Electro"
    ],
    "drops": [
      {
        "name": "Dead Ley Line Branch",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Dead Ley Line Leaves",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Ley Line Sprout",
        "rarity": 4,
        "minimum-level": 60
      },
      {
        "name": "Gloomy Statuette",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Dark Statuette",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Deathly Statuette",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "abyss-mage",
    "name": "Abyss Mage",
    "type": "Elite Enemies",
    "family": "The Abyss",
    "faction": "Abyss Order",
    "region": "Global",
    "description": "Abyss creatures who can command the power of the elements in combat to a certain extent. For unknown reasons, abyss mages are able to communicate with the hilichurls, thus enabling them to manipulate their minds easily. They say abyss mages utter a long-forgotten language from which they draw magical power.",
    "elements": [
      "Hydro",
      "Pyro",
      "Cryo",
      "Electro",
      "Hydro",
      "Pyro",
      "Cryo",
      "Electro"
    ],
    "drops": [
      {
        "name": "Dead Ley Line Branch",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Dead Ley Line Leaves",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Ley Line Sprouts",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/abyss-mage/icon",
    "portrait": "/images/enemies/abyss-mage/portrait"
  },
  {
    "id": "bathysmal-vishap",
    "name": "Bathysmal Vishap",
    "type": "Elite Enemies",
    "family": "Mystical Beasts",
    "faction": null,
    "region": "Inazuma",
    "description": "A mighty race of vishaps that dwell within the deep seas. That they hate light is not due to an overly fragile sense of sight. Instead, it is because they have had the selfless sunlight and the surface world taken from them that they refuse to countenance man-made light.",
    "elements": [
      "Hydro"
    ],
    "drops": [
      {
        "name": "Fragile Bone Shard",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Sturdy Bone Shard",
        "rarity": 3,
        "minimum-level": 60
      },
      {
        "name": "Fossilized Bone Shard",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "bathysmal-vishap-hatchling",
    "name": "Bathysmal Vishap Hatchling",
    "type": "Elite Enemies",
    "family": "Mystical Beasts",
    "faction": null,
    "region": "Inazuma",
    "description": "A mighty race of vishaps that dwell within the deep seas. That they hate light is not due to an overly fragile sense of sight. Instead, it is because they have had the selfless sunlight and the surface world taken from them that they refuse to countenance man-made light.",
    "elements": [
      "Cryo",
      "Electro",
      "Hydro"
    ],
    "drops": [
      {
        "name": "Fragile Bone Shard",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Sturdy Bone Shard",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Fossilized Bone Shard",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "cicin",
    "name": "Cicin",
    "type": "Common Enemies",
    "family": "Mystical Beasts",
    "faction": null,
    "region": "Multiple",
    "description": "N/A",
    "elements": [
      "Cryo",
      "Electro",
      "Hydro",
      "Cryo",
      "Electro",
      "Hydro"
    ],
    "drops": "None",
    "image": null,
    "portrait": null
  },
  {
    "id": "consecrated-beast",
    "name": "Consecrated Beast",
    "type": "Elite Enemies",
    "family": "Mystical Beasts",
    "faction": null,
    "region": "Multiple",
    "description": "N/A",
    "elements": [
      "Anemo",
      "Pyro",
      "Electro"
    ],
    "drops": [
      {
        "name": "Desiccated Shell",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Sturdy Shell",
        "rarity": 3,
        "minimum-level": 60
      },
      {
        "name": "Marked Shell",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "defense-mechanism",
    "name": "Defense Mechanism",
    "type": "Unique Enemies",
    "family": "Unknown",
    "faction": null,
    "region": "Dragonspine",
    "description": "N/A",
    "elements": [
      "Pyro",
      "Cryo",
      "Hydro",
      "Electro"
    ],
    "drops": [],
    "image": "/images/enemies/defense-mechanism/icon",
    "portrait": null
  },
  {
    "id": "eye-of-the-storm",
    "name": "Eye of the Storm",
    "type": "Elite Enemies",
    "family": "Elemental Lifeforms",
    "faction": null,
    "region": "Monstadt",
    "description": "The corporeal form of extremely high-quality Anemo energies. The formation of an Eye of the Storm indicates that the elemental ley lines of a region are blocked, which has led to siltation. Its reckless, heedless wielding of storms that all but sweeps people off their feet may be due to its nature as a symbol of the world stricken by malaise.",
    "elements": [
      "Hydro",
      "Pyro",
      "Cryo"
    ],
    "drops": "None",
    "image": "/images/enemies/eye-of-the-storm/icon",
    "portrait": null
  },
  {
    "id": "fatui-agent",
    "name": "Fatui Agent",
    "type": "Elite Enemies",
    "family": "Fatui",
    "faction": "Fatui",
    "region": "Global",
    "description": "A Fatui secret agent. The duty of a Fatui agent is to settle debts — but not only those of a monetary or goods-in-kind nature. They also ensure dues are paid when it comes to the principle of \"an eye for an eye.\" If there is one thing the Fatui are not known for, it is leniency, and whoever dares to oppose them will invoke the full force of their wrath upon them.",
    "elements": [
      "Pyro"
    ],
    "drops": [
      {
        "name": "Hunter's Sacrificial Knife",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Agent's Sacrificial Knife",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Inspector's Sacrificial Knife",
        "rarity": 4,
        "minimum-level": 60
      },
      {
        "name": "Recruit's Insignia",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Sergeant's Insignia",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Lieutenant's Insignia",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/fatui-agent/icon",
    "portrait": "/images/enemies/fatui-agent/portrait"
  },
  {
    "id": "fatui-cicin-mage",
    "name": "Fatui Cicin Mage",
    "type": "Elite Enemies",
    "family": "Fatui",
    "faction": "Fatui",
    "region": "Global",
    "description": "A Fatui mage who can command Cicins in battle. Similarly to the way that Cicins go crazy for Mist Grass, Cicin Mages take great pleasure in toying with their prey. They seem to wander the land aimlessly, as if compelled by some unknown duty.",
    "elements": [
      "Cryo",
      "Electro"
    ],
    "drops": [
      {
        "name": "Mist Grass Pollen",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Mist Grass",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Mist Grass Wick",
        "rarity": 4,
        "minimum-level": 60
      },
      {
        "name": "Recruit's Insignia",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Sergeant's Insignia",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Lieutenant's Insignia",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/fatui-cicin-mage/icon",
    "portrait": "/images/enemies/fatui-cicin-mage/portrait"
  },
  {
    "id": "fatui-skirmisher",
    "name": "Fatui Skirmisher",
    "type": "Common Enemies",
    "family": "Fatui",
    "faction": "Fatui",
    "region": "Global",
    "description": "A soldier encased within a Fatui war machine. These skirmishers do not question if they shall live or die as they advance into nations far from home to complete advance missions and lay the groundwork for operations to come. Unlike the elite Mages and Agents, Fatui Skirmishers are soldiers of lesser individual might. To complete their tasks and reduce losses in men and materiel, their tactics are thus more reliant on teamwork.",
    "elements": [
      "Geo",
      "Pyro",
      "Cryo",
      "Hydro",
      "Anemo",
      "Electro"
    ],
    "drops": [
      {
        "name": "Recruit's Insignia",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Sergeant's Insignia",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Lieutenant's Insignia",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/fatui-skirmisher/icon",
    "portrait": null
  },
  {
    "id": "floating-fungus",
    "name": "Floating Fungus",
    "type": "Common Enemies",
    "family": "Mystical Beasts",
    "faction": null,
    "region": "Multiple",
    "description": "N/A",
    "elements": [
      "Anemo",
      "Dendro",
      "Hydro",
      "Anemo",
      "Dendro",
      "Hydro"
    ],
    "drops": [
      {
        "name": "Fungal Spores",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Lumines­cent Pollen",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Crystal­line Cyst Dust",
        "rarity": 3,
        "minimum-level": 60
      },
      {
        "name": "Inactivated Fungal Nucleus",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Dormant Fungal Nucleus",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Robust Fungal Nucleus",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "geovishap",
    "name": "Geovishap",
    "type": "Elite Enemies",
    "family": "Mythical Beasts",
    "faction": null,
    "region": "Liyue",
    "description": "A mature Geovishap. It is said that after many years have passed, Geovishap Hatchlings will shed the armor that originally protected them and become Geovishaps. However these two and the older, greater Primo Geovishaps have spent many years hibernating under the mountains and have only emerged and become active in recent times. As such, none can personally attest to have witnessed or recorded such a thing in person.",
    "elements": [
      "Geo"
    ],
    "drops": [
      {
        "name": "Fragile Bone Shard",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Sturdy Bone Shard",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Fossilized Bone Shard",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/geovishap/icon",
    "portrait": "/images/enemies/geovishap/portrait"
  },
  {
    "id": "geovishap-hatchling",
    "name": "Geovishap Hatchling",
    "type": "Elite Enemies",
    "family": "Mythical Beasts",
    "faction": null,
    "region": "Liyue",
    "description": "A young vishap with a hard Geo exoskeleton. Vishaps are exceptionally agile creatures that one would be wise not to underestimate in battle. Experts from Sumeru Arcademia believe that they become dragons when fully grown. By avoiding predators and natural disasters, perhaps they can even live long enough to become formidable beasts that reign over entire mountains.",
    "elements": [
      "Geo"
    ],
    "drops": [
      {
        "name": "Fragile Bone Shard",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Sturdy Bone Shard",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Fossilized Bone Shard",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/geovishap-hatchling/icon",
    "portrait": "/images/enemies/geovishap-hatchling/portrait"
  },
  {
    "id": "grounded-shroom",
    "name": "Grounded Shroom",
    "type": "Common Enemies",
    "family": "Mystical Beasts",
    "faction": null,
    "region": "Multiple",
    "description": "N/A",
    "elements": [
      "Geo",
      "Hydro",
      "Geo",
      "Hydro"
    ],
    "drops": [
      {
        "name": "Fungal Spores",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Lumines­cent Pollen",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Crystal­line Cyst Dust",
        "rarity": 3,
        "minimum-level": 60
      },
      {
        "name": "Inactivated Fungal Nucleus",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Dormant Fungal Nucleus",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Robust Fungal Nucleus",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "hilichurl",
    "name": "Hilichurl",
    "type": "Common Enemies",
    "family": "Hilichurls",
    "faction": "Abyss Order",
    "region": "Global",
    "description": "The primitive wandering inhabitants of Teyvat's wildernesses. They look very similar to humanity but seem to have lost both their intellect and spirituality. Their presence on the continent has been recorded for over a thousand years, and yet they have neither history nor civilization. Since the pitch-black calamity from five hundred years ago, they have begun to spread in large numbers across the land. They are not very strong, and they lack organization, but they nonetheless bring sizable trouble to humans every once in a while.",
    "elements": [
      "Pyro",
      "Cryo",
      "Electro",
      "Dendro"
    ],
    "drops": [
      {
        "name": "Damaged Mask",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Stained Mask",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Ominous Mask",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/hilichurl/icon",
    "portrait": "/images/enemies/hilichurl/portrait"
  },
  {
    "id": "hilichurl-shooter",
    "name": "Hilichurl Shooter",
    "type": "Common Enemies",
    "family": "Hilichurls",
    "faction": "Abyss Order",
    "region": "Global",
    "description": "hilichurl-shooter enemy details.",
    "elements": [
      "Electro",
      "Pyro",
      "Cryo",
      "Physical",
      "Electro",
      "Pyro",
      "Cryo"
    ],
    "drops": [
      {
        "name": "Damaged Mask",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Stained Mask",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Ominous Mask",
        "rarity": 3,
        "minimum-level": 60
      },
      {
        "name": "Firm Arrowhead",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Sharp Arrowhead",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Weathered Arrowhead",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/hilichurl-shooter/icon",
    "portrait": "/images/enemies/hilichurl-shooter/portrait"
  },
  {
    "id": "kairagi",
    "name": "Kairagi",
    "type": "Common Enemies",
    "family": "Other Human Factions",
    "faction": null,
    "region": "Inazuma",
    "description": "N/A",
    "elements": [
      "Electro",
      "Pyro"
    ],
    "drops": [
      {
        "name": "Old Handguard",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Kageuchi Handguard",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Famed Handguard",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "large-slime",
    "name": "Large Slimes",
    "type": "Common Enemies",
    "family": "Slime",
    "faction": null,
    "region": "Global",
    "description": "A pudgy elemental life form. It's said that desserts made from slimes of different elements will have incredibly distinctive flavors.",
    "elements": [
      "Anemo",
      "Geo",
      "Dendro",
      "Hydro",
      "Cyro",
      "Mutant",
      "Pyro",
      "Electro",
      "Anemo",
      "Geo",
      "Dendro",
      "Hydro",
      "Cryo",
      "Electro",
      "Pyro",
      "Mutant"
    ],
    "drops": [
      {
        "name": "Slime Condensate",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Slime Secretions",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Slime Concentrate",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "lawachurl",
    "name": "Lawachurl",
    "type": "Elite Enemies",
    "family": "Hilichurls",
    "faction": "Abyss Order",
    "region": "Multiple",
    "description": "A Mitachurl that has mutated due to an accumulation of a large amount of elements in its body. They are bigger, stronger, and absolutely ferocious. Hilichurls worship no gods and follow no order or discipline. The strongest and the most ferocious one among them is seen as fit to lead the tribe.",
    "elements": [
      "Cryo",
      "Geo"
    ],
    "drops": [
      {
        "name": "Heavy Horn",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Black Bronze Horn",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Black Crystal Horn",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/lawachurl/icon",
    "portrait": "/images/enemies/lawachurl/portrait"
  },
  {
    "id": "mirror-maiden",
    "name": "Mirror Maiden",
    "type": "Elite Enemies",
    "family": "Fatui",
    "faction": "Fatui",
    "region": "Multiple",
    "description": "A member of a special Fatui honor guard from Snezhnaya. Willing to do anything to achieve the grand goals of the Fatui, they are the stark opposite of the dignity indicated by the title \"Maiden\". A Fatui mage who can command a Hydro Mirror in battle. Her posture is highly dignified, as if she is one who worships a god. The Hydro Mirror she manipulates lures those enchanted by her to willingly fall for her illusion. Nothing seems to escape her ears. No one knows what those covered eyes have seen, what kind of obsession might be reflected in them...",
    "elements": [
      "Hydro"
    ],
    "drops": [
      {
        "name": "Dismal Prism",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Crystal Prism",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Polarizing Prism",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "mitachurl",
    "name": "Mitacurl",
    "type": "Elite Enemies",
    "family": "Hilichurls",
    "faction": "Abyss Order",
    "region": "Global",
    "description": "The most formidable warriors of the Hilichurl tribes. Fighting and eating meat are the two most important things to Hilichurls, because those are what make them grow stronger. All young Hilichurls dream of growing up to become a big and strong Mitachurl, because that way they can eat more meat, and fight more battles.",
    "elements": [
      "Pyro"
    ],
    "drops": [
      {
        "name": "Heavy Horn",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Black Bronze Horn",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Black Crystal Horn",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/mitachurl/icon",
    "portrait": "/images/enemies/mitachurl/portrait"
  },
  {
    "id": "nobushi",
    "name": "Nobushi",
    "type": "Common Enemies",
    "family": "Other Human Factions",
    "faction": null,
    "region": "Inazuma",
    "description": "Despite often appearing in groups, the Nobushi do not have a centralized organization. Depending on the temperament or the nature of their crimes, they are also known as the \"homeless ones\", \"vagabonds\", \"Kairagi\", \"ne'er-do-wells\", or even \"the rioters\", or just simply known collectively as \"those rogues\". They are often samurai who haven fallen into banditry, and some will even ally themselves with the Treasure Hoarders or the Fatui for survival or monetary gain.",
    "elements": [
      "Electro",
      "Pyro"
    ],
    "drops": [
      {
        "name": "Old Handguard",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Kageuchi Handguard",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Famed Handguard",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "praetorian-golem",
    "name": "Praetorian Golem",
    "type": "Elite Enemies",
    "family": "Mystical Beasts",
    "faction": null,
    "region": "Fontaine",
    "description": "A moving statue shaped like a warrior who will swing their sword at all who dare trespass upon the area under their guardianship. It is unclear if it is a soul or magic that powers them.\nThey say that legions of golems once conquered the nations that called the high sea home, and this might have been amongst their number. The great towers and palaces that now sleep beneath the waves once bore witness to the fate of those who stand in the path of the wheel of fate.",
    "elements": [
      "Geo",
      "Pyro"
    ],
    "drops": [
      {
        "name": "Ruined Hilt",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Splintered Hilt",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Still-Smoldering Hilt",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "primal-construct",
    "name": "Primal Constructs",
    "type": "Elite Enemies",
    "family": "Automatons",
    "faction": "Primal Constructs",
    "region": "Sumeru",
    "description": "N/A",
    "elements": [
      "Dendro"
    ],
    "drops": [
      {
        "name": "Damaged Prism",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Turbid Prism",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Radiant Prism",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "rifthound",
    "name": "Rifthound",
    "type": "Elite Enemies",
    "family": "The Abyss",
    "faction": "Abyss Order",
    "region": "Global",
    "description": "Ominous, alien beasts with dull colors that travel in packs much as wolves do. It is said that they have the power to dissolve the world's borders.",
    "elements": [
      "Geo",
      "Electro"
    ],
    "drops": [
      {
        "name": "Concealed Claw",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Concealed Unguis",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Concealed Talon",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "ruin-drake",
    "name": "Ruin Drake",
    "type": "Elite Enemies",
    "family": "Automatons",
    "faction": "Ruin Drakes",
    "region": "Sumeru",
    "description": "N/A",
    "elements": [
      "Anemo",
      "Cryo",
      "Dendro",
      "Electro",
      "Geo",
      "Hydro",
      "Pyro"
    ],
    "drops": [
      {
        "name": "Chaos Storage",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Chaos Module",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Chaos Bolt",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "ruin-grader",
    "name": "Ruin Grader",
    "type": "Elite Enemies",
    "family": "Automatons",
    "faction": "Humanoid Ruin Machines",
    "region": "Multiple",
    "description": "A giant war machine resembling a Ruin Guard. They are far more stronger and faster than their brethren.",
    "elements": [
      "Pyro"
    ],
    "drops": [
      {
        "name": "Chaos Device",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Chaos Circuit",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Chaos Core",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/ruin-grader/icon",
    "portrait": "/images/enemies/ruin-grader/portrait"
  },
  {
    "id": "ruin-guard",
    "name": "Ruin Guard",
    "type": "Elite Enemies",
    "family": "Automatons",
    "faction": "Humanoid Ruin Machines",
    "region": "Global",
    "description": "An ancient humanoid war machine. They are said to be remnants from a lost ancient nation. Some believe that they were developed not as war machines, but as protectors of the ruins. Though that hypothesis does not explain why they would choose to employ explosive weaponry inside the very ruins they were designed to protect",
    "elements": [
      "Pyro"
    ],
    "drops": [
      {
        "name": "Chaos Device",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Chaos Circuit",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Chaos Core",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/ruin-guard/icon",
    "portrait": "/images/enemies/ruin-guard/portrait"
  },
  {
    "id": "ruin-hunter",
    "name": "Ruin Guard",
    "type": "Elite Enemies",
    "family": "Automatons",
    "faction": "Humanoid Ruin Machines",
    "region": "Global",
    "description": "Humanoid war machines armed with sharp appendages. They can also fire barrages of missiles.",
    "elements": [
      "Pyro"
    ],
    "drops": [
      {
        "name": "Chaos Device",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Chaos Circuit",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Chaos Core",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/ruin-hunter/icon",
    "portrait": "/images/enemies/ruin-hunter/portrait"
  },
  {
    "id": "ruin-sentinel",
    "name": "Ruin Sentinel",
    "type": "Elite Enemies",
    "family": "Automatons",
    "faction": "Ruin Machines",
    "region": "Global",
    "description": "N/A",
    "elements": [
      "N/A"
    ],
    "drops": [
      {
        "name": "Chaos Gear",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Chaos Axis",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Chaos Oculus",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "samachurl",
    "name": "Samachurl",
    "type": "Common Enemies",
    "family": "Hilichurls",
    "faction": "Abyss Order",
    "region": "Global",
    "description": "samachurl enemy details.",
    "elements": [
      "Anemo",
      "Geo",
      "Dendro",
      "Hydro",
      "Cydro",
      "Anemo",
      "Geo",
      "Dendro",
      "Hydro",
      "Cryo"
    ],
    "drops": [
      {
        "name": "Damaged Mask",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Stained Mask",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Ominous Mask",
        "rarity": 3,
        "minimum-level": 60
      },
      {
        "name": "Divining Scroll",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Sealed Scroll",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Forbidden Curse Scroll",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/samachurl/icon",
    "portrait": "/images/enemies/samachurl/portrait"
  },
  {
    "id": "slime",
    "name": "Slime",
    "type": "Common Enemies",
    "family": "Slime",
    "faction": null,
    "region": "Global",
    "description": "A pudgy elemental life form. It's said that desserts made from slimes of different elements will have incredibly distinctive flavors.",
    "elements": [
      "Anemo",
      "Geo",
      "Dendro",
      "Hydro",
      "Cydro",
      "Anemo",
      "Geo",
      "Dendro",
      "Hydro",
      "Cryo",
      "Electro",
      "Pyro"
    ],
    "drops": [
      {
        "name": "Slime Condensate",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Slime Secretions",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Slime Concentrate",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/slime/icon",
    "portrait": "/images/enemies/slime/portrait"
  },
  {
    "id": "specter",
    "name": "Specters",
    "type": "Common Enemies",
    "family": "Elemental Lifeforms",
    "faction": null,
    "region": "Inazuma",
    "description": "A pudgy elemental life form. It's said that desserts made from slimes of different elements will have incredibly distinctive flavors.",
    "elements": [
      "Anemo",
      "Geo",
      "Dendro",
      "Hydro",
      "Cyro",
      "Pyro",
      "Electro",
      "Anemo",
      "Geo",
      "Dendro",
      "Hydro",
      "Cryo",
      "Electro",
      "Pyro"
    ],
    "drops": [
      {
        "name": "Spectral Husk",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Spectral Heart",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Spectral Nucleus",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "stretchy-fungus",
    "name": "Stretchy Fungus",
    "type": "Common Enemies",
    "family": "Mystical Beasts",
    "faction": null,
    "region": "Multiple",
    "description": "N/A",
    "elements": [
      "Anemo",
      "Electro",
      "Geo",
      "Pyro",
      "Anemo",
      "Electro",
      "Geo",
      "Pyro"
    ],
    "drops": [
      {
        "name": "Fungal Spores",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Lumines­cent Pollen",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Crystal­line Cyst Dust",
        "rarity": 3,
        "minimum-level": 60
      },
      {
        "name": "Inactivated Fungal Nucleus",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Dormant Fungal Nucleus",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Robust Fungal Nucleus",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "the-black-serpent",
    "name": "The Black Serpent",
    "type": "Elite Enemies",
    "family": "The Abyss",
    "faction": "Abyss Order",
    "region": "Global",
    "description": "Once upon a time, these were knights of the realm and carriers of significant status. The long years and a curse seems to have robbed them of their reason and memory. Now, all that remains within that armor is the will to \"fight for something, someone, and some matter.\" Depending on how much wear and tear they have undergone, they are by turns known as \"Shadowy Husks\" or \"Black Serpent Knights.\"",
    "elements": [
      "Cryo",
      "Hydro",
      "Pyro",
      "Anemo",
      "Geo"
    ],
    "drops": [
      {
        "name": "Gloomy Statuette",
        "rarity": 2,
        "minimum-level": 1
      },
      {
        "name": "Dark Statuette",
        "rarity": 3,
        "minimum-level": 40
      },
      {
        "name": "Deathly Statuette",
        "rarity": 4,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "the-eremite",
    "name": "The Eremite",
    "type": "Common Enemies",
    "family": "Other Human Factions",
    "faction": null,
    "region": "Sumeru",
    "description": "N/A",
    "elements": [
      "Electro",
      "Pyro",
      "Cryo",
      "Hydro",
      "Geo",
      "Anemo",
      "Dendro"
    ],
    "drops": [
      {
        "name": "Faded Red Satin",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Trimmed Red Silk",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Rich Red Brocade",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "the-great-snowboar-king",
    "name": "The Great Snowboar King",
    "type": "Elite Enemies",
    "family": "Unique Enemies",
    "faction": null,
    "region": "Dragonspine",
    "description": "N/A",
    "elements": [],
    "drops": [
      {
        "name": "Chilled Meat",
        "rarity": 1,
        "minimum-level": 1
      }
    ],
    "image": "/images/enemies/the-great-snowboar-king/icon",
    "portrait": null
  },
  {
    "id": "treasure-hoarder",
    "name": "Treasure Hoarder",
    "type": "Common Enemies",
    "family": "Treasure Hoarders",
    "faction": null,
    "region": "Global",
    "description": "treasure-hoarder enemy details.",
    "elements": [
      "Cryo",
      "Electro",
      "Hydro",
      "Pyro"
    ],
    "drops": [
      {
        "name": "Treasure Hoarder Insignia",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Silver Raven Insignia",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Golden Raven Insignia",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/treasure-hoarder/icon",
    "portrait": "/images/enemies/treasure-hoarder/portrait"
  },
  {
    "id": "whirling-fungus",
    "name": "Whirling Fungus",
    "type": "Common Enemies",
    "family": "Mystical Beasts",
    "faction": null,
    "region": "Multiple",
    "description": "N/A",
    "elements": [
      "Cryo",
      "Electro",
      "Pyro",
      "Cryo",
      "Electro",
      "Pyro"
    ],
    "drops": [
      {
        "name": "Fungal Spores",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Lumines­cent Pollen",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Crystal­line Cyst Dust",
        "rarity": 3,
        "minimum-level": 60
      },
      {
        "name": "Inactivated Fungal Nucleus",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Dormant Fungal Nucleus",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Robust Fungal Nucleus",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "whopperflower",
    "name": "Whopperflower",
    "type": "Common Enemies",
    "family": "Mystical Beasts",
    "faction": null,
    "region": "Global",
    "description": "A bizarre mimetic plant monster that harnesses the elements in combat. These plants lurk under the surface and ambush unsuspecting prey. With the passage of years, sufficient nutrition, and the right environment, it could even take root somewhere and grow into a giant tree that sways and spews elemental power...",
    "elements": [
      "Cryo",
      "Pyro",
      "anemo",
      "geo",
      "dendro",
      "hydro",
      "cryo"
    ],
    "drops": [
      {
        "name": "Whopperflower Nectar",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Shimmering Nectar",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Energy Nectar",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": "/images/enemies/whopperflower/icon",
    "portrait": "/images/enemies/whopperflower/portrait"
  },
  {
    "id": "winged-shroom",
    "name": "Winged Shroom",
    "type": "Common Enemies",
    "family": "Mystical Beasts",
    "faction": null,
    "region": "Multiple",
    "description": "N/A",
    "elements": [
      "Cryo",
      "Dendro",
      "Cryo",
      "Dendro"
    ],
    "drops": [
      {
        "name": "Fungal Spores",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Lumines­cent Pollen",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Crystal­line Cyst Dust",
        "rarity": 3,
        "minimum-level": 60
      },
      {
        "name": "Inactivated Fungal Nucleus",
        "rarity": 1,
        "minimum-level": 1
      },
      {
        "name": "Dormant Fungal Nucleus",
        "rarity": 2,
        "minimum-level": 40
      },
      {
        "name": "Robust Fungal Nucleus",
        "rarity": 3,
        "minimum-level": 60
      }
    ],
    "image": null,
    "portrait": null
  },
  {
    "id": "all-devouring-narwhal",
    "name": "All-Devouring Narwhal",
    "type": "Weekly Boss",
    "family": "Enemies of Note",
    "faction": null,
    "region": "Trounce Domain",
    "description": "A mysterious and gargantuan creature from another world.\nPoets often liken the starry sky to the ocean. They've seen or dreamt of countless bioluminescent plankton floating on a moonless sea, resembling a galaxy, or the moonlight ripped apart by waves on the sea's surface, like shimmering stars. In the most fantastical stories or outrageous lies, the stars found in the depths of the cosmos might be teeming with life, much like Teyvat, and the universe itself is akin to an ocean. Realistically speaking, however, if a profound universe full of life exists, why hasn't any of that life made contact with Teyvat?\nMaybe the universe has been constantly trying to infiltrate Teyvat, or maybe a higher power created borders to protect this world.",
    "elements": [],
    "drops": [
      {
        "name": "Lightless Silk String",
        "rarity": 5,
        "source": "Lv. 70+ All-Devouring Narwhal Challenge Reward"
      },
      {
        "name": "Lightless Eye of the Maelstrom",
        "rarity": 5,
        "source": "Lv. 70+ All-Devouring Narwhal Challenge Reward"
      },
      {
        "name": "Lightless Mass",
        "rarity": 5,
        "source": "Lv. 70+ All-Devouring Narwhal Challenge Reward"
      }
    ],
    "image": "/images/boss/weekly-boss/all-devouring-narwhal/icon",
    "portrait": "/images/boss/weekly-boss/all-devouring-narwhal/portrait"
  },
  {
    "id": "azhdaha",
    "name": "Azhdaha",
    "type": "Weekly Boss",
    "family": "Enemies of Note",
    "faction": null,
    "region": "Trounce Domain",
    "description": "An enormous dragon as ancient as the mountains themselves. In an age that has all but faded from memory, he stood shoulder to shoulder with one who ruled over a harbor of stone. But in the end, the two came into conflict, and the dragon was banished to a dark place deep underground.\nOver the long years of his imprisonment, his power has slowly dissipated. He has also become disfigured from the various kinds of erosion he has been subjected to.\nThe faint rattling of this dragon lord's shackles and his deep, angry growl echo through the bowels of the mountains like memories of a bygone era.",
    "elements": [],
    "drops": [
      {
        "name": "Dragon Lord's Crown",
        "rarity": 5,
        "source": "Lv. 70+ Azhdaha Challenge Reward"
      },
      {
        "name": "Bloodjade Branch",
        "rarity": 5,
        "source": "Lv. 70+ Azhdaha Challenge Reward"
      },
      {
        "name": "Gilded Scale",
        "rarity": 5,
        "source": "Lv. 70+ Azhdaha Challenge Reward"
      }
    ],
    "image": "/images/boss/weekly-boss/azhdaha/icon",
    "portrait": "/images/boss/weekly-boss/azhdaha/portrait"
  },
  {
    "id": "childe",
    "name": "Childe",
    "type": "Weekly Boss",
    "family": "Enemies of Note",
    "faction": null,
    "region": "Trounce Domain",
    "description": "\"Childe\" Tartaglia, Eleventh of the Fatui Harbingers. He draws power from the ominous Delusion he possesses and fights using martial arts that he learned in the land of darkness.\n\nHe is a pure warrior with an insatiable lust for battle. Each bloody conflict, each life-and-death struggle is a delightful trial for him. People say that the young Childe is famed throughout the land for his battle prowess. But he has never taken big talk of this kind to heart.\n\nAfter all...\n\"You shall ever be the eye of the storm,\"\n\"And the clashing of steel shall ever accompany you.\"\n\"The pitch-black memory of stepping into uttermost darkness,\"\n\"Shall, at last, become the strength by which you will overturn this world.\"",
    "elements": [],
    "drops": [
      {
        "name": "Tusk of Monoceros Caeli",
        "rarity": 5,
        "source": "Lv. 70+ Childe Challenge Reward"
      },
      {
        "name": "Shard of a Foul Legacy",
        "rarity": 5,
        "source": "Lv. 70+ Childe Challenge Reward"
      },
      {
        "name": "Shadow of the Warrior",
        "rarity": 5,
        "source": "Lv. 70+ Childe Challenge Reward"
      }
    ],
    "image": "/images/boss/weekly-boss/childe/icon",
    "portrait": "/images/boss/weekly-boss/childe/portrait"
  },
  {
    "id": "everlasting-lord-of-arcane-wisdom",
    "name": "Everlasting Lord of Arcane Wisdom",
    "type": "Weekly Boss",
    "family": "Enemies of Note",
    "faction": null,
    "region": "Trounce Domain",
    "description": "Shouki no Kami, as an artificial divinity created using all the might of Sumeru's Six Darshans, has power that rivals that of true gods.\nBut those of this world who call such a being a \"false deity\" misunderstand the true meaning of the word.\nShouki no Kami now understands countless things and shoulders unassailable might, and may be said to surpass mortals.\nIf gods must love mortals,\nThen Shouki no Kami, who grants failure in equal measure to humanity, loves them also.\nIf gods must watch over humanity,\nThen Shouki no Kami, who has borne witness to infinite love, hatred, partings, grudges, and maddening anger — thus does he watch over mortals.\n\"Too much happiness you have had!\"\n\"It has made you foolish. Arrogant. Horrifying in your greed.\"\n\"Let this era end!\"\n\"Let the new god announce the defeat of the old.\"\n\"Foolish mortal... There is yet time for you to kneel.\"",
    "elements": [],
    "drops": [
      {
        "name": "Puppet Strings",
        "rarity": 5,
        "source": "Lv. 70+ Shouki no Kami, the Prodigal Challenge Reward"
      },
      {
        "name": "Mirror of Mushin",
        "rarity": 5,
        "source": "Lv. 70+ Shouki no Kami, the Prodigal Challenge Reward"
      },
      {
        "name": "Daka's Bell",
        "rarity": 5,
        "source": "Lv. 70+ Shouki no Kami, the Prodigal Challenge Reward"
      }
    ],
    "image": "/images/boss/weekly-boss/everlasting-lord-of-arcane-wisdom/icon",
    "portrait": "/images/boss/weekly-boss/everlasting-lord-of-arcane-wisdom/portrait"
  },
  {
    "id": "guardian-of-apep-s-oasis",
    "name": "Guardian of Apep's Oasis",
    "type": "Weekly Boss",
    "family": "Enemies of Note",
    "faction": null,
    "region": "Trounce Domain",
    "description": "Apep walked through the water like a fish with its many offspring in a sea of fragrant grass, gigantic trees, and unimaginably long vines. Finally, the grass, trees, and vines withered and turned into dust, while countless beings as minute as grains of gravel built a fragile kingdom upon Apep's land.\nApep and its offspring let the sea of sand rage like boiling water and swept houses down as if they were falling leaves. Until the day when the new Lord of Sand reconciled with the king who lost their homeland, the dunes under the sun belonged to humanity, while the dragon's oasis remained in the hearts of the dragons.\nApep shared the knowledge of evolution with its many offspring, because spreading knowledge ensures dissemination while the stagnation of hoarded wisdom courted only decay. Till the day the promise between it and the Lord of Sand was finally attained, with ultimate wisdom claimed. Henceforth, it reaped only sights of oblivion, of an endless calamity.\nApep found itself swallowed alone amidst the scenery of the catastrophe. All the people, gods, dragons, beasts, birds, and fish. All memories, wisdom, words, and hatred were ground into colorless dust, and the last of the moonlight burned away into a rain of pale fire, falling on the barren land.\nApep once deemed the bottom of the sea of sand to be its grave, not the palace of a dispossessed king. The poison of \"wisdom\" would soon free Apep from the hatred and anger festering within it over countless moons. Apep had grown weary of the colorless apocalypse. Then, finally, the young god and the golden Traveler let it recall once again, even though the verdant land it once ruled had been reduced to this gilded wasteland, even though Apep and its many offspring had grown twisted and wretched to secure their continued survival therein, Apep still treasured the sight and scenes of the oasis, sparkling in its heart.",
    "elements": [],
    "drops": [
      {
        "name": "Worldspan Fern",
        "rarity": 5,
        "source": "Lv. 70+ Guardian of Apep's Oasis Challenge Reward"
      },
      {
        "name": "Primordial Greenbloom",
        "rarity": 5,
        "source": "Lv. 70+ Guardian of Apep's Oasis Challenge Reward"
      },
      {
        "name": "Everamber",
        "rarity": 5,
        "source": "Lv. 70+ Guardian of Apep's Oasis Challenge Reward"
      }
    ],
    "image": "/images/boss/weekly-boss/guardian-of-apep-s-oasis/icon",
    "portrait": "/images/boss/weekly-boss/guardian-of-apep-s-oasis/portrait"
  },
  {
    "id": "la-signora",
    "name": "La Signora",
    "type": "Weekly Boss",
    "family": "Enemies of Note",
    "faction": null,
    "region": "Trounce Domain",
    "description": "Signora, the Eighth of the Fatui Harbingers.\nUnlike other Fatui who use the authority granted by Delusions, her Delusion is meant to shackle a flame that will devour everything. As opposed to a weapon used to kill, it might be more fitting to consider this a tool of imprisonment.\nAnd it was the embers of that flame, which had accumulated over many long years, that would break through the frosty seal of the Delusion and apply a warped rouge upon her.\n\nThe crimson dawn was reflected in her pupils, and at last, she unfolded her flaming wings and flew towards the light.\n\"But that light is not the dawn, dear Rosalyne. That is a sea of flame that will consume everything.\"\nA voice spoke to her amidst the light.\n\nYet it mattered not, for she knew in her heart that the flames had devoured her long ago.",
    "elements": [],
    "drops": [
      {
        "name": "Molten Moment",
        "rarity": 5,
        "source": "Lv. 70+ Signora Challenge Reward"
      },
      {
        "name": "Hellfire Butterfly",
        "rarity": 5,
        "source": "Lv. 70+ Signora Challenge Reward"
      },
      {
        "name": "Hellfire Butterfly",
        "rarity": 5,
        "source": "Lv. 70+ Signora Challenge Reward"
      }
    ],
    "image": "/images/boss/weekly-boss/la-signora/icon",
    "portrait": "/images/boss/weekly-boss/la-signora/portrait"
  },
  {
    "id": "lupus-boreas",
    "name": "Lupus Boreas",
    "type": "Weekly Boss",
    "family": "Enemies of Note",
    "faction": null,
    "region": "Trounce Domain",
    "description": "The noblest and greatest of souls, who watches over the lupical of Wolvendom.\nWhen the wolfpack is imperiled, it will emerge in the form of a wolf and show forth its fangs and claws.\n\nThe wolves of Wolvendom are frightening phantoms to the people of Mondstadt:\nA blurred shape flashing through the forest, a chilling howl in the indeterminate distance, the creeping sense of eyes constantly nailed on their backs...\nHumans rarely have the oppotunity to lock their eyes with a wolf, for this is the law Lupus Boreas laid down for its race.",
    "elements": [],
    "drops": [
      {
        "name": "Tail of Boreas",
        "rarity": 5,
        "source": "Lv. 70+ Wolf of the North Challenge Reward"
      },
      {
        "name": "Ring of Boreas",
        "rarity": 5,
        "source": "Lv. 70+ Wolf of the North Challenge Reward"
      },
      {
        "name": "Spirit Locket of Boreas",
        "rarity": 5,
        "source": "Lv. 70+ Wolf of the North Challenge Reward"
      }
    ],
    "image": "/images/boss/weekly-boss/lupus-boreas/icon",
    "portrait": "/images/boss/weekly-boss/lupus-boreas/portrait"
  },
  {
    "id": "magatsu-mitake-narukami-no-mikoto",
    "name": "Magatsu Mitake Narukami No Mikoto",
    "type": "Weekly Boss",
    "family": "Enemies of Note",
    "faction": null,
    "region": "Trounce Domain",
    "description": "This is the form that the puppet that inherited the Raiden Shogun's authority takes when she is opposing those who threaten Eternity\nAs the Raiden Shogun's assistant in pursuing Eternity.\nshe has never doubted, never felt fear, never given anything less than her best,never been disturbed by idle thoughts.\nShe once heard about-how Ei had shouldered a similar duty when Makoto was also present, suffering much agonizing loss in the-process.When the two shadows overlapped once more, however, she could only see the countless fine fractures in what should have been \"her\" eternal will. Since fate is destined for cyclicality, she must fulfill her promise and declare war on \"her\".\nMine is the most supreme and noble form. Power over the realm has been vested within me, and I am the essence of all that is the \n \"Raiden Shogun.\"\n \"Naturally, I have also inherited the pain of Ei's countless losses and her will to attain Eternity.\" \n \"Resolve, valor, love, hate... They will all twist in the river of time, \n \"But the 'rules' will never change.\".",
    "elements": [],
    "drops": [
      {
        "name": "Mudra of the Malefic General",
        "rarity": 5,
        "source": "Lv. 70+ Guardian of Eternity Challenge Reward"
      },
      {
        "name": "Tears of the Calamitous God",
        "rarity": 5,
        "source": "Lv. 70+ Guardian of Eternity Challenge Reward"
      },
      {
        "name": "The Meaning of Aeons",
        "rarity": 5,
        "source": "Lv. 70+ Guardian of Eternity Challenge Reward"
      }
    ],
    "image": "/images/boss/weekly-boss/magatsu-mitake-narukami-no-mikoto/icon",
    "portrait": "/images/boss/weekly-boss/magatsu-mitake-narukami-no-mikoto/portrait"
  },
  {
    "id": "stormterror",
    "name": "Stormterror",
    "type": "Weekly Boss",
    "family": "Enemies of Note",
    "faction": null,
    "region": "Trounce Domain",
    "description": "One of The Four Winds of Mondstadt: Dvalin, the Dragon of the East.\nWith the passages of long years and amid boudless darkness, even the purest gem will become dulled by dust, and even the noble dragon might be corrupted and cankered by hatred.\nBut never forget that dust can be wiped away, and the power of doubt and poison can be shattered.\n\n\"Fly freely in the sky.\n\"Just like you did in those days when we met, when I walked upon this land and sang the songs of the wind,\n\"And you soared on high, looking down on the world from above.\n\"Today, the sky is no longer swept by wind and snow. The green grass grows all over the earth, and it is beautiful.\n\"If you could walk on the earth and listen to the songs of shepherds and the scattered sound of the wind chimes in the distance, if you could have tasted wine as sweet as honey, you could understand.\n\"How wonderful it would have been if you were as I, witnessing your noble, beautiful form as you soared through the blue sky.\n\"Then you would know that this sky and this earth are both things worth fighting for.\"",
    "elements": [],
    "drops": [
      {
        "name": "Dvalin's Plume",
        "rarity": 5,
        "source": "Lv. 70+ Stormterror Challenge Reward"
      },
      {
        "name": "Dvalin's Claw",
        "rarity": 5,
        "source": "Lv. 70+ Stormterror Challenge Reward"
      },
      {
        "name": "Spirit Locket of Boreas",
        "rarity": 5,
        "source": "Lv. 70+ Stormterror Challenge Reward"
      }
    ],
    "image": "/images/boss/weekly-boss/stormterror/icon",
    "portrait": "/images/boss/weekly-boss/stormterror/portrait"
  },
  {
    "id": "the-knave",
    "name": "The Knave",
    "type": "Weekly Boss",
    "family": "Enemies of Note",
    "faction": null,
    "region": "Trounce Domain",
    "description": "This courtyard was once a wonder to behold, but now lies desolate.\nThe previous battle has been buried like the dying light, but the next duel shall come, as long as the \"Family\" endures...",
    "elements": [],
    "drops": [
      {
        "name": "Fading Candle",
        "rarity": 5,
        "source": "Lv. 70+ The Knave Challenge Reward"
      },
      {
        "name": "Silken Feather",
        "rarity": 5,
        "source": "Lv. 70+ The Knave Challenge Reward"
      },
      {
        "name": "Denial and Judgment",
        "rarity": 5,
        "source": "Lv. 70+ The Knave Challenge Reward"
      }
    ],
    "image": "/images/boss/weekly-boss/the-knave/icon",
    "portrait": "/images/boss/weekly-boss/the-knave/portrait"
  }
] satisfies LocalEnemyEntry[];
