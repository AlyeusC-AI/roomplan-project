import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";

import { type AppRouter } from "./src/router/root";

export { createContext } from "./src/context";
export { type AppRouter, appRouter } from "./src/router/root";

/**
 * Inference helpers for input types
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
