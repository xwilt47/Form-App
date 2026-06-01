import * as fs from "fs";
import * as path from "path";
import { FormConfig } from "./types";

/**
 * ConfigLoader
 * Responsible for reading a form-config JSON file from disk and validating
 * its structure before returning it to the caller.
 */
export class ConfigLoader {
  /**
   * Reads, parses, and validates a form config from the given file path.
   * Throws a descriptive Error if the file is missing or the config is invalid.
   * @param filePath  Absolute or relative path to the JSON config file.
   * @returns         A validated FormConfig object.
   */
  static load(filePath: string): FormConfig {
    const absPath = path.resolve(filePath);

    if (!fs.existsSync(absPath)) {
      throw new Error(`Config file not found: ${absPath}`);
    }

    const raw    = fs.readFileSync(absPath, "utf-8");
    const config = JSON.parse(raw) as FormConfig;

    ConfigLoader._validate(config);
    return config;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  /**
   * Validates every field of a FormConfig, throwing on the first violation.
   * @private
   */
  private static _validate(config: FormConfig): void {
    if (!config.formTitle) {
      throw new Error("formTitle is required.");
    }

    if (!Array.isArray(config.pages) || config.pages.length === 0) {
      throw new Error("At least one page is required.");
    }

    config.pages.forEach((page, pi) => {
      if (!page.pageTitle) {
        throw new Error(`Page ${pi + 1}: pageTitle is required.`);
      }

      if (!Array.isArray(page.inputs) || page.inputs.length === 0) {
        throw new Error(`Page "${page.pageTitle}": at least one input is required.`);
      }

      page.inputs.forEach((input, ii) => {
        if (!input.name) {
          throw new Error(
            `Page "${page.pageTitle}", input ${ii + 1}: name is required.`
          );
        }
        if (!input.type) {
          throw new Error(
            `Page "${page.pageTitle}", input "${input.name}": type is required.`
          );
        }
        if (input.limit == null || input.limit <= 0) {
          throw new Error(
            `Page "${page.pageTitle}", input "${input.name}": limit must be a positive number.`
          );
        }
      });
    });
  }
}

