# 📖 Form Config Documentation

The form is entirely driven by `Frontend/form-config.json`. No code changes are needed — just edit the JSON and rebuild.

---

## Top-Level Structure

```json
{
  "formTitle": "My Form Title",
  "style": { ... },
  "pages": [ ... ]
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `formTitle` | `string` | ✅ | Title displayed at the top of the form |
| `style` | `object` | ❌ | Visual theme options (see [Style](#-style)) |
| `pages` | `array` | ✅ | List of pages in the form (see [Pages](#-pages)) |

---

## 📄 Pages

Each item in the `pages` array is one step of the multi-page form.

```json
"pages": [
  {
    "pageTitle": "Personal Info",
    "inputs": [ ... ]
  }
]
```

| Field | Type | Required | Description |
|---|---|---|---|
| `pageTitle` | `string` | ✅ | Heading shown at the top of the page |
| `inputs` | `array` | ✅ | List of input fields on this page (see [Inputs](#-inputs)) |

---

## 🔤 Inputs

Each item in a page's `inputs` array defines one form field.

```json
{
  "name": "First Name",
  "type": "text",
  "limit": 50,
  "required": true,
  "placeholder": "Enter your first name"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | ✅ | Label shown above the input |
| `type` | `string` | ✅ | Input type (see supported types below) |
| `limit` | `number` | ✅ | Max characters (text) or max value (number) |
| `required` | `boolean` | ❌ | If `true`, the user must fill this in before advancing. Defaults to `false` |
| `placeholder` | `string` | ❌ | Placeholder text inside the input. Defaults to the field name |

### Supported `type` values

| Type | Description |
|---|---|
| `text` | Plain text input |
| `number` | Numeric input — `limit` sets the maximum allowed value |
| `email` | Email address input (browser-validated) |
| `password` | Password input (text is hidden) |
| `url` | URL input (browser-validated) |
| `tel` | Telephone number input |
| `date` | Date picker |
| `textarea` | Multi-line text area — `limit` sets max characters |

---

## 🎨 Style

The `style` object controls the visual appearance of the form. All fields are optional.

```json
"style": {
  "preset": "default"
}
```

### Presets

Set `"preset"` to one of the built-in themes. If omitted, `"default"` is used.

| Preset | Description |
|---|---|
| `default` | Clean white card, indigo accent, Segoe UI font |
| `dark` | Dark navy background, purple accent |
| `ocean` | Sky blue tones, cyan accent |
| `rose` | Soft pink tones, red accent, serif font |
| `forest` | Mint green tones, green accent |
| `custom` | Blank slate — all values must be set manually |

### Custom Overrides

Any field listed below can be added alongside (or instead of) a preset to override specific values. You only need to include the fields you want to change.

```json
"style": {
  "preset": "ocean",
  "accentColor": "#f97316",
  "accentHover": "#ea580c",
  "fontFamily": "'Courier New', monospace"
}
```

| Field | Description | Example |
|---|---|---|
| `accentColor` | Primary colour — used for buttons, progress bar, and focus rings | `"#4f46e5"` |
| `accentHover` | Hover colour for buttons (slightly darker accent) | `"#4338ca"` |
| `bgColor` | Page background colour | `"#f0f4f8"` |
| `cardColor` | Form card background colour | `"#ffffff"` |
| `cardRadius` | Corner radius of the form card | `"12px"` |
| `cardShadow` | Box shadow of the form card | `"0 4px 24px rgba(0,0,0,0.1)"` |
| `headingColor` | Colour of the form title and page headings | `"#1a1a2e"` |
| `labelColor` | Colour of input labels | `"#374151"` |
| `inputBorder` | Border colour of inputs | `"#d1d5db"` |
| `inputBg` | Background colour of inputs | `"#ffffff"` |
| `inputColor` | Text colour inside inputs | `"#111111"` |
| `fontFamily` | Font family for the entire form | `"'Georgia', serif"` |
| `animationSpeed` | Duration of the page-slide animation | `"0.4s"` |

---

## 💡 Full Example

```json
{
  "formTitle": "Book Club Sign Up",
  "style": {
    "preset": "forest",
    "cardRadius": "20px",
    "animationSpeed": "0.3s"
  },
  "pages": [
    {
      "pageTitle": "About You",
      "inputs": [
        { "name": "Full Name",  "type": "text",   "limit": 80, "required": true },
        { "name": "Email",      "type": "email",  "limit": 100, "required": true },
        { "name": "Birth Year", "type": "number", "limit": 2025 }
      ]
    },
    {
      "pageTitle": "Your Reading Habits",
      "inputs": [
        { "name": "Favourite Genre", "type": "text",     "limit": 40 },
        { "name": "Books Per Year",  "type": "number",   "limit": 500 },
        { "name": "About Me",        "type": "textarea", "limit": 300, "placeholder": "Tell us about yourself..." }
      ]
    }
  ]
}
```

---

## 🔧 Rebuilding After Changes

After editing `form-config.json`, run the following commands to regenerate `output/form.html`:

```powershell
npx tsc; node dist/index.js
```

The generated form will be at `output/form.html` — open it in any browser.

