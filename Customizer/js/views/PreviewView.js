/**
 * views/PreviewView.js
 * ─────────────────────
 * Owns the right-hand output panel:
 *   • the live-preview iframe
 *   • the JSON output textarea
 */
class PreviewView {
  // ── Preview ────────────────────────────────────────────────────────────────

  /**
   * Writes a full HTML document string into the preview iframe.
   * @param {string} html
   */
  updatePreview(html) {
    const frame = document.getElementById('preview-frame');
    if (frame) frame.srcdoc = html;
  }

  // ── JSON Output ────────────────────────────────────────────────────────────

  /**
   * Updates the read-only JSON textarea.
   * @param {object} cfg  - Config object (will be stringified here).
   */
  updateJSON(cfg) {
    const el = document.getElementById('json-output');
    if (el) el.value = JSON.stringify(cfg, null, 2);
  }

  /**
   * Returns the current JSON textarea value (for clipboard copy).
   * @returns {string}
   */
  getJSONText() {
    const el = document.getElementById('json-output');
    return el ? el.value : '';
  }
}

