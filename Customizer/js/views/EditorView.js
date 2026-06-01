/**
 * views/EditorView.js
 * ────────────────────
 * Owns every DOM read / write that belongs to the left-hand editor panel.
 * It never holds application state — it only renders what it is given and
 * fires callbacks supplied by the controller.
 */
class EditorView {
  /**
   * @param {object} handlers  - Callback map provided by AppController.
   *   {
   *     onSyncAll        : () => void,
   *     onColorPickerChange : (picker) => void,
   *     onTextColorChange   : (textEl) => void,
   *     onAddPage        : () => void,
   *     onRemovePage     : (pi) => void,
   *     onAddInput       : (pi) => void,
   *     onRemoveInput    : (pi, ii) => void,
   *     onToggleRequired : (pi, ii, btn) => void,
   *     onTogglePage     : (pi) => void,
   *     onUpdatePageTitle: (pi, val) => void,
   *     onInputFieldChange: (pi, ii, field, val) => void,
   *     onApplyPreset    : (name) => void,
   *     onSwitchEditorTab: (name) => void,
   *   }
   */
  constructor(handlers) {
    this._h = handlers;
  }

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  /** Attaches persistent (non-generated) event listeners. */
  bindStaticEvents() {
    // Vertical tab nav
    document.querySelectorAll('.editor-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => this._h.onSwitchEditorTab(btn.dataset.tab));
    });
  }

  // ── Tab Switching ──────────────────────────────────────────────────────────

  /**
   * Activates a left-panel editor tab.
   * @param {string} name  'general' | 'style' | 'pages'
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

  /**
   * Activates an output-panel tab (preview / json).
   * @param {string}      tab
   * @param {HTMLElement} btn
   */
  switchOutputTab(tab, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tab).classList.add('active');
  }

  // ── Toast ──────────────────────────────────────────────────────────────────

  /**
   * Displays a brief toast notification.
   * @param {string}  msg
   * @param {boolean} [isError=false]
   */
  showToast(msg, isError = false) {
    const t             = document.getElementById('toast');
    t.textContent       = msg;
    t.style.background  = isError ? '#2d1515' : '#1e2d1e';
    t.style.borderColor = isError ? '#ef4444' : '#22c55e';
    t.style.color       = isError ? '#ef4444' : '#22c55e';
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
  }

  // ── Config → UI ────────────────────────────────────────────────────────────

  /**
   * Populates every editor control from a config object.
   * @param {object} cfg
   * @param {string} activePreset
   */
  loadConfigIntoUI(cfg, activePreset) {
    this._setVal('formTitle',           cfg.formTitle           || '');
    this._setVal('transition',          cfg.transition          || 'slide');
    this._setVal('transitionDuration',  cfg.transitionDuration  || '0.4s');
    this._setVal('transitionDelay',     cfg.transitionDelay     || '0s');
    this.loadStyleIntoUI(cfg.style || {}, activePreset);
    this.buildPresetGrid(activePreset);
    this.renderPages(cfg.pages || []);
  }

  /**
   * Loads style tokens into the colour-picker / text-input pairs and the
   * plain text fields (radius, font, shadow, speed).
   * @param {object} style
   * @param {string} activePreset
   */
  loadStyleIntoUI(style, activePreset) {
    const preset = PRESETS[activePreset] || PRESETS.default;

    const colorFields = ['accentColor','accentHover','bgColor','cardColor',
                         'headingColor','labelColor','inputBorder','inputBg','inputColor'];
    colorFields.forEach(k => {
      const val    = style[k] || preset[k] || '#000000';
      const picker = document.getElementById('s-' + k);
      const text   = document.getElementById('s-' + k + '-t');
      if (picker) picker.value = ColorUtils.normalizeHex(val);
      if (text)   text.value   = val;
    });

    const textFields = ['cardRadius','fontFamily','cardShadow','animationSpeed'];
    textFields.forEach(k => {
      const el = document.getElementById('s-' + k);
      if (el) el.value = style[k] || preset[k] || '';
    });
  }

  // ── UI → Config ────────────────────────────────────────────────────────────

  /**
   * Reads the current UI state and returns a plain config object.
   * Pages are not read from the UI — they come from the model and are passed in.
   * @param {Array}  pages         - Live pages array from ConfigModel.
   * @param {string} activePreset
   * @returns {object}
   */
  readConfigFromUI(pages, activePreset) {
    return {
      formTitle          : this._getVal('formTitle')          || 'My Form',
      transition         : this._getVal('transition')         || 'slide',
      transitionDuration : this._getVal('transitionDuration') || '0.4s',
      transitionDelay    : this._getVal('transitionDelay')    || '0s',
      style              : this.readStyleFromUI(activePreset),
      pages,
    };
  }

  /**
   * Reads style tokens from the UI.
   * @param {string} activePreset
   * @returns {object}
   */
  readStyleFromUI(activePreset) {
    const s = { preset: activePreset };

    ['accentColor','accentHover','bgColor','cardColor','headingColor',
     'labelColor','inputBorder','inputBg','inputColor'].forEach(k => {
      const el = document.getElementById('s-' + k + '-t');
      if (el && el.value) s[k] = el.value.trim();
    });

    ['cardRadius','fontFamily','cardShadow','animationSpeed'].forEach(k => {
      const el = document.getElementById('s-' + k);
      if (el && el.value) s[k] = el.value.trim();
    });

    return s;
  }

  // ── Colour Picker Helpers ──────────────────────────────────────────────────

  /**
   * Syncs a colour-picker value to its sibling text input.
   * @param {HTMLInputElement} picker
   */
  colorPickerToText(picker) {
    const textEl = document.getElementById(picker.id + '-t');
    if (textEl) textEl.value = picker.value;
    this._h.onSyncAll();
  }

  /**
   * Syncs a text input value back to its sibling colour picker.
   * @param {HTMLInputElement} textEl
   */
  textToColorPicker(textEl) {
    const picker     = document.getElementById(textEl.id.replace('-t', ''));
    const normalized = ColorUtils.normalizeHex(textEl.value);
    if (picker && normalized) picker.value = normalized;
    this._h.onSyncAll();
  }

  // ── Preset Grid ────────────────────────────────────────────────────────────

  /**
   * Rebuilds the preset-selection grid.
   * @param {string} activePreset
   */
  buildPresetGrid(activePreset) {
    const grid = document.getElementById('preset-grid');
    if (!grid) return;
    grid.innerHTML = '';

    Object.keys(PRESETS).forEach(name => {
      const sw  = PRESET_SWATCHES[name];
      const btn = document.createElement('div');
      btn.className      = 'preset-btn' + (name === activePreset ? ' active' : '');
      btn.dataset.preset = name;
      btn.innerHTML = `
        <div class="preset-swatch"
             style="background:linear-gradient(135deg,${sw.bg} 50%,${sw.card} 50%)"></div>
        <span>${name}</span>`;
      btn.addEventListener('click', () => this._h.onApplyPreset(name));
      grid.appendChild(btn);
    });
  }

  // ── Pages Rendering ────────────────────────────────────────────────────────

  /**
   * Fully re-renders the pages list.
   * @param {Array} pages
   */
  renderPages(pages) {
    const list = document.getElementById('pages-list');
    if (!list) return;
    list.innerHTML = '';
    pages.forEach((page, pi) => list.appendChild(this._buildPageCard(page, pi, pages.length)));
  }

  /**
   * Updates only the visible title in a page-card header (avoids full re-render).
   * @param {number} pi
   * @param {string} val
   */
  updatePageTitleDisplay(pi, val) {
    const el = document.querySelector(`[data-pi="${pi}"] .page-card-title`);
    if (el) el.textContent = val || 'Untitled Page';
  }

  /**
   * Collapses / expands a page card.
   * @param {number} pi
   */
  togglePage(pi) {
    const cards = document.querySelectorAll('.page-card');
    if (cards[pi]) cards[pi].classList.toggle('open');
  }

  // ── Private Rendering Helpers ──────────────────────────────────────────────

  /**
   * @private
   * @param {object} page
   * @param {number} pi
   * @returns {HTMLElement}
   */
  _buildPageCard(page, pi) {
    const card      = document.createElement('div');
    card.className  = 'page-card open';
    card.dataset.pi = pi;

    const inputsHTML = page.inputs.map((inp, ii) => this._buildInputRow(inp, pi, ii)).join('');

    card.innerHTML = `
      <div class="page-card-header">
        <span class="page-badge">P${pi + 1}</span>
        <span class="page-card-title">${ColorUtils.escHtml(page.pageTitle || 'Untitled Page')}</span>
        <button class="remove-btn page-remove-btn" data-pi="${pi}" title="Delete page">×</button>
        <span class="page-chevron">▼</span>
      </div>
      <div class="page-card-body">
        <div class="field">
          <label>Page Title</label>
          <input type="text"
                 class="page-title-input"
                 data-pi="${pi}"
                 value="${ColorUtils.escHtml(page.pageTitle || '')}" />
        </div>
        <div>
          <div class="input-row-labels" style="margin-bottom:0.25rem;">
            <span>Name</span><span>Type</span><span>Limit</span><span>Req</span><span></span>
          </div>
          <div class="inputs-list" id="inputs-list-${pi}">${inputsHTML}</div>
          <button class="add-btn add-input-btn" data-pi="${pi}" style="margin-top:0.5rem;">
            ＋ Add Input
          </button>
        </div>
      </div>`;

    // ── Bind card-level events ──
    card.querySelector('.page-card-header').addEventListener('click', e => {
      if (e.target.closest('.page-remove-btn')) return; // don't toggle when clicking ×
      this._h.onTogglePage(pi);
    });

    card.querySelector('.page-remove-btn').addEventListener('click', e => {
      e.stopPropagation();
      this._h.onRemovePage(pi);
    });

    card.querySelector('.page-title-input').addEventListener('input', e => {
      this._h.onUpdatePageTitle(pi, e.target.value);
    });

    card.querySelector('.add-input-btn').addEventListener('click', () => {
      this._h.onAddInput(pi);
    });

    // Bind input-row events
    this._bindInputRowEvents(card, page, pi);

    return card;
  }

  /**
   * @private
   */
  _buildInputRow(inp, pi, ii) {
    const typeOpts = INPUT_TYPES
      .map(t => `<option value="${t}"${inp.type === t ? ' selected' : ''}>${t}</option>`)
      .join('');

    return `
      <div class="input-row" id="input-${pi}-${ii}">
        <div class="input-row-top">
          <input  type="text"   class="irow-name"  data-pi="${pi}" data-ii="${ii}"
                  value="${ColorUtils.escHtml(inp.name || '')}" placeholder="Label" />
          <select class="irow-type"  data-pi="${pi}" data-ii="${ii}">${typeOpts}</select>
          <input  type="number" class="irow-limit" data-pi="${pi}" data-ii="${ii}"
                  value="${inp.limit || 100}" min="1" />
          <button class="req-toggle ${inp.required ? 'on' : ''}" data-pi="${pi}" data-ii="${ii}"
                  title="Toggle required">${inp.required ? '✓' : '–'}</button>
          <button class="remove-btn irow-remove" data-pi="${pi}" data-ii="${ii}">×</button>
        </div>
        <div class="input-row-bottom">
          <span class="irow-ph-label">Label</span>
          <input  type="text"   class="irow-label" data-pi="${pi}" data-ii="${ii}"
                  value="${ColorUtils.escHtml(inp.label || '')}"
                  placeholder="Display text above the field (defaults to Name)…" />
        </div>
        <div class="input-row-bottom">
          <span class="irow-ph-label">Placeholder</span>
          <input  type="text"   class="irow-placeholder" data-pi="${pi}" data-ii="${ii}"
                  value="${ColorUtils.escHtml(inp.placeholder || '')}"
                  placeholder="Hint text shown inside the field…" />
        </div>
      </div>`;
  }

  /**
   * Attaches delegated events for all input rows inside a page card.
   * @private
   */
  _bindInputRowEvents(card, page, pi) {
    const list = card.querySelector('.inputs-list');
    if (!list) return;

    list.addEventListener('input', e => {
      const t  = e.target;
      const p  = parseInt(t.dataset.pi);
      const ii = parseInt(t.dataset.ii);
      if (isNaN(p) || isNaN(ii)) return;

      if (t.classList.contains('irow-name'))        this._h.onInputFieldChange(p, ii, 'name',        t.value);
      if (t.classList.contains('irow-label'))       this._h.onInputFieldChange(p, ii, 'label',       t.value);
      if (t.classList.contains('irow-limit'))       this._h.onInputFieldChange(p, ii, 'limit',       parseInt(t.value) || 1);
      if (t.classList.contains('irow-placeholder')) this._h.onInputFieldChange(p, ii, 'placeholder', t.value);
    });

    list.addEventListener('change', e => {
      const t  = e.target;
      const p  = parseInt(t.dataset.pi);
      const ii = parseInt(t.dataset.ii);
      if (isNaN(p) || isNaN(ii)) return;
      if (t.classList.contains('irow-type')) this._h.onInputFieldChange(p, ii, 'type', t.value);
    });

    list.addEventListener('click', e => {
      const t  = e.target.closest('[data-pi][data-ii]');
      if (!t) return;
      const p  = parseInt(t.dataset.pi);
      const ii = parseInt(t.dataset.ii);
      if (isNaN(p) || isNaN(ii)) return;

      if (t.classList.contains('req-toggle')) this._h.onToggleRequired(p, ii, t);
      if (t.classList.contains('irow-remove')) this._h.onRemoveInput(p, ii);
    });
  }

  // ── Utility ────────────────────────────────────────────────────────────────

  /** @private */
  _setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  /** @private */
  _getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }
}

