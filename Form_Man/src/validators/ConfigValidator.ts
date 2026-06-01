import { FormConfig } from "../types";

/**
 * ConfigValidator
 * ─────────────────────────────────────────────────────────────────────────────
 * Single responsibility: validate the shape and contents of a FormConfig
 * object.  Throws a descriptive Error on the first violation found.
 *
 * Kept separate from ConfigLoader so validation logic can be reused
 * (e.g. in the Customizer or unit tests) without touching the file system.
 */
export class ConfigValidator {
  /**
   * Validates the complete FormConfig tree.
   * Throws an Error with a human-readable message on the first violation.
   * @param config  The parsed FormConfig to validate.
   */
  validate(config: FormConfig): void {
    this._validateRoot(config);
    config.pages.forEach((page, pi) => {
      this._validatePage(page, pi);
    });
  }

  // ── Private ───────────────────────────────────────────────────────────────

  /** Validates the root-level fields of FormConfig. */
  private _validateRoot(config: FormConfig): void {
    if (!config.formTitle?.trim()) {
      throw new Error("formTitle is required and must not be empty.");
    }
    if (!Array.isArray(config.pages) || config.pages.length === 0) {
      throw new Error("At least one page is required.");
    }
  }

  /** Validates a single PageConfig and all of its inputs. */
  private _validatePage(page: FormConfig["pages"][number], pageIndex: number): void {
    const pageLabel = `Page ${pageIndex + 1}`;

    if (!page.pageTitle?.trim()) {
      throw new Error(`${pageLabel}: pageTitle is required and must not be empty.`);
    }
    if (!Array.isArray(page.inputs) || page.inputs.length === 0) {
      throw new Error(`${pageLabel} ("${page.pageTitle}"): at least one input is required.`);
    }

    page.inputs.forEach((input, ii) => {
      this._validateInput(input, pageLabel, ii);
    });
  }

  /** Validates a single InputConfig. */
  private _validateInput(
    input: FormConfig["pages"][number]["inputs"][number],
    pageLabel: string,
    inputIndex: number,
  ): void {
    const inputLabel = `${pageLabel}, input ${inputIndex + 1}`;

    if (!input.name?.trim()) {
      throw new Error(`${inputLabel}: name is required and must not be empty.`);
    }
    if (!input.type) {
      throw new Error(`${inputLabel} ("${input.name}"): type is required.`);
    }
    if (input.limit == null || input.limit <= 0) {
      throw new Error(`${inputLabel} ("${input.name}"): limit must be a positive number.`);
    }
  }
}

