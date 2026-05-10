/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as engine from "../engine.js";
import type * as game from "../game.js";
import type * as games_dixit from "../games/dixit.js";
import type * as games_dixit_deck from "../games/dixit_deck.js";
import type * as games_pioupiou from "../games/pioupiou.js";
import type * as games_registry from "../games/registry.js";
import type * as games_transitions from "../games/transitions.js";
import type * as games_types from "../games/types.js";
import type * as rooms from "../rooms.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  engine: typeof engine;
  game: typeof game;
  "games/dixit": typeof games_dixit;
  "games/dixit_deck": typeof games_dixit_deck;
  "games/pioupiou": typeof games_pioupiou;
  "games/registry": typeof games_registry;
  "games/transitions": typeof games_transitions;
  "games/types": typeof games_types;
  rooms: typeof rooms;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
