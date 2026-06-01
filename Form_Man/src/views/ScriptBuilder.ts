import { TransitionType } from "../types";

/** Describes one form page for the client-side submission grouping. */
export interface PageSchema {
  /** snake_case page title — matches the Python model field name. */
  model: string;
  /** Ordered snake_case field names for every input on this page. */
  fields: string[];
}

/**
 * ScriptBuilder
 * ─────────────────────────────────────────────────────────────────────────────
 * Single responsibility: return the inline <script> block embedded in every
 * generated form.  This script runs entirely inside the output HTML file.
 *
 * On submit it:
 *   1. Animates the last form page out using the configured transition.
 *   2. Animates the result slide in.
 *   3. POSTs the form data (grouped by page) to the Python API.
 *   4. Renders the JSON response — or an error message — inside the result slide.
 */
export class ScriptBuilder {
  /**
   * @param totalPages         Total number of form pages.
   * @param transition         Animation style.
   * @param transitionDuration CSS duration for each animation.
   * @param transitionDelay    CSS pause between out-end and in-start.
   * @param pageSchemas        Per-page model/field info for building the POST body.
   * @param apiUrl             Base URL of the running Python API.
   */
  build(
    totalPages: number,
    transition: TransitionType | string,
    transitionDuration: string,
    transitionDelay: string,
    pageSchemas: PageSchema[],
    apiUrl: string = "http://localhost:8000",
  ): string {
    const pageSchemasJson = JSON.stringify(pageSchemas);

    return `
    <script>
      const totalPages         = ${totalPages};
      const transitionType     = '${transition}';
      const transitionDuration = '${transitionDuration}';
      const transitionDelay    = '${transitionDelay}';
      const API_URL            = '${apiUrl}';
      const PAGE_MODELS        = ${pageSchemasJson};

      // ── Helpers ────────────────────────────────────────────────────────────

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

      function updateProgress(pct) {
        document.querySelector('.progress-fill').style.width = pct + '%';
      }

      // ── Page navigation ────────────────────────────────────────────────────

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
        const delayMs = cssTimeToMs(transitionDelay);

        const track = current.closest('.form-pages-track');
        track.style.minHeight = current.offsetHeight + 'px';

        current.style.animationDuration = transitionDuration;
        next.style.animationDuration    = transitionDuration;

        current.classList.add(classes.out);
        current.addEventListener('animationend', () => {
          current.style.display = 'none';
          current.classList.remove(classes.out);
          setTimeout(() => {
            next.style.display = 'block';
            next.classList.add(classes.in);
            next.addEventListener('animationend', () => {
              next.classList.remove(classes.in);
              track.style.minHeight = next.offsetHeight + 'px';
            }, { once: true });
          }, delayMs);
        }, { once: true });

        const newIndex = currentIndex + direction;
        updateProgress(((newIndex + 1) / totalPages) * 100);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // ── Submit → result slide ──────────────────────────────────────────────

      document.getElementById('multi-step-form').addEventListener('submit', async function(e) {
        e.preventDefault();

        // Safety-net: validate all required fields across every page
        const allRequired = e.target.querySelectorAll('input[required], textarea[required]');
        for (const input of allRequired) {
          if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            input.closest('.form-page').style.display = 'block';
            input.focus();
            setTimeout(() => input.style.borderColor = '', 1500);
            return;
          }
        }

        const lastPage   = document.getElementById('page-' + (totalPages - 1));
        const resultPage = document.getElementById('page-result');
        const classes    = getClasses(1);
        const delayMs    = cssTimeToMs(transitionDelay);
        const track      = lastPage.closest('.form-pages-track');

        // Collect flat form data
        const flat = Object.fromEntries(new FormData(e.target).entries());

        // Build nested FullSubmission body matching Python model structure
        const body = {};
        PAGE_MODELS.forEach(({ model, fields }) => {
          body[model] = {};
          fields.forEach(field => {
            if (flat[field] !== undefined) body[model][field] = flat[field];
          });
        });

        // ── Animate last form page → result slide ──────────────────────────
        updateProgress(100);
        track.style.minHeight = lastPage.offsetHeight + 'px';

        lastPage.style.animationDuration  = transitionDuration;
        resultPage.style.animationDuration = transitionDuration;

        lastPage.classList.add(classes.out);
        lastPage.addEventListener('animationend', () => {
          lastPage.style.display = 'none';
          lastPage.classList.remove(classes.out);

          // Hide the progress bar once on the result slide
          document.querySelector('.progress-bar').style.display = 'none';

          setTimeout(() => {
            resultPage.style.display = 'block';
            resultPage.classList.add(classes.in);
            resultPage.addEventListener('animationend', () => {
              resultPage.classList.remove(classes.in);
              // Release the overflow + height lock so the result content
              // can grow freely (JSON box may be taller than the last form page).
              track.style.overflow  = 'visible';
              track.style.minHeight = '';
            }, { once: true });
          }, delayMs);
        }, { once: true });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // ── POST to API ────────────────────────────────────────────────────
        try {
          const res  = await fetch(API_URL + '/submit', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(body),
          });
          const json = await res.json();

          document.querySelector('.result-loading').style.display  = 'none';
          document.querySelector('.result-json-box').style.display = 'block';
          document.querySelector('.result-json').textContent = JSON.stringify(json, null, 2);

        } catch (err) {
          document.querySelector('.result-loading').style.display = 'none';

          // Show the error banner
          const errEl = document.querySelector('.result-error');
          errEl.innerHTML =
            '<strong>⚠️ Could not reach the API at ' + API_URL + '</strong><br>' +
            'Start the server with: <code>python api.py</code><br><br>' +
            '<strong>Your submitted data:</strong>';
          errEl.style.display = 'block';

          // Still show the submitted data so the user can see what was entered
          document.querySelector('.result-json-box').style.display = 'block';
          document.querySelector('.result-json').textContent = JSON.stringify(body, null, 2);
        }
      });

      // ── Copy JSON button ───────────────────────────────────────────────────
      function copyJson() {
        const text = document.querySelector('.result-json').textContent;
        navigator.clipboard.writeText(text).then(() => {
          const btn = document.querySelector('.btn-copy-json');
          btn.textContent = '✅ Copied!';
          setTimeout(() => btn.textContent = '📋 Copy', 2000);
        });
      }

      // ── Init ───────────────────────────────────────────────────────────────
      updateProgress(((0 + 1) / totalPages) * 100);
    <\/script>`;
  }
}

