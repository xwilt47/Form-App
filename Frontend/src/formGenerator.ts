import * as fs from "fs";
import * as path from "path";
import { FormConfig, InputConfig, PageConfig } from "./types";

// ── Load & Validate Config ────────────────────────────────────────────────────

export function loadConfig(filePath: string): FormConfig {
  const absPath = path.resolve(filePath);

  if (!fs.existsSync(absPath)) {
    throw new Error(`Config file not found: ${absPath}`);
  }

  const raw = fs.readFileSync(absPath, "utf-8");
  const config: FormConfig = JSON.parse(raw);

  validateConfig(config);
  return config;
}

function validateConfig(config: FormConfig): void {
  if (!config.formTitle) throw new Error("formTitle is required.");
  if (!Array.isArray(config.pages) || config.pages.length === 0) {
    throw new Error("At least one page is required.");
  }

  config.pages.forEach((page, pi) => {
    if (!page.pageTitle)
      throw new Error(`Page ${pi + 1}: pageTitle is required.`);
    if (!Array.isArray(page.inputs) || page.inputs.length === 0) {
      throw new Error(
        `Page "${page.pageTitle}": at least one input is required.`
      );
    }

    page.inputs.forEach((input, ii) => {
      if (!input.name)
        throw new Error(
          `Page "${page.pageTitle}", input ${ii + 1}: name is required.`
        );
      if (!input.type)
        throw new Error(
          `Page "${page.pageTitle}", input "${input.name}": type is required.`
        );
      if (input.limit == null || input.limit <= 0) {
        throw new Error(
          `Page "${page.pageTitle}", input "${input.name}": limit must be a positive number.`
        );
      }
    });
  });
}

// ── HTML Generators ───────────────────────────────────────────────────────────

function toId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function generateInput(input: InputConfig): string {
  const id = toId(input.name);
  const placeholder = input.placeholder ?? input.name;
  const required = input.required ? "required" : "";
  const limitAttr =
    input.type === "number"
      ? `max="${input.limit}"`
      : `maxlength="${input.limit}"`;

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
        <small class="limit-hint">${
          input.type === "number"
            ? `Max value: ${input.limit}`
            : `Max ${input.limit} characters`
        }</small>
      </div>`;
}

function generatePage(page: PageConfig, index: number, total: number): string {
  const inputs = page.inputs.map(generateInput).join("");
  const isFirst = index === 0;
  const isLast = index === total - 1;

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

// ── Styles ────────────────────────────────────────────────────────────────────

function generateStyles(): string {
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

      .success-message {
        text-align: center;
        padding: 2rem;
        display: none;
      }
      .success-message h2 { color: #16a34a; font-size: 1.4rem; }
      .success-message p  { color: #555; margin-top: 0.5rem; }

      .form-pages-track {
        overflow: hidden;
        position: relative;
      }

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
        from { transform: translateX(0);      opacity: 1; }
        to   { transform: translateX(-110%);  opacity: 0; }
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
    </style>`;
}

// ── Client-Side Script ────────────────────────────────────────────────────────

function generateScript(totalPages: number): string {
  return `
    <script>
      const totalPages = ${totalPages};

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

        const next = document.getElementById('page-' + (currentIndex + direction));
        const outClass = direction === 1 ? 'slide-out-left'  : 'slide-out-right';
        const inClass  = direction === 1 ? 'slide-in-right'  : 'slide-in-left';

        // Animate out
        current.classList.add(outClass);

        // Prepare and animate in
        next.style.display = 'block';
        next.classList.add(inClass);

        current.addEventListener('animationend', () => {
          current.style.display = 'none';
          current.classList.remove(outClass);
        }, { once: true });

        next.addEventListener('animationend', () => {
          next.classList.remove(inClass);
        }, { once: true });

        updateProgress(currentIndex + direction);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      document.getElementById('multi-step-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        console.log('Form submitted:', data);
        document.querySelector('.form-page:not([style*="none"])').style.display = 'none';
        document.querySelector('.progress-bar').style.display = 'none';
        document.querySelector('.success-message').style.display = 'block';
      });

      updateProgress(0);
    </script>`;
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function generateHTML(config: FormConfig): string {
  const pages = config.pages
    .map((page, i) => generatePage(page, i, config.pages.length))
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${config.formTitle}</title>
  ${generateStyles()}
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
  ${generateScript(config.pages.length)}
</body>
</html>`;
}

