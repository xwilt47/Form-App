/**
 * FormCustomizerApp.js
 * Main application class. Owns all state and orchestrates the UI.
 */

class FormCustomizerApp {
  constructor() {
    /** @type {object} The current working form configuration. */
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    /** @type {string} Name of the currently active preset. */
    this.activePreset = 'default';

    /** @type {FormGenerator} */
    this._generator = new FormGenerator();

    /** @type {number|null} Debounce timer id for syncAll. */
    this._syncTimer = null;

    /** @type {number|null} Debounce timer id for toast. */
    this._toastTimer = null;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /** Bootstrap the application once the DOM is ready. */
  init() {
    document.querySelectorAll('.editor-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchEditorTab(btn.dataset.tab));
    });

    this._buildPresetGrid();
    this._loadConfigIntoUI(this.config);

    document.getElementById('upload-input').addEventListener('change', e => this._onFileUpload(e));

    fetch('../Frontend/src/config/form-config.json')
      .then(r => r.json())
      .then(cfg => {
        this.config = cfg;
        this._loadConfigIntoUI(this.config);
        this.showToast('✅ Loaded form-config.json');
      })
      .catch(() => this._loadConfigIntoUI(this.config));
  }

  // ── Preset Management ──────────────────────────────────────────────────────

  /** Applies a named preset to the current config and refreshes the UI. */
  applyPreset(name) {
    this.activePreset = name;
    Object.assign(this.config.style, { preset: name, ...PRESETS[name] });
    this._loadStyleIntoUI(this.config.style);
    this._buildPresetGrid();
    this.syncAll();
  }

  // ── Page / Input Mutations ─────────────────────────────────────────────────

  /** Appends a new blank page to the config. */
  addPage() {
    this.config.pages.push({
      pageTitle: `Page ${this.config.pages.length + 1}`,
      inputs: [{ name: 'Field 1', type: 'text', limit: 100, required: false }],
    });
    this._renderPages();
    this.syncAll();
  }

  /**
   * Removes the page at the given index (minimum 1 page enforced).
   * @param {number} pi
   */
  removePage(pi) {
    if (this.config.pages.length === 1) {
      this.showToast('⚠️ At least one page is required', true);
      return;
    }
    this.config.pages.splice(pi, 1);
    this._renderPages();
    this.syncAll();
  }

  /**
   * Appends a blank input field to the page at index pi.
   * @param {number} pi
   */
  addInput(pi) {
    this.config.pages[pi].inputs.push({ name: '', type: 'text', limit: 100, required: false });
    this._renderPages();
    this.syncAll();
  }

  /**
   * Removes the input at index ii on page pi (minimum 1 input enforced).
   * @param {number} pi
   * @param {number} ii
   */
  removeInput(pi, ii) {
    if (this.config.pages[pi].inputs.length === 1) {
      this.showToast('⚠️ At least one input per page', true);
      return;
    }
    this.config.pages[pi].inputs.splice(ii, 1);
    this._renderPages();
    this.syncAll();
  }

  /**
   * Toggles the required flag on an input and updates the trigger button.
   * @param {number} pi
   * @param {number} ii
   * @param {HTMLElement} btn
   */
  toggleRequired(pi, ii, btn) {
    const current = this.config.pages[pi].inputs[ii].required;
    this.config.pages[pi].inputs[ii].required = !current;
    btn.classList.toggle('on', !current);
    btn.textContent = !current ? '✓' : '–';
    this.syncAll();
  }

  /**
   * Collapses / expands a page card.
   * @param {number} pi
   */
  togglePage(pi) {
    const cards = document.querySelectorAll('.page-card');
    if (cards[pi]) cards[pi].classList.toggle('open');
  }

  // ── UI Tab Switching ───────────────────────────────────────────────────────

  /**
   * Switches the output panel tab (preview / JSON).
   * @param {string} tab
   * @param {HTMLElement} btn
   */
  switchTab(tab, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
  }

  /**
   * Switches the left-panel editor tab (general / style / pages / json).
   * @param {string} name
   */
  switchEditorTab(name) {
    document.querySelectorAll('.editor-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.editor-tab').forEach(t => t.classList.remove('active'));

    const btn = document.querySelector(`.editor-nav-btn[data-tab="${name}"]`);
    const tab = document.getElementById('etab-' + name);
    if (btn) btn.classList.add('active');
    if (tab) tab.classList.add('active');

    document.getElementById('editor-content').scrollTop = 0;
  }

  // ── Colour Picker Sync ─────────────────────────────────────────────────────

  /**
   * Propagates a colour picker's value to its paired text input.
   * @param {HTMLInputElement} picker
   */
  colorPickerToText(picker) {
    const textEl = document.getElementById(picker.id + '-t');
    if (textEl) textEl.value = picker.value;
    this.syncAll();
  }

