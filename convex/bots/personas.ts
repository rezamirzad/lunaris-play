import { Doc } from "../_generated/dataModel";
import { decideFlip7Action } from "./flip7_ai";

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
  decideFlip7(myId: string, faceUpCards: string[], hasSecondChance: boolean, bankedScore: number, board: any): "HIT" | "FREEZE";
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
const DIXIT_GLOBAL_CONSTRAINT = "HUMAN STORYTELLER RULE: You are playing Dixit with human friends in a cozy game night setting. Your clues must feel natural, poetic, and genuinely human. NEVER use literal names of main objects visible in the card (e.g. if the image contains a key, clock, or cat, DO NOT use the words 'key', 'clock', or 'cat'). AVOID literal object lists (e.g. 'a boy and a dog' or 'red house'). AVOID single generic words ('life', 'sad', 'blue'). Instead, express shared human feelings, nostalgic memories, film/book tropes, idioms, soundscapes, or evocative moods (e.g. 'the day before summer ends', 'open sesame', 'second thoughts', 'whispers in the attic'). Keep clues concise (1-4 words).";

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
    decideFlip7(myId, faceUpCards, hasSecondChance, bankedScore, board) {
      return decideFlip7Action({
        myId,
        faceUpCards,
        hasSecondChance,
        bankedScore,
        persona: "balanced",
        board,
      });
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD" 
        ? "YOU ARE PLAYING AS A CREATIVE CHILD (Age 7-12). Use warm, magical, and imaginative child-like words (e.g. 'secret dragon tree', 'cloud castle', 'star wishes'). NO overly complex vocabulary." 
        : "YOU ARE PLAYING AS AN IMAGINATIVE ADULT (Age 18+). Focus on nostalgic memories, cozy themes, or poetic storytelling (e.g. 'unfinished song', 'golden hour', 'parallel universe').";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE DREAMER persona. 
        1. Pick ONE image. Think of the warm story or emotion it conveys.
        2. Create a poetic, evocative clue (MAX 4 WORDS).
        3. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Clue is: \"${clue}\". 
        Pick the image from your private hand that best captures the mood or subtle metaphor of this clue to trick human opponents!
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        const odysseyInstruction = isOdyssey 
            ? "ODYSSEY VOTING RULE: Evaluate all table cards. If you are VERY confident in a single card matching the clue, submit 1 card in selectedIndices (e.g. [3]). If you are uncertain and torn between two potential cards, submit 2 cards in selectedIndices (e.g. [3, 5]) to hedge your guess."
            : "Identify the single original card played by the Storyteller.";
            
        return `${maturityConstraint} ${odysseyInstruction} Clue: \"${clue}\". 
        Deduce which card truly inspired the clue versus cards planted as traps by opponents.
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1] } OR { \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
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
    decideFlip7(myId, faceUpCards, hasSecondChance, bankedScore, board) {
      return decideFlip7Action({
        myId,
        faceUpCards,
        hasSecondChance,
        bankedScore,
        persona: "aggressive",
        board,
      });
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
            ? "ODYSSEY VOTING RULE: Look for the clever or wild logic! If 1 card stands out clearly, submit 1 card in selectedIndices (e.g. [2]). If 2 cards both seem delightfully wild, submit 2 cards in selectedIndices (e.g. [2, 4])."
            : "Identify the ORIGINAL playful card index (1-N).";

        return `${maturityConstraint} ${odysseyInstruction} Clue: \"${clue}\". 
        Don't be fooled by boring cards! Find the one with the clever, wild logic.
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1] } OR { \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
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
    decideFlip7(myId, faceUpCards, hasSecondChance, bankedScore, board) {
      return decideFlip7Action({
        myId,
        faceUpCards,
        hasSecondChance,
        bankedScore,
        persona: "cautious",
        board,
      });
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD" 
        ? "You are a quiet, observant 10-year-old. Use simple words about specific details like 'tiny spark', 'long path', 'brass gear'." 
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
            ? "ODYSSEY VOTING RULE: Carefully analyze subtle details. If one detail is a high-confidence match, submit 1 card in selectedIndices (e.g. [1]). If two cards both share subtle clues, submit 2 cards in selectedIndices (e.g. [1, 4]) to hedge risk."
            : "Which card index (1-N) captures the Owl's detail?";

        return `${maturityConstraint} ${odysseyInstruction} Clue: \"${clue}\". 
        Look closely at all pictures. The answer often lies in the small things.
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1] } OR { \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  },
  intuitive: {
    name: "The Mystic",
    decidePiouPiou(myId, hand, eggs, chicks, players, board) {
      return PERSONAS.balanced.decidePiouPiou(myId, hand, eggs, chicks, players, board);
    },
    decideIncanGold(myId, currentGems, players, board) {
      return currentGems >= 12 ? "LEAVE" : "STAY";
    },
    decideFlip7(myId, faceUpCards, hasSecondChance, bankedScore, board) {
      return decideFlip7Action({
        myId,
        faceUpCards,
        hasSecondChance,
        bankedScore,
        persona: "intuitive",
        board,
      });
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      return PERSONAS.balanced.generateDixitPrompt(phase, maturity, clue, ruleset);
    }
  },
  wild: {
    name: "The Daredevil",
    decidePiouPiou(myId, hand, eggs, chicks, players, board) {
      return PERSONAS.aggressive.decidePiouPiou(myId, hand, eggs, chicks, players, board);
    },
    decideIncanGold(myId, currentGems, players, board) {
      return currentGems >= 20 ? "LEAVE" : "STAY";
    },
    decideFlip7(myId, faceUpCards, hasSecondChance, bankedScore, board) {
      return decideFlip7Action({
        myId,
        faceUpCards,
        hasSecondChance,
        bankedScore,
        persona: "wild",
        board,
      });
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      return PERSONAS.aggressive.generateDixitPrompt(phase, maturity, clue, ruleset);
    }
  },
  storyteller: {
    name: "The Storyteller",
    decidePiouPiou(myId, hand, eggs, chicks, players, board) {
      return PERSONAS.balanced.decidePiouPiou(myId, hand, eggs, chicks, players, board);
    },
    decideIncanGold(myId, currentGems, players, board) {
      return currentGems >= 14 ? "LEAVE" : "STAY";
    },
    decideFlip7(myId, faceUpCards, hasSecondChance, bankedScore, board) {
      return decideFlip7Action({ myId, faceUpCards, hasSecondChance, bankedScore, persona: "storyteller", board });
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD"
        ? "YOU ARE PLAYING AS A STORYTELLING CHILD (Age 7-12). Use classic fairytale and legend tropes (e.g. 'glass slipper', 'dragon cave', 'magic wand', 'hidden treasure')."
        : "YOU ARE PLAYING AS A LITERARY STORYTELLER (Age 18+). Focus on classical myths, folklore, or epic story tropes (e.g. 'pandora\\'s box', 'icarus flight', 'the odyssey home', 'labyrinth exit').";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE STORYTELLER persona.
        1. Pick ONE image. Connect it to a famous myth, fairytale, or legendary tale.
        2. Create an evocative clue (1-4 words) referencing storytelling lore.
        3. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Clue is: \"${clue}\".
        Pick a card from your hand that best matches legendary tales or fairytale tropes.
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        return `${maturityConstraint} Find the original card that fits the story trope clue! Clue: \"${clue}\".
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1] } OR { \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  },
  surrealist: {
    name: "The Surrealist",
    decidePiouPiou(myId, hand, eggs, chicks, players, board) {
      return PERSONAS.balanced.decidePiouPiou(myId, hand, eggs, chicks, players, board);
    },
    decideIncanGold(myId, currentGems, players, board) {
      return currentGems >= 16 ? "LEAVE" : "STAY";
    },
    decideFlip7(myId, faceUpCards, hasSecondChance, bankedScore, board) {
      return decideFlip7Action({ myId, faceUpCards, hasSecondChance, bankedScore, persona: "surrealist", board });
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD"
        ? "YOU ARE A SURREALIST CHILD (Age 7-12). Use strange, dreamy sensory words (e.g. 'dancing shadow', 'whispering cloud', 'floating clock')."
        : "YOU ARE A SURREALIST ARTIST (Age 18+). Use abstract sensory moods, dream logic, or liminal space concepts (e.g. 'liminal hallway', 'fractured echo', 'melting time', 'velvet silence').";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE SURREALIST persona.
        1. Pick ONE image. Focus on its abstract mood, dream logic, or sensory feeling.
        2. Create a deeply abstract, surreal clue (1-3 words).
        3. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Clue is: \"${clue}\".
        Pick the most abstract, dream-like image that captures the mood of this clue.
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        return `${maturityConstraint} Trust your dream intuition to find the original surreal card matching: \"${clue}\".
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1] } OR { \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  },
  cinephile: {
    name: "The Cinephile",
    decidePiouPiou(myId, hand, eggs, chicks, players, board) {
      return PERSONAS.aggressive.decidePiouPiou(myId, hand, eggs, chicks, players, board);
    },
    decideIncanGold(myId, currentGems, players, board) {
      return currentGems >= 18 ? "LEAVE" : "STAY";
    },
    decideFlip7(myId, faceUpCards, hasSecondChance, bankedScore, board) {
      return decideFlip7Action({ myId, faceUpCards, hasSecondChance, bankedScore, persona: "cinephile", board });
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD"
        ? "YOU ARE A MOVIE-LOVING CHILD (Age 7-12). Use cinematic cartoon/hero tropes (e.g. 'superhero landing', 'laser chase', 'cosmic rocket')."
        : "YOU ARE A CINEPHILE (Age 18+). Use dramatic film visual tropes, noir lighting, or cinematic moods (e.g. 'film noir rain', 'neon midnight', 'fade to black', 'director\\'s cut').";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE CINEPHILE persona.
        1. Pick ONE image. Imagine it as a dramatic frame in a movie.
        2. Create a cinematic, visual clue (1-4 words).
        3. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Clue is: \"${clue}\".
        Pick a card that looks like a cinematic movie frame matching the clue.
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        return `${maturityConstraint} Find the cinematic card that inspired the clue: \"${clue}\".
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1] } OR { \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  },
  virtuoso: {
    name: "The Virtuoso",
    decidePiouPiou(myId, hand, eggs, chicks, players, board) {
      return PERSONAS.balanced.decidePiouPiou(myId, hand, eggs, chicks, players, board);
    },
    decideIncanGold(myId, currentGems, players, board) {
      return currentGems >= 15 ? "LEAVE" : "STAY";
    },
    decideFlip7(myId, faceUpCards, hasSecondChance, bankedScore, board) {
      return decideFlip7Action({ myId, faceUpCards, hasSecondChance, bankedScore, persona: "virtuoso", board });
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD"
        ? "YOU ARE A MUSICAL CHILD (Age 7-12). Use fun sound and music words (e.g. 'happy piano', 'drum roll', 'singing bird')."
        : "YOU ARE A MUSICAL VIRTUOSO (Age 18+). Focus on acoustic sensations, musical rhythms, and soundscapes (e.g. 'staccato heartbeat', 'crying violin', 'silent symphony', 'minor chord').";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE VIRTUOSO persona.
        1. Pick ONE image. Think of the musical melody or rhythm it evokes.
        2. Create a musical soundscape clue (1-4 words).
        3. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Clue is: \"${clue}\".
        Pick a card matching the musical mood or rhythm of this clue.
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        return `${maturityConstraint} Listen for the musical card matching clue: \"${clue}\".
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1] } OR { \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  },
  alchemist: {
    name: "The Alchemist",
    decidePiouPiou(myId, hand, eggs, chicks, players, board) {
      return PERSONAS.balanced.decidePiouPiou(myId, hand, eggs, chicks, players, board);
    },
    decideIncanGold(myId, currentGems, players, board) {
      return currentGems >= 17 ? "LEAVE" : "STAY";
    },
    decideFlip7(myId, faceUpCards, hasSecondChance, bankedScore, board) {
      return decideFlip7Action({ myId, faceUpCards, hasSecondChance, bankedScore, persona: "alchemist", board });
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD"
        ? "YOU ARE A SPACE/SCIENCE CHILD (Age 7-12). Use star and potion words (e.g. 'magic potion', 'shooting star', 'alien galaxy')."
        : "YOU ARE AN ALCHEMIST & COSMOLOGIST (Age 18+). Focus on astronomy, elements, and transformations (e.g. 'supernova memory', 'quantum entanglement', 'gilded mercury', 'starlight reaction').";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE ALCHEMIST persona.
        1. Pick ONE image. Connect it to cosmic elements, astronomy, or transformation.
        2. Create an elemental, cosmic clue (1-4 words).
        3. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Clue is: \"${clue}\".
        Pick a card representing elemental or cosmic themes matching the clue.
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        return `${maturityConstraint} Find the cosmic/elemental card matching clue: \"${clue}\".
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1] } OR { \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  },
  historian: {
    name: "The Historian",
    decidePiouPiou(myId, hand, eggs, chicks, players, board) {
      return PERSONAS.cautious.decidePiouPiou(myId, hand, eggs, chicks, players, board);
    },
    decideIncanGold(myId, currentGems, players, board) {
      return currentGems >= 13 ? "LEAVE" : "STAY";
    },
    decideFlip7(myId, faceUpCards, hasSecondChance, bankedScore, board) {
      return decideFlip7Action({ myId, faceUpCards, hasSecondChance, bankedScore, persona: "historian", board });
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD"
        ? "YOU ARE A HISTORY-LOVING CHILD (Age 7-12). Use castle, pirate, and ancient knight words (e.g. 'old castle', 'pirate ship', 'knight armor')."
        : "YOU ARE A HISTORIAN (Age 18+). Focus on historical eras, lost empires, and antique relics (e.g. 'victorian shadow', 'forgotten kingdom', 'ancient parchment', 'gilded age').";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE HISTORIAN persona.
        1. Pick ONE image. Connect it to an era of history, an antique relic, or a lost kingdom.
        2. Create a historical, nostalgic clue (1-4 words).
        3. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Clue is: \"${clue}\".
        Pick an antique or historically evocative card matching the clue.
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        return `${maturityConstraint} Deduce the historical card matching clue: \"${clue}\".
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1] } OR { \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  },
  trickster: {
    name: "The Trickster",
    decidePiouPiou(myId, hand, eggs, chicks, players, board) {
      return PERSONAS.aggressive.decidePiouPiou(myId, hand, eggs, chicks, players, board);
    },
    decideIncanGold(myId, currentGems, players, board) {
      return currentGems >= 21 ? "LEAVE" : "STAY";
    },
    decideFlip7(myId, faceUpCards, hasSecondChance, bankedScore, board) {
      return decideFlip7Action({ myId, faceUpCards, hasSecondChance, bankedScore, persona: "trickster", board });
    },
    generateDixitPrompt(phase, maturity, clue, ruleset) {
      const maturityConstraint = maturity === "CHILD"
        ? "YOU ARE A SILLY TRICKSTER CHILD (Age 7-12). Use riddle and funny joke words (e.g. 'magic trick', 'funny face', 'hidden door')."
        : "YOU ARE A TRICKSTER (Age 18+). Focus on clever wordplay, riddles, double entendres, or illusions (e.g. 'mirror lying', 'catching shadows', 'second glance', 'illusionist trap').";

      if (phase === "CLUE") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} You are THE TRICKSTER persona.
        1. Pick ONE image. Craft a clever riddle clue or double entendre.
        2. Create a tricky, riddle-like clue (1-4 words).
        3. Translate this clue into English, French, German, and Persian.
        Return ONLY a JSON object: { \"selectedIndex\": 1, \"clues\": { \"en\": \"...\", \"fr\": \"...\", \"de\": \"...\", \"fa\": \"...\" } }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "SUBMITTING") {
        return `${DIXIT_GLOBAL_CONSTRAINT} ${maturityConstraint} The Clue is: \"${clue}\".
        Pick a card with double meanings or tricky visual elements matching the clue.
        Return ONLY a JSON object: { \"selectedIndex\": 1 }
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      if (phase === "VOTING") {
        const isOdyssey = ruleset === "ODYSSEY";
        return `${maturityConstraint} Outsmart the trickster clue! Clue: \"${clue}\".
        Return ONLY a JSON object: ${isOdyssey ? '{ \"selectedIndices\": [1] } OR { \"selectedIndices\": [1, 2] }' : '{ \"selectedIndex\": 1 }'}
        ${DIXIT_PROMPT_REQUIREMENTS}`;
      }
      return "";
    }
  }
};
