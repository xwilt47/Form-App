/**
 * app.js
 * Entry point. Instantiates FormCustomizerApp and exposes a global `app`
 * reference so that static HTML onclick attributes can reach it.
 * Thin wrapper functions are kept here for the handful of handlers that
 * are called directly from index.html's static markup.
 */

/** @type {FormCustomizerApp} */
const app = new FormCustomizerApp();

window.addEventListener('DOMContentLoaded', () => app.init());

// ── Global shims for static HTML onclick attributes ────────────────────────
// These are the only functions index.html calls from its fixed (non-generated)
// markup. All generated-template handlers already reference `app.*` directly.

/** Called by the ⬇️ Download JSON button. */
function downloadJSON()            { app.downloadJSON(); }

/** Called by the 📋 Copy button. */
function copyJSON()                { app.copyJSON(); }

/** Called by the 🔄 Refresh Preview button. */
function refreshPreview()          { app.refreshPreview(); }

/** Called by the ＋ Add Page button. */
function addPage()                 { app.addPage(); }

/**
 * Called by output-panel tab buttons.
 * @param {string}      tab
 * @param {HTMLElement} btn
 */
function switchTab(tab, btn)       { app.switchTab(tab, btn); }

/**
 * Called by colour picker oninput attributes.
 * @param {HTMLInputElement} picker
 */
function colorPickerToText(picker) { app.colorPickerToText(picker); }

/**
 * Called by colour text-input oninput attributes.
 * @param {HTMLInputElement} textEl
 */
function textToColorPicker(textEl) { app.textToColorPicker(textEl); }

/** Called by any style input that doesn't use a colour picker. */
function syncAll()                 { app.syncAll(); }