  /**
   * Propagates a text input's value back to its paired colour picker.
   * @param {HTMLInputElement} textEl
   */
  textToColorPicker(textEl) {
    const picker     = document.getElementById(textEl.id.replace('-t', ''));
    const normalized = ColorUtils.normalizeHex(textEl.value);
    if (picker && normalized) picker.value = normalized;
    this.syncAll();
  }

  // ── File I/O ───────────────────────────────────────────────────────────────

  /** Triggers a JSON config download. */
  downloadJSON() {
    const cfg  = this._readConfigFromUI();
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'form-config.json';
    a.click();
    this.showToast('✅ Downloaded form-config.json');
  }

  /** Copies the JSON output to the clipboard. */
  copyJSON() {
    const txt = document.getElementById('json-output').value;
    navigator.clipboard.writeText(txt).then(() => this.showToast('✅ Copied to clipboard!'));
  }

  // ── Preview ────────────────────────────────────────────────────────────────

  /** Forces an immediate preview refresh (used by the Refresh button). */
  refreshPreview() {
    this._refreshPreview();
  }

  // ── Toast ──────────────────────────────────────────────────────────────────

  /**
   * Displays a brief toast notification.
   * @param {string}  msg
   * @param {boolean} [isError=false]
   */
  showToast(msg, isError = false) {
    const t         = document.getElementById('toast');
    t.textContent   = msg;
    t.style.background  = isError ? '#2d1515' : '#1e2d1e';
    t.style.borderColor = isError ? '#ef4444' : '#22c55e';
    t.style.color       = isError ? '#ef4444' : '#22c55e';
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
  }

  // ── Sync ───────────────────────────────────────────────────────────────────

