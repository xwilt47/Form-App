import { ConfigLoader } from "../ConfigLoader";
import { FormConfig, PageConfig, TransitionType } from "../types";

/**
 * FormConfigModel
 * ─────────────────────────────────────────────────────────────────────────────
 * Owns the loaded form configuration.
 * All read access to config data goes through this model — nothing else reads
 * the raw object directly.
 */
export class FormConfigModel {
  private _config: FormConfig;

  /**
   * Load and validate the config from disk, then store it in the model.
   * @param filePath  Absolute path to form-config.json
   */
  constructor(filePath: string) {
    this._config = ConfigLoader.load(filePath);
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get formTitle(): string {
    return this._config.formTitle;
  }

  get pages(): PageConfig[] {
    return this._config.pages;
  }

  get pageCount(): number {
    return this._config.pages.length;
  }

  get transition(): TransitionType {
    return this._config.transition ?? "slide";
  }

  get transitionDuration(): string {
    return this._config.transitionDuration ?? "0.4s";
  }

  get transitionDelay(): string {
    return this._config.transitionDelay ?? "0s";
  }

  /** Returns a shallow copy of the full config object. */
  toConfig(): FormConfig {
    return { ...this._config };
  }
}

