/**
 * PageTypes.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Type definitions for a single form page.
 */

import { InputConfig } from "./InputTypes";

/** Configuration for one page (step) in a multi-step form. */
export interface PageConfig {
  /** Heading shown at the top of this page. */
  pageTitle: string;
  /** Ordered list of input fields on this page. */
  inputs: InputConfig[];
}

