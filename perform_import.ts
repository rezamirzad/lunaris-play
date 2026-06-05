import { ConvexClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as fs from "fs";

async function main() {
  const url =
    process.env.CONVEX_URL || "https://gregarious-rat-78.convex.cloud";
  console.log(`Connecting to: ${url}`);
  const client = new ConvexClient(url, { skipConvexDeploymentUrlCheck: true });

  const filePath = "frontend/public/assets/games/justone/justone_clues.json";
  const dataset = JSON.parse(fs.readFileSync(filePath, "utf8"));
  // Import one by one to ensure connection stability
  for (let i = 0; i < dataset.length; i++) {
    const entry = dataset[i];
    console.log(
      `Importing word ${i + 1}/${dataset.length}: ${entry.word.en}...`,
    );
    try {
      await client.mutation(api.importClues.importClues, {
        cluesData: [entry],
      });
      // Short delay to keep connection stable
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (e) {
      console.error(`Error importing ${entry.word.en}:`, e);
    }
  }
  console.log("Import complete!");
  client.close();
}

main().catch(console.error);
