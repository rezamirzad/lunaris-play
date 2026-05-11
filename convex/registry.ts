import { GamePlugin } from "./types";
import { dixitPlugin } from "./dixit";
import { pioupiouPlugin } from "./pioupiou";
import { themindPlugin } from "./themind";
import { justonePlugin } from "./justone";

const registry: Record<string, GamePlugin> = {
  dixit: dixitPlugin,
  pioupiou: pioupiouPlugin,
  themind: themindPlugin,
  justone: justonePlugin,
};

export function getGamePlugin(gameType: string): GamePlugin {
  const normalizedType = gameType.toLowerCase().replace(/\s+/g, "");
  const plugin = registry[normalizedType];
  if (!plugin) throw new Error(`Game plugin not found for ${gameType}`);
  return plugin;
}
