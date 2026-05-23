export const INCANGOLD_TREASURES = [
  { id: "T_1", value: 1 },
  { id: "T_2", value: 2 },
  { id: "T_3", value: 3 },
  { id: "T_4", value: 4 },
  { id: "T_5_A", value: 5 },
  { id: "T_5_B", value: 5 },
  { id: "T_7_A", value: 7 },
  { id: "T_7_B", value: 7 },
  { id: "T_9", value: 9 },
  { id: "T_11_A", value: 11 },
  { id: "T_11_B", value: 11 },
  { id: "T_13", value: 13 },
  { id: "T_14", value: 14 },
  { id: "T_15", value: 15 },
  { id: "T_17", value: 17 },
];

export const INCANGOLD_HAZARDS = [
  { id: "H_Serpent_1", type: "Serpent" },
  { id: "H_Serpent_2", type: "Serpent" },
  { id: "H_Serpent_3", type: "Serpent" },
  { id: "H_Scorpion_1", type: "Scorpion" },
  { id: "H_Scorpion_2", type: "Scorpion" },
  { id: "H_Scorpion_3", type: "Scorpion" },
  { id: "H_Rockfall_1", type: "Rockfall" },
  { id: "H_Rockfall_2", type: "Rockfall" },
  { id: "H_Rockfall_3", type: "Rockfall" },
  { id: "H_Gas_1", type: "Gas" },
  { id: "H_Gas_2", type: "Gas" },
  { id: "H_Gas_3", type: "Gas" },
  { id: "H_Explosion_1", type: "Explosion" },
  { id: "H_Explosion_2", type: "Explosion" },
  { id: "H_Explosion_3", type: "Explosion" },
];

export const INCANGOLD_ARTIFACTS = [
  { id: "A_1", name: "Artifact 1" },
  { id: "A_2", name: "Artifact 2" },
  { id: "A_3", name: "Artifact 3" },
  { id: "A_4", name: "Artifact 4" },
  { id: "A_5", name: "Artifact 5" },
];

export function getIncanGoldDeck(retiredCards: string[] = [], roundArtifacts: string[] = []) {
  const deck: string[] = [];
  
  // Add Treasures
  INCANGOLD_TREASURES.forEach(t => deck.push(t.id));
  
  // Add Hazards, remove retired IDs
  INCANGOLD_HAZARDS.forEach(h => {
    if (!retiredCards.includes(h.id)) {
        deck.push(h.id);
    }
  });

  // Add Artifacts for current and previous rounds if not collected
  roundArtifacts.forEach(aId => {
      deck.push(aId);
  });
  
  return deck;
}
