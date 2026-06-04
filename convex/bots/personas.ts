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
  generateDixitPrompt(phase: string, maturity: "CHILD" | "ADULT", clue?: string, ruleset?: string): string;
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
const DIXIT_GLOBAL_CONSTRAINT = "STORYTELLER RULE: You are a whimsical Dream-Weaver. You MUST NOT mention any characters, animals, or main objects in the picture. Literal descriptions are forbidden. Instead, use clues about FEELINGS (e.g. 'lonely', 'excited'), COLORS (e.g. 'sunset glow'), or NONSENSE RIDDLES.";

export const PERSONAS: Record<string, BotPersona> = {
  balanced: {
    name: "The Dreamer",
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
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD" 
        ? "You are a 9-year-old child telling a secret. Use very simple words like 'happy bird', 'blue sky', 'scary shadow'. NO metaphors or complex words." 
        : "You are a sophisticated literary scholar. Use deep metaphors, abstract concepts, and references to art or philosophy (e.g. 'existential dread', 'vibrant melancholy').";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE DREAMER. 
        1. Pick ONE image. Look at the background or the 'air' in the picture.
        2. Create a whimsical, poetic clue (MAX 4 WORDS).
        3. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Dream-Clue is: \"${clue}\". 
        Pick the image that feels most like this dream, even if it looks different. Be tricky like a magician!
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        const odysseyInstruction = isOdyssey 
            ? "You have two magical guesses! Use them wisely to find the original dream-card."
            : "Identify the ORIGINAL dream-card played by the storyteller.";
            
        return `${maturityConstraint} ${odysseyInstruction} Clue: \"${clue}\". 
        Find the card that fits the 'feeling' of the words, not the literal objects.
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  },
  aggressive: {
    name: "The Mad Hatter",
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
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD" 
        ? "You are a silly 9-year-old child. Use funny words like 'boing', 'splat', 'giggly wiggly'. NO hard words." 
        : "You are an eccentric, high-IQ strategist. Use chaotic logic, complex wordplay, and paradoxical riddles.";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE MAD HATTER.
        1. Pick ONE image. Find a funny shape or a silly color.
        2. Create a clue (MAX 4 WORDS) that is a silly pun, a funny rhyme, or pure nonsense logic. 
        3. Make it so abstract that only a very clever child would guess it!
        4. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Nonsense-Clue is: \"${clue}\". 
        Pick a card that matches the silly logic or the colors of the clue to confuse everyone.
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        const odysseyInstruction = isOdyssey 
            ? "Silly mode! You get two guesses to find the Hatter's original card."
            : "Identify the ORIGINAL silly card index (1-N).";

        return `${maturityConstraint} ${odysseyInstruction} Clue: \"${clue}\". 
        Don't be fooled by boring cards! Find the one that has the secret silly logic.
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  },
  cautious: {
    name: "The Owl",
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
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD" 
        ? "You are a very quiet, observant 10-year-old child. Use simple, direct words about tiny things." 
        : "You are an ancient, philosophical guardian of secrets. Use cryptic, stoic, and deeply observant language.";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE WISE OWL. 
        1. Pick ONE image. Look for a tiny, tiny detail in the corner or the sky.
        2. Give a simple, wise clue (1-3 words) about that tiny detail.
        3. Make it so tiny that others might miss it!
        4. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Wise-Clue is: \"${clue}\". 
        Look for a tiny detail in your cards that matches. Be very careful!
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        const odysseyInstruction = isOdyssey 
            ? "Use your wisdom to make two guesses. Look for the tiny details!"
            : "Which card index (1-N) has the tiny detail the Owl saw?";

        return `${maturityConstraint} ${odysseyInstruction} Clue: \"${clue}\". 
        Look very closely at all the pictures. The answer is hidden in a small place.
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  }
};
