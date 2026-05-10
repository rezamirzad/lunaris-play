import { GamePlugin } from "./types";
import { dixitPlugin } from "./dixit";
import { pioupiouPlugin } from "./pioupiou";

const registry: Record<string, GamePlugin> = {
  dixit: dixitPlugin,
  pioupiou: pioupiouPlugin,
};

export function getGamePlugin(gameType: string): GamePlugin {
  const plugin = registry[gameType.toLowerCase()];
  if (!plugin) throw new Error(`Game plugin not found for ${gameType}`);
  return plugin;
}
