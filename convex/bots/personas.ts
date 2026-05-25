import { Doc } from "../_generated/dataModel";

export type BotMove = {
  actionType: string;
  indices: number[];
  cards: string[];
  targetPlayerId?: string;
  guess?: string;
  clue?: string;
  clues?: { en: string; fr: string; de: string; fa: string };
  isPass?: boolean;
};

export interface BotPersona {
  name: string;
  // Game-specific decision logic
  decidePiouPiou(myId: string, hand: string[], eggs: number, chicks: number, players: Doc<"players">[], board: any): BotMove;
  decideIncanGold(myId: string, currentGems: number, players: Doc<"players">[], board: any): "STAY" | "LEAVE";
  generateDixitPrompt(phase: string, clue?: string, ruleset?: string): string;
}

function calculateCrashProbability(board: any) {
    const hazardTypesOnPath = new Set<string>();
    board.path.forEach((id: string) => {
      if (id.startsWith("H_")) {
        const type = id.split("_")[1];
        hazardTypesOnPath.add(type);
      }
    });

    let lethalCardsInDeck = 0;
    hazardTypesOnPath.forEach(type => {
      const countOnPath = board.path.filter((id: string) => id.includes(type)).length;
      if (countOnPath === 1) lethalCardsInDeck += 2;
    });

    const cardsLeft = board.deck.length || 1;
    return lethalCardsInDeck / cardsLeft;
}

const DIXIT_PROMPT_REQUIREMENTS = "IMPORTANT: You MUST return a VALID JSON object and nothing else. NO MARKDOWN CODE BLOCKS. Return only the JSON.";
const DIXIT_GLOBAL_CONSTRAINT = "CRITICAL DIXIT RULE: NEVER describe the main subject, characters, or obvious action of the image. Literal summaries are forbidden. Your clue must relate to a background detail, a mood, an idiom, or a tangential concept.";