  /** Debounced sync: reads the current UI state and updates JSON output + preview. */
  syncAll() {
    clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => {
      const cfg = this._readConfigFromUI();
      this._updateJSONOutput(cfg);
      this._refreshPreview(cfg);
    }, 120);
  }

  // ── Private: UI → Config ───────────────────────────────────────────────────

  /** @private */
  _readStyleFromUI() {
    const s = { preset: this.activePreset };

    ['accentColor', 'accentHover', 'bgColor', 'cardColor', 'headingColor', 'labelColor', 'inputBorder', 'inputBg', 'inputColor'].forEach(k => {
      const el = document.getElementById('s-' + k + '-t');
      if (el && el.value) s[k] = el.value.trim();
    });

    ['cardRadius', 'fontFamily', 'cardShadow', 'animationSpeed'].forEach(k => {
      const el = document.getElementById('s-' + k);
      if (el && el.value) s[k] = el.value.trim();
    });

    return s;
  }

  /** @private */
  _readConfigFromUI() {
    return {
      formTitle          : document.getElementById('formTitle').value || 'My Form',
      transition         : document.getElementById('transition')?.value         || 'slide',
      transitionDuration : document.getElementById('transitionDuration')?.value || '0.4s',
      transitionDelay    : document.getElementById('transitionDelay')?.value    || '0s',
      style              : this._readStyleFromUI(),
      pages              : this.config.pages,
    };
  }

  // ── Private: Config → UI ───────────────────────────────────────────────────

  /** @private */
  _loadConfigIntoUI(cfg) {
    document.getElementById('formTitle').value = cfg.formTitle || '';
    const transEl = document.getElementById('transition');
    if (transEl) transEl.value = cfg.transition || 'slide';
    const durEl = document.getElementById('transitionDuration');
    if (durEl) durEl.value = cfg.transitionDuration || '0.4s';
    const delEl = document.getElementById('transitionDelay');
    if (delEl) delEl.value = cfg.transitionDelay || '0s';
    this.activePreset = cfg.style?.preset || 'default';
    this._loadStyleIntoUI(cfg.style || {});
    this._buildPresetGrid();
    this._renderPages();
    this.syncAll();
  }

  /** @private */
  _loadStyleIntoUI(s) {
    const colorFields = ['accentColor', 'accentHover', 'bgColor', 'cardColor', 'headingColor', 'labelColor', 'inputBorder', 'inputBg', 'inputColor'];
    colorFields.forEach(k => {
      const val    = s[k] || PRESETS[this.activePreset][k] || '#000000';
      const picker = document.getElementById('s-' + k);
      const text   = document.getElementById('s-' + k + '-t');
      if (picker) picker.value = ColorUtils.normalizeHex(val);
      if (text)   text.value   = val;
    });

    const textFields = ['cardRadius', 'fontFamily', 'cardShadow', 'animationSpeed'];
    textFields.forEach(k => {
      const el = document.getElementById('s-' + k);
      if (el) el.value = s[k] || PRESETS[this.activePreset][k] || '';
    });
  }

  // ── Private: Rendering ─────────────────────────────────────────────────────

  /** @private */
  _buildPresetGrid() {
    const grid = document.getElementById('preset-grid');
    grid.innerHTML = '';

    Object.keys(PRESETS).forEach(name => {
      const sw  = PRESET_SWATCHES[name];
      const btn = document.createElement('div');
      btn.className        = 'preset-btn' + (name === this.activePreset ? ' active' : '');
      btn.dataset.preset   = name;
      btn.innerHTML = `
        <div class="preset-swatch" style="background: linear-gradient(135deg, ${sw.bg} 50%, ${sw.card} 50%)"></div>
        <span>${name}</span>`;
      btn.onclick = () => this.applyPreset(name);
      grid.appendChild(btn);
    });
  }

  /** @private */
  _renderPages() {
    const list = document.getElementById('pages-list');
    list.innerHTML = '';

    this.config.pages.forEach((page, pi) => {
      const card      = document.createElement('div');
      card.className  = 'page-card open';
      card.dataset.pi = pi;

      const inputsHTML = page.inputs.map((inp, ii) => this._buildInputRow(inp, pi, ii)).join('');

      card.innerHTML = `
        <div class="page-card-header" onclick="app.togglePage(${pi})">
          <span class="page-badge">P${pi + 1}</span>
          <span class="page-card-title">${page.pageTitle || 'Untitled Page'}</span>
          <button class="remove-btn" onclick="event.stopPropagation(); app.removePage(${pi})" title="Delete page">×</button>
          <span class="page-chevron">▼</span>
        </div>
        <div class="page-card-body">
          <div class="field">
            <label>Page Title</label>
            <input type="text" value="${ColorUtils.escHtml(page.pageTitle)}"
              oninput="app.config.pages[${pi}].pageTitle = this.value; app._updatePageTitle(${pi}, this.value); app.syncAll()" />
          </div>
          <div>
            <div class="input-row-labels" style="margin-bottom:0.25rem;">
              <span>Name</span><span>Type</span><span>Limit</span><span>Req</span><span></span>
            </div>
            <div class="inputs-list" id="inputs-list-${pi}">${inputsHTML}</div>
            <button class="add-btn" style="margin-top:0.5rem;" onclick="app.addInput(${pi})">＋ Add Input</button>
          </div>
        </div>`;

      list.appendChild(card);
    });
  }

  /**
   * Builds a single input-row HTML string.
   * @private
   */
  _buildInputRow(inp, pi, ii) {
    const typeOpts = INPUT_TYPES
      .map(t => `<option value="${t}" ${inp.type === t ? 'selected' : ''}>${t}</option>`)
      .join('');

    return `
      <div class="input-row" id="input-${pi}-${ii}">
        <input type="text" value="${ColorUtils.escHtml(inp.name || '')}" placeholder="Field name"
          oninput="app.config.pages[${pi}].inputs[${ii}].name = this.value; app.syncAll()" />
        <select onchange="app.config.pages[${pi}].inputs[${ii}].type = this.value; app.syncAll()">${typeOpts}</select>
        <input type="number" value="${inp.limit || 100}" min="1"
          oninput="app.config.pages[${pi}].inputs[${ii}].limit = parseInt(this.value)||1; app.syncAll()" />
        <button class="req-toggle ${inp.required ? 'on' : ''}" title="Toggle required"
          onclick="app.toggleRequired(${pi}, ${ii}, this)">${inp.required ? '✓' : '–'}</button>
        <button class="remove-btn" onclick="app.removeInput(${pi}, ${ii})">×</button>
      </div>`;
  }

  /**
   * Updates the visible page title in an already-rendered page card header.
   * Exposed via _updatePageTitle so inline oninput handlers can call it.
   * @param {number} pi
   * @param {string} val
   */
  _updatePageTitle(pi, val) {
    const titleEl = document.querySelector(`[data-pi="${pi}"] .page-card-title`);
    if (titleEl) titleEl.textContent = val || 'Untitled Page';
  }

  // ── Private: Output ────────────────────────────────────────────────────────

  /** @private */
  _updateJSONOutput(cfg) {
    document.getElementById('json-output').value = JSON.stringify(
      JSON.parse(JSON.stringify(cfg)),
      null,
      2
    );
  }

  /** @private */
  _refreshPreview(cfg) {
    cfg = cfg || this._readConfigFromUI();
    const html  = this._generator.generate(cfg);
    const frame = document.getElementById('preview-frame');
    frame.srcdoc = html;
  }

  // ── Private: File Upload ───────────────────────────────────────────────────

  /** @private */
  _onFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader    = new FileReader();
    reader.onload   = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        this.config  = parsed;
        this._loadConfigIntoUI(this.config);
        this.showToast('✅ Config loaded!');
      } catch {
        this.showToast('❌ Invalid JSON file', true);
      }
    };
    reader.readAsText(file);
  }
}

