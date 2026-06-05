import { ConvexClient } from "convex/browser";
import { internal } from "./convex/_generated/api";
import * as fs from 'fs';

async function main() {
  const client = new ConvexClient(process.env.CONVEX_URL!);
  const dataset = JSON.parse(fs.readFileSync('frontend/public/assets/games/justone/justone_clues.json', 'utf8'));

  // Batch into groups of 50 to avoid timeout/size limits
  const BATCH_SIZE = 50;
  for (let i = 0; i < dataset.length; i += BATCH_SIZE) {
    const batch = dataset.slice(i, i + BATCH_SIZE);
    console.log(`Importing batch ${i / BATCH_SIZE + 1}...`);
    await client.mutation(internal.importClues.importClues, { cluesData: batch });
  }
  console.log("Import complete!");
}

main().catch(console.error);
