/**
 * models/ConfigModel.js
 * ─────────────────────
 * Single source of truth for the form configuration.
 * All state mutations go through this class; it never touches the DOM.
 */
class ConfigModel {
  constructor() {
    /** @type {object} Live configuration object. */
    this._config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    /** @type {string} Currently active preset name. */
    this._activePreset = 'default';
  }

  // ── Accessors ──────────────────────────────────────────────────────────────

  /** Returns a deep clone of the current configuration. */
  getConfig() {
    return JSON.parse(JSON.stringify(this._config));
  }

  /** Returns the raw (mutable) reference — use carefully for bulk updates. */
  getRaw() {
    return this._config;
  }

  /** @returns {string} */
  getActivePreset() {
    return this._activePreset;
  }

  // ── Bulk Load ──────────────────────────────────────────────────────────────

  /**
   * Replaces the entire configuration (e.g. when loading a JSON file).
   * @param {object} cfg
   */
  loadConfig(cfg) {
    this._config       = JSON.parse(JSON.stringify(cfg));
    this._activePreset = cfg.style?.preset || 'default';
  }

  // ── General Fields ─────────────────────────────────────────────────────────

  /** @param {string} val */
  setFormTitle(val) { this._config.formTitle = val; }

  /** @param {string} val */
  setTransition(val) { this._config.transition = val; }

  /** @param {string} val */
  setTransitionDuration(val) { this._config.transitionDuration = val; }

  /** @param {string} val */
  setTransitionDelay(val) { this._config.transitionDelay = val; }

  // ── Style ──────────────────────────────────────────────────────────────────

  /**
   * Applies a named preset, merging its tokens into style.
   * @param {string} name
   */
  applyPreset(name) {
    if (!PRESETS[name]) return;
    this._activePreset          = name;
    this._config.style          = { preset: name, ...PRESETS[name] };
  }

  /**
   * Merges a partial style object into the current style.
   * @param {object} styleObj
   */
  setStyle(styleObj) {
    this._config.style = { ...this._config.style, ...styleObj, preset: this._activePreset };
  }

  // ── Pages ──────────────────────────────────────────────────────────────────

  /** Appends a blank page. */
  addPage() {
    this._config.pages.push({
      pageTitle : `Page ${this._config.pages.length + 1}`,
      inputs    : [{ name: 'Field 1', label: '', type: 'text', limit: 100, placeholder: '', required: false }],
    });
  }

  /**
   * Removes a page (minimum 1 enforced — returns false if blocked).
   * @param {number} pi
   * @returns {boolean}
   */
  removePage(pi) {
    if (this._config.pages.length <= 1) return false;
    this._config.pages.splice(pi, 1);
    return true;
  }

  /**
   * Updates a page-level field.
   * @param {number} pi
   * @param {string} field
   * @param {*}      val
   */
  setPageField(pi, field, val) {
    if (this._config.pages[pi]) this._config.pages[pi][field] = val;
  }

  // ── Inputs ─────────────────────────────────────────────────────────────────

  /**
   * Appends a blank input to the given page.
   * @param {number} pi
   */
  addInput(pi) {
    this._config.pages[pi].inputs.push({ name: '', label: '', type: 'text', limit: 100, placeholder: '', required: false });
  }

  /**
   * Removes an input (minimum 1 per page enforced — returns false if blocked).
   * @param {number} pi
   * @param {number} ii
   * @returns {boolean}
   */
  removeInput(pi, ii) {
    if (this._config.pages[pi].inputs.length <= 1) return false;
    this._config.pages[pi].inputs.splice(ii, 1);
    return true;
  }

  /**
   * Updates a single field on an input.
   * @param {number} pi
   * @param {number} ii
   * @param {string} field
   * @param {*}      val
   */
  setInputField(pi, ii, field, val) {
    const inp = this._config.pages[pi]?.inputs[ii];
    if (inp) inp[field] = val;
  }

  /**
   * Toggles the `required` flag on an input.
   * @param {number} pi
   * @param {number} ii
   * @returns {boolean} New required value.
   */
  toggleRequired(pi, ii) {
    const inp = this._config.pages[pi]?.inputs[ii];
    if (!inp) return false;
    inp.required = !inp.required;
    return inp.required;
  }
}

