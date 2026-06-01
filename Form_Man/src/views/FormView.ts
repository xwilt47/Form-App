import { FormConfig } from "../types";
import { PageBuilder }   from "./PageBuilder";
import { StyleBuilder }  from "./StyleBuilder";
import { ScriptBuilder } from "./ScriptBuilder";

/**
 * FormView
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates all sub-builders to produce a complete, standalone HTML document
 * string.  This is the top-level "View" in the MVC pipeline.
 *
 * Dependencies (injected via constructor for testability):
 *   PageBuilder, StyleBuilder, ScriptBuilder
 */
export class FormView {
  private _pageBuilder:   PageBuilder;
  private _styleBuilder:  StyleBuilder;
  private _scriptBuilder: ScriptBuilder;

  constructor(
    pageBuilder   = new PageBuilder(),
    styleBuilder  = new StyleBuilder(),
    scriptBuilder = new ScriptBuilder(),
  ) {
    this._pageBuilder   = pageBuilder;
    this._styleBuilder  = styleBuilder;
    this._scriptBuilder = scriptBuilder;
  }

  /**
   * Renders a full HTML document from a validated FormConfig.
   * @param config  A validated FormConfig object (from the model).
   * @returns       A self-contained HTML string ready to be written to disk.
   */
  render(config: FormConfig): string {
    const transition         = config.transition         ?? "slide";
    const transitionDuration = config.transitionDuration ?? "0.4s";
    const transitionDelay    = config.transitionDelay    ?? "0s";

    const pagesHtml = config.pages
      .map((page, i) => this._pageBuilder.build(page, i, config.pages.length))
      .join("");

    const styles = this._styleBuilder.build();
    const script = this._scriptBuilder.build(
      config.pages.length,
      transition,
      transitionDuration,
      transitionDelay,
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.formTitle}</title>
  ${styles}
</head>
<body>
  <div class="form-wrapper">
    <h1>${config.formTitle}</h1>
    <div class="progress-bar"><div class="progress-fill"></div></div>

    <form id="multi-step-form">
      <div class="form-pages-track">
        ${pagesHtml}
      </div>
    </form>

    <div class="success-message">
      <h2>✅ Submitted!</h2>
      <p>Thank you for completing the form.</p>
    </div>
  </div>
  ${script}
</body>
</html>`;
  }
}

