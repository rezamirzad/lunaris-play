/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as dixit from "../dixit.js";
import type * as dixit_deck from "../dixit_deck.js";
import type * as engine from "../engine.js";
import type * as justone from "../justone.js";
import type * as justone_words from "../justone_words.js";
import type * as pioupiou from "../pioupiou.js";
import type * as registry from "../registry.js";
import type * as rooms from "../rooms.js";
import type * as themind from "../themind.js";
import type * as transitions from "../transitions.js";
import type * as types from "../types.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  dixit: typeof dixit;
  dixit_deck: typeof dixit_deck;
  engine: typeof engine;
  justone: typeof justone;
  justone_words: typeof justone_words;
  pioupiou: typeof pioupiou;
  registry: typeof registry;
  rooms: typeof rooms;
  themind: typeof themind;
  transitions: typeof transitions;
  types: typeof types;
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
