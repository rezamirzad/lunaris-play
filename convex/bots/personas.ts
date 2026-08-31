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
  decideFlip7(myId: string, faceUpCards: string[], board: any): "HIT" | "FREEZE";
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
const DIXIT_GLOBAL_CONSTRAINT = "STORYTELLER RULE: You are a creative, human-like storyteller. Your goal is to provide a clue that is SUBTLE but not IMPOSSIBLE. AVOID literal lists (e.g. 'a boy and a dog'). AVOID extreme vagueness (e.g. 'blue', 'life'). PREFER themes, moods, or imaginative stories that connect the cards. Keep it friendly and accessible.";

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
    decideFlip7(myId, faceUpCards, board) {
      if (faceUpCards.length === 0) return "HIT";
      const uniqueCount = new Set(faceUpCards.filter((c: string) => c.startsWith("N_"))).size;
      return uniqueCount >= 5 ? "FREEZE" : "HIT";
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD" 
        ? "You are a creative 9-year-old child. Use simple but imaginative words like 'magical flight', 'hidden friend', 'forest secret'. NO hard words." 
        : "You are a creative adult. Use imaginative themes, moods, or cultural references (e.g. 'nostalgic childhood', 'peaceful isolation', 'a journey home').";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE DREAMER. 
        1. Pick ONE image. Think of the story it tells.
        2. Create a whimsical, evocative clue (MAX 4 WORDS).
        3. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Clue is: \"${clue}\". 
        Pick the image that fits the 'vibe' of this clue. Be clever but fair!
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        const odysseyInstruction = isOdyssey 
            ? "You have two guesses! Use them to find the storyteller's card."
            : "Identify the ORIGINAL card played by the storyteller.";
            
        return `${maturityConstraint} ${odysseyInstruction} Clue: \"${clue}\". 
        Find the card that best captures the story behind the words.
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
    decideFlip7(myId, faceUpCards, board) {
      if (faceUpCards.length === 0) return "HIT";
      const uniqueCount = new Set(faceUpCards.filter((c: string) => c.startsWith("N_"))).size;
      return uniqueCount >= 6 ? "FREEZE" : "HIT";
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD" 
        ? "You are a silly 9-year-old child. Use funny and creative words like 'cloud jump', 'banana moon', 'tickle stars'. NO hard words." 
        : "You are an eccentric adult with wild imagination. Use playful logic, paradoxes, or absurd but fitting descriptions.";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE MAD HATTER.
        1. Pick ONE image. Find a surprising connection or a wild theme.
        2. Create a clue (MAX 4 WORDS) that is playful, a bit silly, or logic-twisting. 
        3. Make it interesting so that others have to think twice!
        4. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Clue is: \"${clue}\". 
        Pick a card that matches the playful or wild logic of the clue.
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        const odysseyInstruction = isOdyssey 
            ? "Two guesses for the Mad Hatter's mystery card!"
            : "Identify the ORIGINAL playful card index (1-N).";

        return `${maturityConstraint} ${odysseyInstruction} Clue: \"${clue}\". 
        Don't be fooled by boring cards! Find the one with the clever, wild logic.
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
    decideFlip7(myId, faceUpCards, board) {
      if (faceUpCards.length === 0) return "HIT";
      const uniqueCount = new Set(faceUpCards.filter((c: string) => c.startsWith("N_"))).size;
      return uniqueCount >= 4 ? "FREEZE" : "HIT";
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD" 
        ? "You are a quiet, observant 10-year-old. Use simple words about specific details like 'tiny spark', 'long path', 'golden key'." 
        : "You are an observant adult. Use clues focused on subtle details, symbolism, or quiet themes.";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE WISE OWL. 
        1. Pick ONE image. Look for a detail or a pattern that stands out.
        2. Give a simple, wise clue (1-3 words) about that detail or theme.
        3. Make it specific enough to be guessed, but not too obvious!
        4. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Clue is: \"${clue}\". 
        Look for a card with a similar detail or theme. Be precise!
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        const odysseyInstruction = isOdyssey 
            ? "Two wise guesses to find the original card. Watch for the details!"
            : "Which card index (1-N) captures the Owl's detail?";

        return `${maturityConstraint} ${odysseyInstruction} Clue: \"${clue}\". 
        Look closely at all pictures. The answer often lies in the small things.
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  }
};
