/**
 * FormTypes.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Top-level type definitions for the entire form configuration.
 */

import { PageConfig } from "./PageTypes";

/** Controls the page-to-page animation style. */
export type TransitionType = "slide" | "fade" | "vertical" | "zoom";

/** Root configuration object — maps directly to form-config.json. */
export interface FormConfig {
  /** Title displayed at the top of the form. */
  formTitle: string;
  /** Page-transition animation style. Defaults to "slide". */
  transition?: TransitionType;
  /** Duration of each in/out animation (CSS time, e.g. "0.4s" or "400ms"). Defaults to "0.4s". */
  transitionDuration?: string;
  /** Pause between the outgoing page finishing and the incoming page starting. Defaults to "0s". */
  transitionDelay?: string;
  /** Ordered list of pages in the form. At least one is required. */
  pages: PageConfig[];
}

