import { FormConfig, InputConfig, PageConfig } from "./types";
import { ConfigLoader } from "./ConfigLoader";

/**
 * FormGenerator
 * Single responsibility: transform a validated FormConfig into a complete,
 * standalone HTML document string.
 */
export class FormGenerator {
  /**
   * Generates a complete HTML document for the given form configuration.
   * @param config  A validated FormConfig object.
   * @returns       A self-contained HTML string ready to be written to disk.
   */
  generate(config: FormConfig): string {
    const transition         = config.transition         ?? "slide";
    const transitionDuration = config.transitionDuration ?? "0.4s";
    const transitionDelay    = config.transitionDelay    ?? "0s";
    const pages = config.pages
      .map((page, i) => this._generatePage(page, i, config.pages.length))
      .join("");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.formTitle}</title>
  ${this._generateStyles()}
</head>
<body>
  <div class="form-wrapper">
    <h1>${config.formTitle}</h1>
    <div class="progress-bar"><div class="progress-fill"></div></div>

    <form id="multi-step-form">
      <div class="form-pages-track">
        ${pages}
      </div>
    </form>

    <div class="success-message">
      <h2>✅ Submitted!</h2>
      <p>Thank you for completing the form.</p>
    </div>
  </div>
  ${this._generateScript(config.pages.length, transition, transitionDuration, transitionDelay)}
</body>
</html>`;
  }

  // ── Private: HTML builders ────────────────────────────────────────────────

  /**
   * Builds the HTML for a single form page (inputs + navigation buttons).
   * @private
   */
  private _generatePage(page: PageConfig, index: number, total: number): string {
    const inputs  = page.inputs.map(inp => this._generateInput(inp)).join("");
    const isFirst = index === 0;
    const isLast  = index === total - 1;

    return `
    <div class="form-page" id="page-${index}" ${isFirst ? "" : 'style="display:none"'}>
      <h2>${page.pageTitle}</h2>
      <p class="page-counter">Page ${index + 1} of ${total}</p>
      ${inputs}
      <div class="nav-buttons">
        ${!isFirst ? `<button type="button" class="btn-prev" onclick="navigate(${index}, -1)">← Previous</button>` : ""}
        ${!isLast  ? `<button type="button" class="btn-next" onclick="navigate(${index},  1)">Next →</button>`     : ""}
        ${isLast   ? `<button type="submit" class="btn-submit">Submit ✓</button>`                                  : ""}
      </div>
    </div>`;
  }

  /**
   * Builds the HTML for a single input field (or textarea).
   * @private
   */
  private _generateInput(input: InputConfig): string {
    const id          = this._toId(input.name);
    const placeholder = input.placeholder ?? input.name;
    const required    = input.required ? "required" : "";
    const limitAttr   = input.type === "number"
      ? `max="${input.limit}"`
      : `maxlength="${input.limit}"`;
    const hint = input.type === "number"
      ? `Max value: ${input.limit}`
      : `Max ${input.limit} characters`;

    if (input.type === "textarea") {
      return `
      <div class="form-group">
        <label for="${id}">${input.name}</label>
        <textarea
          id="${id}"
          name="${id}"
          placeholder="${placeholder}"
          maxlength="${input.limit}"
          ${required}
        ></textarea>
        <small class="limit-hint">Max ${input.limit} characters</small>
      </div>`;
    }

    return `
      <div class="form-group">
        <label for="${id}">${input.name}</label>
        <input
          type="${input.type}"
          id="${id}"
          name="${id}"
          placeholder="${placeholder}"
          ${limitAttr}
          ${required}
        />
        <small class="limit-hint">${hint}</small>
      </div>`;
  }

  /**
   * Returns the full inline <style> block for the generated form.
   * @private
   */
  private _generateStyles(): string {
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
      label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.35rem; }

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
      input:focus, textarea:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
      textarea { resize: vertical; min-height: 90px; }

      .limit-hint { font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; display: block; }

      .nav-buttons { display: flex; justify-content: space-between; margin-top: 1.75rem; gap: 0.75rem; }

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

      .form-pages-track { overflow: hidden; position: relative; }

      .form-page {
        animation-duration: 0.4s;
        animation-fill-mode: both;
        animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes slideInRight {
        from { transform: translateX(110%); opacity: 0; }
        to   { transform: translateX(0);    opacity: 1; }
      }
      @keyframes slideOutLeft {
        from { transform: translateX(0);     opacity: 1; }
        to   { transform: translateX(-110%); opacity: 0; }
      }
      @keyframes slideInLeft {
        from { transform: translateX(-110%); opacity: 0; }
        to   { transform: translateX(0);     opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0);    opacity: 1; }
        to   { transform: translateX(110%); opacity: 0; }
      }

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
      @keyframes slideInDown  { from { transform: translateY(-110%); opacity: 0; } to { transform: translateY(0);    opacity: 1; } }
      @keyframes slideOutUp   { from { transform: translateY(0);     opacity: 1; } to { transform: translateY(-110%); opacity: 0; } }
      @keyframes slideInUp    { from { transform: translateY(110%);  opacity: 0; } to { transform: translateY(0);    opacity: 1; } }
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

  /**
   * Returns the inline <script> block for client-side multi-step navigation.
   * @param totalPages         Total number of pages in the form.
   * @param transition         Page-transition animation style.
   * @param transitionDuration CSS time for each in/out animation.
   * @param transitionDelay    CSS time to wait between out-end and in-start.
   * @private
   */
  private _generateScript(
    totalPages: number,
    transition: string,
    transitionDuration: string,
    transitionDelay: string,
  ): string {
    return `
    <script>
      const totalPages         = ${totalPages};
      const transitionType     = '${transition}';
      const transitionDuration = '${transitionDuration}';
      const transitionDelay    = '${transitionDelay}';

