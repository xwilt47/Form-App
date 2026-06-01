/**
 * index.ts  (types barrel)
 * ─────────────────────────────────────────────────────────────────────────────
 * Single import point for all type definitions.
 * Consumers use:  import { FormConfig, InputConfig, ... } from "./types"
 */

export type { InputType, InputConfig }      from "./InputTypes";
export type { PageConfig }                  from "./PageTypes";
export type { TransitionType, FormConfig }  from "./FormTypes";

