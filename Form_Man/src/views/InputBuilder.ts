import { InputConfig } from "../types";
import { NameUtils }   from "../utils/NameUtils";

/**
 * InputBuilder
 * ─────────────────────────────────────────────────────────────────────────────
 * Single responsibility: turn one InputConfig into an HTML form-group string.
 */
export class InputBuilder {
  /**
   * Renders one input field (or textarea) as an HTML string.
   * @param input  A validated InputConfig object.
   */
  build(input: InputConfig): string {
    const id          = NameUtils.toSnakeCase(input.name);
    const placeholder = input.placeholder ?? input.name;
    const required    = input.required ? "required" : "";
    const limitAttr   = input.type === "number"
      ? `max="${input.limit}"`
      : `maxlength="${input.limit}"`;
    const hint = input.type === "number"
      ? `Max value: ${input.limit}`
      : `Max ${input.limit} characters`;

    if (input.type === "textarea") {
      return `
      <div class="form-group">
        <label for="${id}">${input.name}</label>
        <textarea
          id="${id}"
          name="${id}"
          placeholder="${placeholder}"
          maxlength="${input.limit}"
          ${required}
        ></textarea>
        <small class="limit-hint">Max ${input.limit} characters</small>
      </div>`;
    }

    return `
      <div class="form-group">
        <label for="${id}">${input.name}</label>
        <input
          type="${input.type}"
          id="${id}"
          name="${id}"
          placeholder="${placeholder}"
          ${limitAttr}
          ${required}
        />
        <small class="limit-hint">${hint}</small>
      </div>`;
  }
}
