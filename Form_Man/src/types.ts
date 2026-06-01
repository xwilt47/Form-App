export type InputType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "url"
  | "tel"
  | "date"
  | "textarea";

export interface InputConfig {
  name: string;
  type: InputType;
  limit: number;
  required?: boolean;
  placeholder?: string;
}

export interface PageConfig {
  pageTitle: string;
  inputs: InputConfig[];
}

/** Controls the page-to-page animation style. */
export type TransitionType = "slide" | "fade" | "vertical" | "zoom";

export interface FormConfig {
  formTitle: string;
  /** Page-transition animation style. Defaults to "slide". */
  transition?: TransitionType;
  /** Duration of each in/out animation (CSS time, e.g. "0.4s" or "400ms"). Defaults to "0.4s". */
  transitionDuration?: string;
  /** Pause between the outgoing page finishing and the incoming page starting (CSS time). Defaults to "0s". */
  transitionDelay?: string;
  pages: PageConfig[];
}

