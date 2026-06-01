import { FormConfig } from "../types";
import { NameUtils }     from "../utils/NameUtils";
import { PageBuilder }   from "./PageBuilder";
import { StyleBuilder }  from "./StyleBuilder";
import { ScriptBuilder, PageSchema } from "./ScriptBuilder";

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

    // Compute page schemas so the script can build the nested POST body
    const pageSchemas: PageSchema[] = config.pages.map(page => ({
      model:  NameUtils.toSnakeCase(page.pageTitle),
      fields: page.inputs.map(inp => NameUtils.toSnakeCase(inp.name)),
    }));

    const styles = this._styleBuilder.build();
    const script = this._scriptBuilder.build(
      config.pages.length,
      transition,
      transitionDuration,
      transitionDelay,
      pageSchemas,
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

    <form id="multi-step-form" novalidate>
      <div class="form-pages-track">
        ${pagesHtml}

        <!-- Result slide: animated in after submit, shows the API JSON response -->
        <div class="form-page" id="page-result" style="display:none">
          <div class="result-header">
            <div class="result-icon">✅</div>
            <h2>Submitted!</h2>
            <p>Sending your response to the API…</p>
          </div>
          <div class="result-loading">Waiting for API response</div>
          <div class="result-error"></div>
          <div class="result-json-box">
            <div class="result-json-label">
              <span>API Response</span>
              <button type="button" class="btn-copy-json" onclick="copyJson()">📋 Copy</button>
            </div>
            <pre class="result-json"></pre>
          </div>
        </div>

      </div>
    </form>
  </div>
  ${script}
</body>
</html>`;
  }
}
