/**
 * controllers/AppController.js
 * ─────────────────────────────
 * Orchestrates the Model ↔ View pipeline.
 *
 * Responsibilities:
 *   • Instantiates and wires ConfigModel, EditorView, PreviewView, FormGenerator.
 *   • Responds to all user-initiated events (via EditorView callbacks).
 *   • Runs the debounced sync loop that keeps JSON output + preview up-to-date.
 *   • Handles file I/O (upload & download).
 */
class AppController {
  constructor() {
    // ── Model ──
    this._model = new ConfigModel();

    // ── Views ──
    this._editorView  = new EditorView(this._buildHandlers());
    this._previewView = new PreviewView();

    // ── Services ──
    this._generator = new FormGenerator();

    // ── Debounce timers ──
    this._syncTimer  = null;
    this._toastTimer = null;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  /** Bootstrap the application once the DOM is ready. */
  init() {
    this._editorView.bindStaticEvents();
    this._editorView.buildPresetGrid(this._model.getActivePreset());
    this._editorView.loadConfigIntoUI(this._model.getConfig(), this._model.getActivePreset());

    // File-upload listener
    const uploadInput = document.getElementById('upload-input');
    if (uploadInput) {
      uploadInput.addEventListener('change', e => this._onFileUpload(e));
    }

    // Add-page button
    const addPageBtn = document.getElementById('add-page-btn');
    if (addPageBtn) {
      addPageBtn.addEventListener('click', () => this.addPage());
    }

    // Load from shared config file
    fetch('../Frontend/src/config/form-config.json')
      .then(r => r.json())
      .then(cfg => {
        this._model.loadConfig(cfg);
        this._editorView.loadConfigIntoUI(this._model.getConfig(), this._model.getActivePreset());
        this._editorView.showToast('✅ Loaded form-config.json');
        this._sync();
      })
      .catch(() => this._sync());
  }

  // ── Public API (called by app.js shims) ────────────────────────────────────

  /** Forces an immediate preview refresh. */
  refreshPreview() { this._sync(); }

  /** Triggers a JSON config download. */
  downloadJSON() {
    const cfg  = this._buildConfig();
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
    const a    = Object.assign(document.createElement('a'), {
      href     : URL.createObjectURL(blob),
      download : 'form-config.json',
    });
    a.click();
    this._editorView.showToast('✅ Downloaded form-config.json');
  }

  /** Copies JSON output to clipboard. */
  copyJSON() {
    const txt = this._previewView.getJSONText();
    navigator.clipboard.writeText(txt).then(() =>
      this._editorView.showToast('✅ Copied to clipboard!')
    );
  }

  /** Adds a new page. */
  addPage() {
    this._model.addPage();
    this._editorView.renderPages(this._model.getRaw().pages);
    this.syncAll();
  }

  /**
   * Switches the output panel tab.
   * @param {string}      tab
   * @param {HTMLElement} btn
   */
  switchTab(tab, btn) { this._editorView.switchOutputTab(tab, btn); }

  /**
   * Propagates colour-picker value to its paired text input.
   * @param {HTMLInputElement} picker
   */
  colorPickerToText(picker) { this._editorView.colorPickerToText(picker); }

  /**
   * Propagates text-input value to its paired colour picker.
   * @param {HTMLInputElement} textEl
   */
  textToColorPicker(textEl) { this._editorView.textToColorPicker(textEl); }

  /** Debounced sync — called by EditorView whenever any control changes. */
  syncAll() {
    clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => this._sync(), 120);
  }

  // ── Private: Handler Map ───────────────────────────────────────────────────

