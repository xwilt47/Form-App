export type InputType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "url"
  | "tel"
  | "date"
  | "textarea";

export type StylePreset = "default" | "dark" | "ocean" | "rose" | "forest" | "custom";

export interface StyleConfig {
  /** Built-in preset theme name. Use "custom" to rely entirely on your own overrides. */
  preset?: StylePreset;

  // ── Custom overrides (all optional — only override what you want) ──────────
  /** Page background colour */
  bgColor?: string;
  /** Card / form wrapper background */
  cardColor?: string;
  /** Card border radius (e.g. "12px") */
  cardRadius?: string;
  /** Card box shadow (e.g. "0 4px 24px rgba(0,0,0,0.1)") */
  cardShadow?: string;
  /** Primary accent colour – used for progress bar, focus ring, buttons */
  accentColor?: string;
  /** Darker shade of the accent for hover states */
  accentHover?: string;
  /** Heading / title text colour */
  headingColor?: string;
  /** Label text colour */
  labelColor?: string;
  /** Input border colour */
  inputBorder?: string;
  /** Input background colour */
  inputBg?: string;
  /** Input text colour */
  inputColor?: string;
  /** Font family (e.g. "'Georgia', serif") */
  fontFamily?: string;
  /** Animation speed (e.g. "0.4s") */
  animationSpeed?: string;
}

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

export interface FormConfig {
  formTitle: string;
  pages: PageConfig[];
  /** Optional style configuration */
  style?: StyleConfig;
}