      /** Convert a CSS time string ("0.4s" or "400ms") to milliseconds. */
      function cssTimeToMs(val) {
        if (!val) return 0;
        const n = parseFloat(val);
        return val.trim().endsWith('ms') ? n : n * 1000;
      }

      function getClasses(direction) {
        switch (transitionType) {
          case 'fade':
            return { out: 'fade-out', in: 'fade-in' };
          case 'vertical':
            return direction === 1
              ? { out: 'slide-out-up',   in: 'slide-in-down' }
              : { out: 'slide-out-down', in: 'slide-in-up'   };
          case 'zoom':
            return direction === 1
              ? { out: 'zoom-out',      in: 'zoom-in'      }
              : { out: 'zoom-out-back', in: 'zoom-in-back' };
          default: // slide
            return direction === 1
              ? { out: 'slide-out-left',  in: 'slide-in-right' }
              : { out: 'slide-out-right', in: 'slide-in-left'  };
        }
      }

      function updateProgress(pageIndex) {
        const pct = ((pageIndex + 1) / totalPages) * 100;
        document.querySelector('.progress-fill').style.width = pct + '%';
      }

      function navigate(currentIndex, direction) {
        const current = document.getElementById('page-' + currentIndex);

        if (direction === 1) {
          const inputs = current.querySelectorAll('input[required], textarea[required]');
          for (const input of inputs) {
            if (!input.value.trim()) {
              input.focus();
              input.style.borderColor = '#ef4444';
              setTimeout(() => input.style.borderColor = '', 1500);
              return;
            }
          }
        }

        const next    = document.getElementById('page-' + (currentIndex + direction));
        const classes = getClasses(direction);
        const durMs   = cssTimeToMs(transitionDuration);
        const delayMs = cssTimeToMs(transitionDelay);

        // Lock the track height so the form wrapper never resizes mid-transition.
        const track = current.closest('.form-pages-track');
        track.style.minHeight = current.offsetHeight + 'px';

        // Apply duration to both pages so it overrides the CSS default.
        current.style.animationDuration = transitionDuration;
        next.style.animationDuration    = transitionDuration;

        // Animate the current page out.
        current.classList.add(classes.out);

        // After the out-animation finishes, wait transitionDelay, then animate in.
        current.addEventListener('animationend', () => {
          current.style.display = 'none';
          current.classList.remove(classes.out);

          setTimeout(() => {
            next.style.display = 'block';
            next.classList.add(classes.in);
            next.addEventListener('animationend', () => {
              next.classList.remove(classes.in);
              // Update lock to the incoming page's natural height.
              track.style.minHeight = next.offsetHeight + 'px';
            }, { once: true });
          }, delayMs);
        }, { once: true });

        updateProgress(currentIndex + direction);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      document.getElementById('multi-step-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data     = Object.fromEntries(formData.entries());
        console.log('Form submitted:', data);
        document.querySelector('.form-page:not([style*="none"])').style.display = 'none';
        document.querySelector('.progress-bar').style.display = 'none';
        document.querySelector('.success-message').style.display = 'block';
      });

      updateProgress(0);
    <\/script>`;
  }

  // ── Private: utilities ────────────────────────────────────────────────────

  /**
   * Converts a human-readable field name to a safe HTML id / name attribute.
   * @private
   */
  private _toId(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }
}

// ── Backward-compatible function exports ──────────────────────────────────────
// index.ts (and any other callers) may import these directly without changes.


/** @deprecated Use `ConfigLoader.load(filePath)` directly. */
export function loadConfig(filePath: string): FormConfig {
  return ConfigLoader.load(filePath);
}

/** @deprecated Use `new FormGenerator().generate(config)` directly. */
export function generateHTML(config: FormConfig): string {
  return new FormGenerator().generate(config);
}