  /**
   * Builds the callback object passed to EditorView.
   * Each callback delegates back to the controller so all logic lives here.
   * @private
   * @returns {object}
   */
  _buildHandlers() {
    return {
      onSyncAll         : ()            => this.syncAll(),
      onApplyPreset     : name          => this._applyPreset(name),
      onSwitchEditorTab : name          => this._editorView.switchEditorTab(name),

      onAddPage    : ()       => this.addPage(),
      onRemovePage : pi       => this._removePage(pi),
      onTogglePage : pi       => this._editorView.togglePage(pi),

      onUpdatePageTitle  : (pi, val)         => this._updatePageTitle(pi, val),
      onAddInput         : pi                => this._addInput(pi),
      onRemoveInput      : (pi, ii)          => this._removeInput(pi, ii),
      onToggleRequired   : (pi, ii, btn)     => this._toggleRequired(pi, ii, btn),
      onInputFieldChange : (pi, ii, fld, val)=> this._inputFieldChange(pi, ii, fld, val),
    };
  }

  // ── Private: Preset ────────────────────────────────────────────────────────

  /** @private */
  _applyPreset(name) {
    this._model.applyPreset(name);
    this._editorView.loadStyleIntoUI(this._model.getRaw().style, name);
    this._editorView.buildPresetGrid(name);
    this.syncAll();
  }

  // ── Private: Page / Input Mutations ───────────────────────────────────────

  /** @private */
  _removePage(pi) {
    if (!this._model.removePage(pi)) {
      this._editorView.showToast('⚠️ At least one page is required', true);
      return;
    }
    this._editorView.renderPages(this._model.getRaw().pages);
    this.syncAll();
  }

  /** @private */
  _updatePageTitle(pi, val) {
    this._model.setPageField(pi, 'pageTitle', val);
    this._editorView.updatePageTitleDisplay(pi, val);
    this.syncAll();
  }

  /** @private */
  _addInput(pi) {
    this._model.addInput(pi);
    this._editorView.renderPages(this._model.getRaw().pages);
    this.syncAll();
  }

  /** @private */
  _removeInput(pi, ii) {
    if (!this._model.removeInput(pi, ii)) {
      this._editorView.showToast('⚠️ At least one input per page', true);
      return;
    }
    this._editorView.renderPages(this._model.getRaw().pages);
    this.syncAll();
  }

  /** @private */
  _toggleRequired(pi, ii, btn) {
    const newVal = this._model.toggleRequired(pi, ii);
    btn.classList.toggle('on', newVal);
    btn.textContent = newVal ? '✓' : '–';
    this.syncAll();
  }

  /** @private */
  _inputFieldChange(pi, ii, field, val) {
    this._model.setInputField(pi, ii, field, val);
    this.syncAll();
  }

  // ── Private: Sync Pipeline ─────────────────────────────────────────────────

  /**
   * Reads current UI state, merges with model, updates JSON + preview.
   * @private
   */
  _sync() {
    const cfg = this._buildConfig();
    this._previewView.updateJSON(cfg);
    this._previewView.updatePreview(this._generator.generate(cfg));
  }

  /**
   * Merges UI-controlled fields (general + style) with the model's page list.
   * @private
   * @returns {object}
   */
  _buildConfig() {
    // General fields + style come from UI controls
    const fromUI = this._editorView.readConfigFromUI(
      this._model.getRaw().pages,
      this._model.getActivePreset()
    );

    // Push the style read-back into the model so it stays consistent
    this._model.setStyle(fromUI.style);
    this._model.setFormTitle(fromUI.formTitle);
    this._model.setTransition(fromUI.transition);
    this._model.setTransitionDuration(fromUI.transitionDuration);
    this._model.setTransitionDelay(fromUI.transitionDelay);

    return fromUI;
  }

  // ── Private: File I/O ──────────────────────────────────────────────────────

  /** @private */
  _onFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader  = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result);
        this._model.loadConfig(parsed);
        this._editorView.loadConfigIntoUI(this._model.getConfig(), this._model.getActivePreset());
        this._editorView.showToast('✅ Config loaded!');
        this._sync();
      } catch {
        this._editorView.showToast('❌ Invalid JSON file', true);
      }
    };
    reader.readAsText(file);
  }
}

