/**
 * NameUtils
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared name-conversion utilities used by both the HTML form builders and the
 * Python API builder.  Keeping them in one place guarantees that field names
 * are identical in the generated HTML and the generated Python models.
 */
export class NameUtils {
  /**
   * "First Name"  →  "first_name"
   * "Goodreads URL" → "goodreads_url"
   */
  static toSnakeCase(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  /**
   * "Personal Info"  →  "PersonalInfo"
   * "Book Preferences" → "BookPreferences"
   */
  static toClassName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9 ]+/g, "")
      .split(" ")
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join("");
  }

  /**
   * "Personal Info"  →  "personal-info"
   */
  static toSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
}

