/**
 * app.js
 * ───────
 * Entry point.
 * Instantiates AppController and exposes a global `app` reference so that
 * index.html's static onclick attributes can reach it.
 *
 * No business logic lives here — all behaviour is in the MVC layers:
 *   Model      →  js/models/ConfigModel.js
 *   Views      →  js/views/EditorView.js, js/views/PreviewView.js
 *   Controller →  js/controllers/AppController.js
 */

/** @type {AppController} */
const app = new AppController();

window.addEventListener('DOMContentLoaded', () => app.init());

// ── Global shims for static HTML onclick attributes ────────────────────────

function downloadJSON()            { app.downloadJSON(); }
function copyJSON()                { app.copyJSON(); }
function refreshPreview()          { app.refreshPreview(); }
function addPage()                 { app.addPage(); }
function switchTab(tab, btn)       { app.switchTab(tab, btn); }
function colorPickerToText(picker) { app.colorPickerToText(picker); }
function textToColorPicker(textEl) { app.textToColorPicker(textEl); }
function syncAll()                 { app.syncAll(); }
