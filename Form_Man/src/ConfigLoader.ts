import * as fs from "fs";
import * as path from "path";
import { FormConfig } from "./types";
import { ConfigValidator } from "./validators/ConfigValidator";

/**
 * ConfigLoader
 * ─────────────────────────────────────────────────────────────────────────────
 * Single responsibility: read a form-config JSON file from disk and return a
 * validated FormConfig object.
 *
 * Validation is delegated to ConfigValidator — this class only handles I/O.
 *
 * Usage (instance):
 *   const config = new ConfigLoader().load("/path/to/form-config.json");
 *
 * Usage (static shorthand — backward compatible):
 *   const config = ConfigLoader.load("/path/to/form-config.json");
 */
export class ConfigLoader {
  private _validator: ConfigValidator;

  constructor(validator = new ConfigValidator()) {
    this._validator = validator;
  }

  // ── Instance API ──────────────────────────────────────────────────────────

  /**
   * Reads, parses, and validates a form config from the given file path.
   * Throws a descriptive Error if the file is missing or the config is invalid.
   * @param filePath  Absolute or relative path to the JSON config file.
   * @returns         A validated FormConfig object.
   */
  load(filePath: string): FormConfig {
    const absPath = path.resolve(filePath);

    if (!fs.existsSync(absPath)) {
      throw new Error(`Config file not found: ${absPath}`);
    }

    const raw = fs.readFileSync(absPath, "utf-8");
    const config = JSON.parse(raw) as FormConfig;

    this._validator.validate(config);
    return config;
  }

  // ── Static shorthand (backward-compatible) ────────────────────────────────

  /**
   * Convenience wrapper — creates a temporary ConfigLoader and calls load().
   * Keeps all existing callers working without changes.
   * @param filePath  Absolute or relative path to the JSON config file.
   */
  static load(filePath: string): FormConfig {
    return new ConfigLoader().load(filePath);
  }
}
