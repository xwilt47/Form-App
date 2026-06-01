/**
 * InputTypes.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Type definitions for a single form input field.
 */

/** All supported HTML input types plus "textarea". */
export type InputType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "url"
  | "tel"
  | "date"
  | "textarea";

/** Configuration for a single input field on a form page. */
export interface InputConfig {
  /** Display label and HTML name attribute (slugified). */
  name: string;
  /** HTML input type (or "textarea"). */
  type: InputType;
  /** Max character length (text) or max numeric value (number). */
  limit: number;
  /** Whether the field must be filled before advancing. Defaults to false. */
  required?: boolean;
  /** Placeholder text. Defaults to the field name. */
  placeholder?: string;
}

