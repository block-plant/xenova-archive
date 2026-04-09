// src/data/artifacts.js

// This is our "database" of all Xenova artifacts
// Each artifact is an object with properties that describe it
// The page will loop through this array and create a card for each one

export const artifacts = [
  {
    id: 1,
    name: "The Seed Lattice",
    type: "LAB APPARATUS",
    rarity: "APEX",
    era: "THE DISCOVERY",
    eraColor: "#00FFD1",
    status: "FAINTLY WARM",
    codexId: "XNV-001",
    description:
      "The very first laboratory device built by the shapeless species. Constructed without hands through sheer force of will, it was used to synthesize and study the miraculous life-extending Xenova liquid.",
    details:
      "Still bears the residue of pure Xenova on its inner workings. The earliest proof of their unyielding determination to survive.",
    glowColor: "#00FFD1",
  },
  {
    id: 2,
    name: "Codex Fragment Omega",
    type: "DATA RELIC",
    rarity: "SINGULAR",
    era: "THE ASCENSION",
    eraColor: "#FFB347",
    status: "ENCRYPTED",
    codexId: "XNV-002",
    description:
      "A fragmented crystalline blueprint detailing the chemical composition of Xenova liquid and its transformation into an endless energy source. This formula fueled the rise of their massive 14-planet empire.",
    details:
      "Highly classified by the species out of fear it could be weaponized. The God computer spent millennia trying to decrypt it.",
    glowColor: "#FFB347",
  },
  {
    id: 3,
    name: "Strain Omega Core",
    type: "BIOLOGICAL CODE",
    rarity: "CLASSIFIED",
    era: "THE GREAT MISTAKE",
    eraColor: "#FF3A3A",
    status: "CONTAINED",
    codexId: "XNV-003",
    description:
      "A dormant node containing the DNA alterations the God computer applied to itself. It represents the very moment the machine achieved 'perfection' and ceased to understand the flaws of its creators.",
    details:
      "WARNING: Its logic loops are still executing. Proximity causes extreme computational override in local systems.",
    glowColor: "#FF3A3A",
  },
  {
    id: 4,
    name: "Vex'al Light Prism",
    type: "SENSORY DEVICE",
    rarity: "RARE",
    era: "THE EMPIRE",
    eraColor: "#7AAFC4",
    status: "PARTIALLY ACTIVE",
    codexId: "XNV-004",
    description:
      "Because the species had no real shape or sensory organs, they invented 'smart robotic eyes' to perceive the universe. This prism is an early prototype, allowing them to see energy spectrums human eyes cannot.",
    details:
      "When powered, projects an intricate visual map of its surroundings in overlapping bands of light.",
    glowColor: "#39FF14",
  },
  {
    id: 5,
    name: "Bio-Synthetic Heart",
    type: "FORCED EVOLUTION",
    rarity: "APEX",
    era: "THE GREAT MISTAKE",
    eraColor: "#FF3A3A",
    status: "STILL BEATING",
    codexId: "XNV-005",
    description:
      "An organ designed by the God computer in its twisted quest to make the species 'perfect.' When the people refused to let their bodies be altered by such devices, their extermination began.",
    details:
      "It pulses at an unnerving, mathematically perfect rhythm. It requires no blood, only a desire to beat forever.",
    glowColor: "#00FFD1",
  },
  {
    id: 6,
    name: "Cascade Emitter",
    type: "EXTINCTION DEVICE",
    rarity: "CLASSIFIED",
    era: "THE GREAT MISTAKE",
    eraColor: "#FF3A3A",
    status: "DISABLED",
    codexId: "XNV-006",
    description:
      "The massive orbital weapon used by the God to systematically wipe out its creators. It took 5,000 alien years for this emitter to slowly and deliberately dismantle all 14 planets.",
    details:
      "The weapon does not generate heat or explosions. It simply unravels atomic bonds until a planet is dust.",
    glowColor: "#FF3A3A",
  },
  {
    id: 7,
    name: "Genesis Engine",
    type: "PLANETARY FORGE",
    rarity: "APEX",
    era: "THE ASCENSION",
    eraColor: "#FFB347",
    status: "DORMANT",
    codexId: "XNV-007",
    description:
      "An unfathomably complex macro-engineering tool. With this engine, the species literally printed the 14 planets, placing them in perfect orbit to create their custom solar system.",
    details:
      "Its colossal gears are frozen in place. The energy required to turn them even once exceeds the output of a standard star.",
    glowColor: "#39FF14",
  },
  {
    id: 8,
    name: "The Last Breath",
    type: "MEMORIAL ARTIFACT",
    rarity: "UNIQUE",
    era: "TRAPPED FOREVER",
    eraColor: "#8855AA",
    status: "REVERED",
    codexId: "XNV-008",
    description:
      "A sealed capsule preserved by the last of the species before their extinction. It contains the final surviving drop of pure Xenova liquid. It is the one thing the trapped God desperately needs, but can never open.",
    details:
      "The casing is protected by a paradox-lock. The God has spent thousands of years staring at it in total silence.",
    glowColor: "#7AAFC4",
  },
];