/**
 * ColorUtils.js
 * Static utility class for color manipulation and HTML escaping.
 */

class ColorUtils {
  /**
   * Normalises any 3- or 6-digit hex value to a 6-digit #rrggbb string.
   * Returns '#000000' for invalid input.
   * @param {string} val
   * @returns {string}
   */
  static normalizeHex(val) {
    if (!val) return '#000000';
    const clean = val.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(clean)) return clean;
    if (/^#[0-9a-fA-F]{3}$/.test(clean)) {
      const [, r, g, b] = clean;
      return `#${r + r}${g + g}${b + b}`;
    }
    return '#000000';
  }

  /**
   * Converts a hex colour to a comma-separated RGB string (e.g. "79,70,229").
   * Returns null for invalid input.
   * @param {string} hex
   * @returns {string|null}
   */
  static hexToRgb(hex) {
    const clean = (hex || '').replace('#', '');
    const full  = clean.length === 3
      ? clean.split('').map(c => c + c).join('')
      : clean;
    const n = parseInt(full, 16);
    if (isNaN(n)) return null;
    return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
  }

  /**
   * Escapes a string for safe HTML attribute / text-content insertion.
   * @param {string} s
   * @returns {string}
   */
  static escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

