import { PageConfig } from "../types";
import { InputBuilder } from "./InputBuilder";

/**
 * PageBuilder
 * ─────────────────────────────────────────────────────────────────────────────
 * Single responsibility: turn one PageConfig into a form-page HTML string.
 * Delegates individual input rendering to InputBuilder.
 */
export class PageBuilder {
  private _inputBuilder: InputBuilder;

  constructor() {
    this._inputBuilder = new InputBuilder();
  }

  /**
   * Renders one form page (header + inputs + navigation buttons).
   * @param page   A validated PageConfig object.
   * @param index  Zero-based page index.
   * @param total  Total number of pages in the form.
   */
  build(page: PageConfig, index: number, total: number): string {
    const inputs  = page.inputs.map(inp => this._inputBuilder.build(inp)).join("");
    const isFirst = index === 0;
    const isLast  = index === total - 1;

    return `
    <div class="form-page" id="page-${index}" ${isFirst ? "" : 'style="display:none"'}>
      <h2>${page.pageTitle}</h2>
      <p class="page-counter">Page ${index + 1} of ${total}</p>
      ${inputs}
      <div class="nav-buttons">
        ${!isFirst ? `<button type="button" class="btn-prev" onclick="navigate(${index}, -1)">← Previous</button>` : ""}
        ${!isLast  ? `<button type="button" class="btn-next" onclick="navigate(${index},  1)">Next →</button>`     : ""}
        ${isLast   ? `<button type="submit" class="btn-submit">Submit ✓</button>`                                  : ""}
      </div>
    </div>`;
  }
}