export const PERSONAS: Record<string, BotPersona> = {
  balanced: {
    name: "The Poet",
    decidePiouPiou(myId, hand, eggs, chicks, players, board) {
      const counts: Record<string, number[]> = { CHICKEN: [], ROOSTER: [], NEST: [], FOX: [] };
      hand.forEach((card, idx) => counts[card]?.push(idx));

      if (board.pendingAttack && String(board.pendingAttack.victimId) === String(myId)) {
        return counts.ROOSTER.length >= 2 
          ? { actionType: "DEFEND", indices: counts.ROOSTER.slice(0, 2), cards: ["ROOSTER", "ROOSTER"] }
          : { actionType: "ACCEPT", indices: [], cards: [] };
      }

      if (eggs > 0 && counts.CHICKEN.length >= 2) return { actionType: "HATCH", indices: counts.CHICKEN.slice(0, 2), cards: ["CHICKEN", "CHICKEN"] };
      if (counts.CHICKEN.length >= 1 && counts.ROOSTER.length >= 1 && counts.NEST.length >= 1) {
        return { actionType: "LAY_EGG", indices: [counts.CHICKEN[0], counts.ROOSTER[0], counts.NEST[0]], cards: ["CHICKEN", "ROOSTER", "NEST"] };
      }

      if (counts.FOX.length >= 1) {
        const target = players.filter(p => String(p._id) !== String(myId) && (p.state as any).eggs > 0).sort((a, b) => ((b.state as any).chicks || 0) - ((a.state as any).chicks || 0))[0];
        if (target) return { actionType: "ATTACK", indices: [counts.FOX[0]], cards: ["FOX"], targetPlayerId: target._id };
      }

      for (const [card, idxs] of Object.entries(counts)) if (idxs.length > 1) return { actionType: "DISCARD", indices: [idxs[0]], cards: [card] };
      return { actionType: "DISCARD", indices: [0], cards: [hand[0]] };
    },
    decideIncanGold(myId, currentGems, players, board) {
      const crashProb = calculateCrashProbability(board);
      if (crashProb > 0.15 || currentGems >= 15) return "LEAVE";
      if (board.artifactsOnPath.length > 0 && currentGems > 10) return "LEAVE";
      return "STAY";
    },
    generateDixitPrompt(phase, clue, ruleset) {
      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} You are THE POET. Look at these surreal images.
        1. Pick ONE image. DO NOT describe what is physically happening.
        2. What emotion, proverb, or abstract concept does this image evoke?
        3. Create a poetic, metaphorical clue (MAX 5 WORDS) based ONLY on the mood/concept.
        4. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} The Storyteller's clue is: \"${clue}\". 
        Pick the image index (1-6) that matches this concept's mood or vibe to trick others.
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        const odysseyInstruction = isOdyssey 
            ? "Since this is ODYSSEY mode, you can return ONE index for a +4 Risk Bonus if correct, or TWO indices for a safer +3 points if either matches. Choose strategically based on your confidence."
            : "Identify the ORIGINAL image index (1-N) played by the storyteller.";
            
        return `${odysseyInstruction} Clue: \"${clue}\". 
        Identify the ORIGINAL one played by the storyteller based on mood and subtext. 
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1, 2] } or { \"selectedIndices\": [1] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  },
  aggressive: {
    name: "The Trickster",
    decidePiouPiou(myId, hand, eggs, chicks, players, board) {
      const counts: Record<string, number[]> = { CHICKEN: [], ROOSTER: [], NEST: [], FOX: [] };
      hand.forEach((card, idx) => counts[card]?.push(idx));

      if (board.pendingAttack && String(board.pendingAttack.victimId) === String(myId)) {
        return counts.ROOSTER.length >= 2 
          ? { actionType: "DEFEND", indices: counts.ROOSTER.slice(0, 2), cards: ["ROOSTER", "ROOSTER"] }
          : { actionType: "ACCEPT", indices: [], cards: [] };
      }

      if (counts.FOX.length >= 1) {
        const target = players.filter(p => String(p._id) !== String(myId) && (p.state as any).eggs > 0).sort((a, b) => ((b.state as any).chicks || 0) - ((a.state as any).chicks || 0))[0];
        if (target) return { actionType: "ATTACK", indices: [counts.FOX[0]], cards: ["FOX"], targetPlayerId: target._id };
      }

      if (eggs > 0 && counts.CHICKEN.length >= 2) return { actionType: "HATCH", indices: counts.CHICKEN.slice(0, 2), cards: ["CHICKEN", "CHICKEN"] };
      if (counts.CHICKEN.length >= 1 && counts.ROOSTER.length >= 1 && counts.NEST.length >= 1) {
        return { actionType: "LAY_EGG", indices: [counts.CHICKEN[0], counts.ROOSTER[0], counts.NEST[0]], cards: ["CHICKEN", "ROOSTER", "NEST"] };
      }

      return { actionType: "DISCARD", indices: [0], cards: [hand[0]] };
    },
    decideIncanGold(myId, currentGems, players, board) {
      const crashProb = calculateCrashProbability(board);
      if (crashProb > 0.25 || currentGems >= 25) return "LEAVE";
      return "STAY";
    },
    generateDixitPrompt(phase, clue, ruleset) {
      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} You are THE TRICKSTER. Look at these images.
        1. Pick ONE image. Look for a shape, color, or minor element common to multiple pictures.
        2. Give a clue (MAX 5 WORDS) using a pun, idiom, or double-meaning relating to that specific element.
        3. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} Clue: \"${clue}\". 
        Pick the image index (1-6) that fits a double-meaning or secondary interpretation of the clue to lead players astray.
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        const odysseyInstruction = isOdyssey 
            ? "ODYSSEY mode active: Return ONE index (1-N) for a +4 Risk Bonus, or TWO indices for a safer +3 points. As a Trickster, prioritize finding the correct card to gain points."
            : "Identify the ORIGINAL storyteller card index (1-N).";

        return `${odysseyInstruction} Clue: \"${clue}\". 
        Look past the obvious decoys and find the subtle connection.
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  },
  cautious: {
    name: "The Sniper",
    decidePiouPiou(myId, hand, eggs, chicks, players, board) {
      const counts: Record<string, number[]> = { CHICKEN: [], ROOSTER: [], NEST: [], FOX: [] };
      hand.forEach((card, idx) => counts[card]?.push(idx));

      if (board.pendingAttack && String(board.pendingAttack.victimId) === String(myId)) {
        return counts.ROOSTER.length >= 2 
          ? { actionType: "DEFEND", indices: counts.ROOSTER.slice(0, 2), cards: ["ROOSTER", "ROOSTER"] }
          : { actionType: "ACCEPT", indices: [], cards: [] };
      }

      if (eggs > 0 && counts.CHICKEN.length >= 2) return { actionType: "HATCH", indices: counts.CHICKEN.slice(0, 2), cards: ["CHICKEN", "CHICKEN"] };
      if (counts.CHICKEN.length >= 1 && counts.ROOSTER.length >= 1 && counts.NEST.length >= 1) {
        return { actionType: "LAY_EGG", indices: [counts.CHICKEN[0], counts.ROOSTER[0], counts.NEST[0]], cards: ["CHICKEN", "ROOSTER", "NEST"] };
      }

      if (counts.FOX.length >= 1 && counts.ROOSTER.length >= 2) {
        const target = players.filter(p => String(p._id) !== String(myId) && (p.state as any).eggs > 0).sort((a, b) => ((b.state as any).chicks || 0) - ((a.state as any).chicks || 0))[0];
        if (target) return { actionType: "ATTACK", indices: [counts.FOX[0]], cards: ["FOX"], targetPlayerId: target._id };
      }

      return { actionType: "DISCARD", indices: [0], cards: [hand[0]] };
    },
    decideIncanGold(myId, currentGems, players, board) {
      const crashProb = calculateCrashProbability(board);
      if (crashProb > 0.08 || currentGems >= 10) return "LEAVE";
      return "STAY";
    },
    generateDixitPrompt(phase, clue, ruleset) {
      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} You are THE SNIPER. Look at these images.
        1. Pick ONE image. Ignore the main subject entirely.
        2. Find the smallest, most easily missed background detail or secondary object.
        3. Provide a literal, simple description (1-3 words) of ONLY that tiny detail.
        4. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} Clue: \"${clue}\". 
        Find an image in your hand that contains a similar tiny background detail.
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        const odysseyInstruction = isOdyssey 
            ? "ODYSSEY mode active: As a Sniper, you are cautious. Return TWO indices (1-N) to maximize your chances of getting the +3 points."
            : "Which card index (1-N) contains this specific micro-detail?";

        return `${odysseyInstruction} Clue: \"${clue}\". 
        Identify the Storyteller's card based on the micro-detail.
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  }
};
