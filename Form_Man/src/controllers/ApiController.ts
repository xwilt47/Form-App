import * as fs   from "fs";
import * as path from "path";
import { FormConfigModel }   from "../models/FormConfigModel";
import { PythonApiBuilder }  from "../views/PythonApiBuilder";

/**
 * ApiController
 * ─────────────────────────────────────────────────────────────────────────────
 * Orchestrates the Python API generation pipeline:
 *   1. Load & validate the config  (Model)
 *   2. Build the Python source     (PythonApiBuilder)
 *   3. Write api.py to disk        (I/O)
 *
 * Follows the same pattern as FormController so both controllers are
 * interchangeable and independently testable.
 */
export class ApiController {
  private _configPath: string;
  private _outputPath: string;
  private _builder: PythonApiBuilder;

  /**
   * @param configPath  Absolute path to form-config.json
   * @param outputPath  Absolute path where api.py should be written
   * @param builder     PythonApiBuilder instance (defaults to new PythonApiBuilder())
   */
  constructor(
    configPath: string,
    outputPath: string,
    builder = new PythonApiBuilder(),
  ) {
    this._configPath = configPath;
    this._outputPath = outputPath;
    this._builder    = builder;
  }

  /**
   * Runs the full pipeline: load → build → write.
   * Logs progress to stdout.
   */
  run(): void {
    // ── 1. Load ──────────────────────────────────────────────────────────────
    const model = new FormConfigModel(this._configPath);

    // ── 2. Build ─────────────────────────────────────────────────────────────
    console.log("🐍 Generating Python API...");
    const source = this._builder.build(model.toConfig());

    // ── 3. Write ──────────────────────────────────────────────────────────────
    const outDir = path.dirname(this._outputPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    fs.writeFileSync(this._outputPath, source, "utf-8");
    console.log(`🐍 Python API generated → ${this._outputPath}`);
    console.log(`   Install : pip install fastapi "uvicorn[standard]" pydantic[email]`);
    console.log(`   Run     : python api.py`);
    console.log(`   Docs    : http://localhost:8000/docs`);
  }
}

