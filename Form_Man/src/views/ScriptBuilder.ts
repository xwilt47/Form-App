import { TransitionType } from "../types";

/**
 * ScriptBuilder
 * ─────────────────────────────────────────────────────────────────────────────
 * Single responsibility: return the inline <script> block that is embedded in
 * every generated form.  This script runs entirely inside the output HTML file
 * — it has no connection back to Form_Man or the Customizer at runtime.
 */
export class ScriptBuilder {
  /**
   * Builds the client-side navigation script for the form.
   * @param totalPages         Total number of pages.
   * @param transition         Animation style (slide | fade | vertical | zoom).
   * @param transitionDuration CSS duration string (e.g. "0.4s").
   * @param transitionDelay    CSS delay between out-end and in-start (e.g. "0s").
   */
  build(
    totalPages: number,
    transition: TransitionType | string,
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
}

