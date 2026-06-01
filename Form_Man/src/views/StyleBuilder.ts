/**
 * StyleBuilder
 * ─────────────────────────────────────────────────────────────────────────────
 * Single responsibility: return the full inline <style> block that is embedded
 * in every generated form.  No logic, no config — pure CSS.
 */
export class StyleBuilder {
  /**
   * Returns a complete HTML <style> block string.
   */
  build(): string {
    return `
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        font-family: 'Segoe UI', sans-serif;
        background: #f0f4f8;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        padding: 2rem;
      }

      .form-wrapper {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.10);
        padding: 2.5rem;
        width: 100%;
        max-width: 520px;
      }

      h1 { font-size: 1.6rem; margin-bottom: 1.5rem; color: #1a1a2e; text-align: center; }
      h2 { font-size: 1.2rem; margin-bottom: 0.25rem; color: #16213e; }

      .page-counter { font-size: 0.8rem; color: #888; margin-bottom: 1.5rem; }

      .progress-bar {
        width: 100%;
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        margin-bottom: 1.5rem;
        overflow: hidden;
      }
      .progress-fill {
        height: 100%;
        background: #4f46e5;
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      .form-group { margin-bottom: 1.25rem; }
      label {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 0.35rem;
      }

      input, textarea {
        width: 100%;
        padding: 0.6rem 0.85rem;
        border: 1.5px solid #d1d5db;
        border-radius: 7px;
        font-size: 0.95rem;
        transition: border-color 0.2s;
        outline: none;
        color: #111;
      }
      input:focus, textarea:focus {
        border-color: #4f46e5;
        box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
      }
      textarea { resize: vertical; min-height: 90px; }

      .limit-hint { font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; display: block; }

      .nav-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 1.75rem;
        gap: 0.75rem;
      }

      button {
        flex: 1;
        padding: 0.65rem 1.25rem;
        border: none;
        border-radius: 7px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s, transform 0.1s;
      }
      button:active { transform: scale(0.98); }

      .btn-next, .btn-submit { background: #4f46e5; color: #fff; }
      .btn-next:hover, .btn-submit:hover { background: #4338ca; }
      .btn-prev { background: #e5e7eb; color: #374151; }
      .btn-prev:hover { background: #d1d5db; }

      .success-message { text-align: center; padding: 2rem; display: none; }
      .success-message h2 { color: #16a34a; font-size: 1.4rem; }
      .success-message p  { color: #555; margin-top: 0.5rem; }

      /* ── Transition base ── */
      .form-pages-track { overflow: hidden; position: relative; }
      .form-page {
        animation-duration: 0.4s;
        animation-fill-mode: both;
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* ── Slide (horizontal) ── */
      @keyframes slideInRight  { from { transform: translateX(110%);  opacity: 0; } to { transform: translateX(0);     opacity: 1; } }
      @keyframes slideOutLeft  { from { transform: translateX(0);      opacity: 1; } to { transform: translateX(-110%); opacity: 0; } }
      @keyframes slideInLeft   { from { transform: translateX(-110%);  opacity: 0; } to { transform: translateX(0);     opacity: 1; } }
      @keyframes slideOutRight { from { transform: translateX(0);      opacity: 1; } to { transform: translateX(110%);  opacity: 0; } }
      .slide-in-right  { animation-name: slideInRight; }
      .slide-out-left  { animation-name: slideOutLeft;  pointer-events: none; position: absolute; top: 0; left: 0; width: 100%; }
      .slide-in-left   { animation-name: slideInLeft; }
      .slide-out-right { animation-name: slideOutRight; pointer-events: none; position: absolute; top: 0; left: 0; width: 100%; }

      /* ── Fade ── */
      @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
      @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
      .fade-in  { animation-name: fadeIn; }
      .fade-out { animation-name: fadeOut; pointer-events: none; position: absolute; top: 0; left: 0; width: 100%; }

      /* ── Vertical ── */
      @keyframes slideInDown  { from { transform: translateY(-110%); opacity: 0; } to { transform: translateY(0);     opacity: 1; } }
      @keyframes slideOutUp   { from { transform: translateY(0);     opacity: 1; } to { transform: translateY(-110%); opacity: 0; } }
      @keyframes slideInUp    { from { transform: translateY(110%);  opacity: 0; } to { transform: translateY(0);     opacity: 1; } }
      @keyframes slideOutDown { from { transform: translateY(0);     opacity: 1; } to { transform: translateY(110%);  opacity: 0; } }
      .slide-in-down  { animation-name: slideInDown; }
      .slide-out-up   { animation-name: slideOutUp;   pointer-events: none; position: absolute; top: 0; left: 0; width: 100%; }
      .slide-in-up    { animation-name: slideInUp; }
      .slide-out-down { animation-name: slideOutDown; pointer-events: none; position: absolute; top: 0; left: 0; width: 100%; }

      /* ── Zoom ── */
      @keyframes zoomIn      { from { transform: scale(0.85); opacity: 0; } to { transform: scale(1);    opacity: 1; } }
      @keyframes zoomOut     { from { transform: scale(1);    opacity: 1; } to { transform: scale(1.1);  opacity: 0; } }
      @keyframes zoomInBack  { from { transform: scale(1.1);  opacity: 0; } to { transform: scale(1);    opacity: 1; } }
      @keyframes zoomOutBack { from { transform: scale(1);    opacity: 1; } to { transform: scale(0.85); opacity: 0; } }
      .zoom-in       { animation-name: zoomIn; }
      .zoom-out      { animation-name: zoomOut;     pointer-events: none; position: absolute; top: 0; left: 0; width: 100%; }
      .zoom-in-back  { animation-name: zoomInBack; }
      .zoom-out-back { animation-name: zoomOutBack; pointer-events: none; position: absolute; top: 0; left: 0; width: 100%; }
    </style>`;
  }
}

