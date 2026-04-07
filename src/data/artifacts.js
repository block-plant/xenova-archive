// src/data/artifacts.js

// This is our "database" of all Xenova artifacts
// Each artifact is an object with properties that describe it
// The page will loop through this array and create a card for each one

export const artifacts = [
  {
    id: 1,
    name: "The Seed Lattice",
    type: "BIOLOGICAL TOOL",
    rarity: "APEX",
    era: "THE RISE",
    eraColor: "#00FFD1",        // teal for Rise era
    status: "FAINTLY ALIVE",
    codexId: "XNV-001",
    description:
      "A crystalline biological structure used to encode entire ecosystems into a single seed. When activated, it unfurls a complete biosphere — atmosphere, flora, microbial layers — in under 72 hours. Still faintly warm to the touch.",
    details:
      "Recovered from Kethara-VII ruins, Sector 4. Partial activation detected upon recovery. Research team advised not to touch.",
    glowColor: "#00FFD1",
  },
  {
    id: 2,
    name: "Codex Fragment Omega",
    type: "DATA RELIC",
    rarity: "SINGULAR",
    era: "THE PEAK",
    eraColor: "#FFB347",        // amber for Peak era
    status: "ENCRYPTED",
    codexId: "XNV-002",
    description:
      "A shard of The Grand Codex — the Xenova's masterwork record of every species they ever engineered. This fragment alone contains blueprints for 14,000 organisms. The rest of the Codex has never been recovered.",
    details:
      "Vex'al inscription on surface reads: 'What we built, we cannot uncreate.' Translation confirmed by Archive AI.",
    glowColor: "#FFB347",
  },
  {
    id: 3,
    name: "Strain Omega Core",
    type: "BIOLOGICAL WEAPON",
    rarity: "CLASSIFIED",
    era: "THE UNRAVELING",
    eraColor: "#FF3A3A",        // red for Unraveling era
    status: "CONTAINED",
    codexId: "XNV-003",
    description:
      "A dormant biological processor extracted from the first Strain Omega specimen. Still capable of emitting low-frequency Cascade signals. Kept in triple-sealed containment. Do not approach without clearance.",
    details:
      "WARNING: Proximity exceeding 2 minutes without shielding causes measurable cellular degradation. Archive staff: stay back.",
    glowColor: "#FF3A3A",
  },
  {
    id: 4,
    name: "Vex'al Light Prism",
    type: "COMMUNICATION DEVICE",
    rarity: "RARE",
    era: "THE PEAK",
    eraColor: "#FFB347",
    status: "PARTIALLY ACTIVE",
    codexId: "XNV-004",
    description:
      "The Xenova did not speak — they communicated through encoded light patterns read by their engineered eyes. This prism is a translation device, converting Vex'al light-language into patterns visible to non-Xenova observers.",
    details:
      "When powered, emits a rotating sequence of 847 light patterns. Linguists have decoded approximately 12% of the sequence.",
    glowColor: "#39FF14",
  },
  {
    id: 5,
    name: "Bio-Synthetic Heart",
    type: "ARCHITECTURAL ORGAN",
    rarity: "APEX",
    era: "THE PEAK",
    eraColor: "#FFB347",
    status: "STILL BEATING",
    codexId: "XNV-005",
    description:
      "Xenova cities were alive. This artifact is the central organ of a mid-sized bio-synthetic structure — a city's beating heart. Removed from the ruins of Kethara Prime. It still pulses at 3 beats per minute.",
    details:
      "Biological analysis shows no external energy source. The heart sustains itself. Scientists have no explanation.",
    glowColor: "#00FFD1",
  },
  {
    id: 6,
    name: "Cascade Emitter",
    type: "EXTINCTION DEVICE",
    rarity: "CLASSIFIED",
    era: "THE UNRAVELING",
    eraColor: "#FF3A3A",
    status: "DISABLED",
    codexId: "XNV-006",
    description:
      "The device Strain Omega used to broadcast The Cascade signal across the Kethara Expanse. A biological radio tower that transmitted DNA-unraveling frequencies across 14 star systems simultaneously. Planet by planet. System by system.",
    details:
      "Disabling required destroying the organic broadcast nodes. Three Archive personnel were lost in the recovery mission.",
    glowColor: "#FF3A3A",
  },
  {
    id: 7,
    name: "Genesis Engine",
    type: "CREATION DEVICE",
    rarity: "APEX",
    era: "THE RISE",
    eraColor: "#00FFD1",
    status: "DORMANT",
    codexId: "XNV-007",
    description:
      "The earliest known Xenova creation tool — a portable biological forge used to design and birth new organisms in the field. 40,000 years old. Still structurally intact. The organism templates inside have never been identified.",
    details:
      "Internal scan shows 3 unidentified organism templates in ready state. Archive leadership has voted not to activate.",
    glowColor: "#39FF14",
  },
  {
    id: 8,
    name: "The Last Breath",
    type: "MEMORIAL ARTIFACT",
    rarity: "UNIQUE",
    era: "THE UNRAVELING",
    eraColor: "#FF3A3A",
    status: "INERT",
    codexId: "XNV-008",
    description:
      "A sealed biological capsule found at the exact coordinates where the last known Xenova life sign was recorded. Contains a preserved atmosphere — the last air ever breathed by a Xenova. The capsule has never been opened.",
    details:
      "Recovered 40,000 AX. Vex'al inscription on the exterior reads a single word: 'Deserved.'",
    glowColor: "#7AAFC4",
  },
];