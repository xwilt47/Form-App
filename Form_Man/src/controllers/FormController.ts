import * as fs   from "fs";
import * as path from "path";
import { FormConfigModel } from "../models/FormConfigModel";
import { FormView }        from "../views/FormView";

/**
 * FormController
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates the full generation pipeline:
 *   1. Load & validate the config  (Model)
 *   2. Render the HTML document    (View)
 *   3. Write the output to disk    (I/O — controller responsibility)
 *
 * Dependencies are injected so the controller is unit-testable without touching
 * the file system.
 */
export class FormController {
  private _configPath: string;
  private _outputPath: string;
  private _view: FormView;

  /**
   * @param configPath  Absolute path to form-config.json
   * @param outputPath  Absolute path where form.html should be written
   * @param view        FormView instance (defaults to new FormView())
   */
  constructor(
    configPath: string,
    outputPath: string,
    view = new FormView(),
  ) {
    this._configPath = configPath;
    this._outputPath = outputPath;
    this._view       = view;
  }

  /**
   * Runs the full pipeline: load → render → write.
   * Logs progress to stdout.
   */
  run(): void {
    // ── 1. Load ──────────────────────────────────────────────────────────────
    console.log("📖 Loading form config...");
    const model = new FormConfigModel(this._configPath);

    console.log(`✅ Config loaded: "${model.formTitle}"`);
    console.log(`   Pages   : ${model.pageCount}`);
    model.pages.forEach((p, i) => {
      console.log(`   Page ${i + 1} : "${p.pageTitle}" — ${p.inputs.length} input(s)`);
    });

    // ── 2. Render ─────────────────────────────────────────────────────────────
    console.log("\n⚙️  Generating HTML...");
    const html = this._view.render(model.toConfig());

    // ── 3. Write ──────────────────────────────────────────────────────────────
    const outDir = path.dirname(this._outputPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(this._outputPath, html, "utf-8");
    console.log(`\n✨ Form generated → ${this._outputPath}`);
  }
}

