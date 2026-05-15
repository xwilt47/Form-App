# 📖 Book App — Form Config Documentation

The form is entirely driven by `Frontend/src/config/form-config.json`. No code changes are needed — edit the JSON (or use the **Customizer** GUI) and rebuild.

---

## 📁 Project Structure

```
Book App/
├── Customizer/               # Browser-based visual editor
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── constants.js        # Frozen preset data + DEFAULT_CONFIG
│       ├── ColorUtils.js       # Static colour utilities
│       ├── FormGenerator.js    # Generates live preview HTML
│       ├── FormCustomizerApp.js# Main application class
│       └── app.js              # Entry point + global shims
│
├── Frontend/                 # TypeScript form generator (CLI)
│   ├── src/
│   │   ├── config/
│   │   │   └── form-config.json# ← Edit this to configure your form
│   │   ├── types.ts            # All TypeScript interfaces & types
│   │   ├── ConfigLoader.ts     # Reads + validates the config file
│   │   └── formGenerator.ts    # FormGenerator class → outputs HTML
│   └── output/
│       └── form.html           # ← Generated output
│
└── src/                      # Root generator (with full theme support)
    ├── types.ts
    ├── ConfigLoader.ts
    ├── ThemeResolver.ts        # Owns presets, merges style overrides
    └── formGenerator.ts
```

---

## 🗂️ Top-Level Config Structure

```json
{
  "formTitle": "My Form Title",
  "transition": "slide",
  "transitionDuration": "0.4s",
  "transitionDelay": "0s",
  "style": { ... },
  "pages": [ ... ]
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `formTitle` | `string` | ✅ | — | Title displayed at the top of the form |
| `transition` | `string` | ❌ | `"slide"` | Page-change animation style (see [Transitions](#-transitions)) |
| `transitionDuration` | `string` | ❌ | `"0.4s"` | How long each in/out animation runs (CSS time) |
| `transitionDelay` | `string` | ❌ | `"0s"` | Pause between the outgoing page finishing and the incoming page starting (CSS time) |
| `style` | `object` | ❌ | — | Visual theme options (see [Style](#-style)) |
| `pages` | `array` | ✅ | — | List of form pages (see [Pages](#-pages)) |

---

## 🎬 Transitions

### `transition` — animation style

| Value | Description |
|---|---|
| `"slide"` | Pages slide horizontally (left ↔ right) — **default** |
| `"vertical"` | Pages slide vertically (up ↕ down) |
| `"fade"` | Pages fade out then fade in |
| `"zoom"` | Current page zooms out, next page zooms in |

### `transitionDuration` — animation speed

Controls how long each individual in/out animation takes. Accepts any CSS time value.

```json
"transitionDuration": "0.6s"
"transitionDuration": "300ms"
```

### `transitionDelay` — gap between pages

Sets a pause **between** the outgoing page finishing and the incoming page starting. Useful for creating a clean blank gap effect between transitions.

```json
"transitionDelay": "0s"    // no gap (default)
"transitionDelay": "0.1s"  // 100ms pause
"transitionDelay": "200ms" // 200ms pause
```

> **Note:** Both values accept `s` (seconds) or `ms` (milliseconds).

### Timing diagram

```
[user clicks Next]
        │
        ▼
  out-animation plays     ← duration = transitionDuration
        │
  animationend fires
        │
  wait ─────────────────  ← delay   = transitionDelay
        │
  in-animation plays      ← duration = transitionDuration
        │
  settled on new page
```

> The form wrapper **never resizes** during a transition — the card height is locked to the departing page's height and only updates once the arriving page has fully settled.

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
| `limit` | `number` | ✅ | Max characters (text fields) or max numeric value (`number` type) |
| `required` | `boolean` | ❌ | If `true`, user must fill this before advancing. Defaults to `false` |
| `placeholder` | `string` | ❌ | Placeholder text. Defaults to the field `name` |

### Supported `type` values

| Type | Description |
|---|---|
| `text` | Plain text input |
| `number` | Numeric input — `limit` sets the maximum allowed value |
| `email` | Email address (browser-validated) |
| `password` | Password input (text is hidden) |
| `url` | URL (browser-validated) |
| `tel` | Telephone number |
| `date` | Date picker |
| `textarea` | Multi-line text — `limit` sets max characters |

---

## 🎨 Style

The `style` object controls the visual appearance of the form. All fields are optional.

```json
"style": {
  "preset": "default"
}
```

### Presets

Set `"preset"` to one of the built-in themes. Omitting `preset` defaults to `"default"`.

| Preset | Background | Accent | Font |
|---|---|---|---|
| `default` | Light grey | Indigo | Segoe UI |
| `dark` | Near-black | Purple | Segoe UI |
| `ocean` | Sky blue | Cyan | Segoe UI |
| `rose` | Soft pink | Red | Georgia (serif) |
| `forest` | Mint green | Green | Segoe UI |
| `custom` | White | Indigo | Segoe UI — all values set manually |

### Custom Overrides

Any field below can be added alongside a preset to override specific values. Only include the fields you want to change.

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
| `accentColor` | Primary colour — buttons, progress bar, focus rings | `"#4f46e5"` |
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
| `animationSpeed` | CSS default animation duration (overridden at runtime by `transitionDuration`) | `"0.4s"` |

---

## 🖥️ Customizer

Open `Customizer/index.html` in a browser for a live visual editor. Changes are reflected instantly in the preview panel on the right.

### General tab
- **Form Title** — sets `formTitle`
- **Page Transition** — selects the transition style (`slide`, `vertical`, `fade`, `zoom`)
- **Transition Duration** — sets `transitionDuration` (e.g. `0.4s`, `300ms`)
- **Transition Delay** — sets `transitionDelay` (pause between pages)

### Style tab
- Choose a **preset** from the swatch grid
- Fine-tune any individual colour, radius, shadow, font, or speed

### Pages tab
- Add / remove pages
- Add / remove inputs per page
- Set each input's name, type, character limit, and required flag

### JSON / Export tab
- View the live-generated config JSON
- **Copy** to clipboard or **Download** as `form-config.json`

### Loading a saved config
Click **📂 Load JSON** in the top bar to upload an existing `form-config.json` — all editor fields and the preview update immediately.

---

## 💡 Full Example

The example below mirrors the current `form-config.json`:

```json
{
  "formTitle": "My Book App Form",
  "transition": "vertical",
  "transitionDuration": "0.4s",
  "transitionDelay": "0s",
  "style": {
    "preset": "default",
    "accentColor": "#4f46e5",
    "accentHover": "#4338ca",
    "bgColor": "#f0f4f8",
    "cardColor": "#ffffff",
    "headingColor": "#1a1a2e",
    "labelColor": "#374151",
    "inputBorder": "#d1d5db",
    "inputBg": "#ffffff",
    "inputColor": "#111111",
    "cardRadius": "12px",
    "fontFamily": "Segoe UI, sans-serif",
    "cardShadow": "0 4px 24px rgba(0,0,0,0.10)",
    "animationSpeed": "0.4s"
  },
  "pages": [
    {
      "pageTitle": "Personal Info",
      "inputs": [
        { "name": "First Name", "type": "text",   "limit": 50,  "required": true },
        { "name": "Last Name",  "type": "text",   "limit": 50,  "required": true },
        { "name": "Age",        "type": "number", "limit": 120 },
        { "name": "Email",      "type": "email",  "limit": 100, "required": true }
      ]
    },
    {
      "pageTitle": "Book Preferences",
      "inputs": [
        { "name": "Favourite Genre", "type": "text",   "limit": 40 },
        { "name": "Books Per Year",  "type": "number", "limit": 999 },
        { "name": "Goodreads URL",   "type": "url",    "limit": 200 }
      ]
    },
    {
      "pageTitle": "Account Setup",
      "inputs": [
        { "name": "Username", "type": "text",     "limit": 20, "required": true },
        { "name": "Password", "type": "password", "limit": 64, "required": true }
      ]
    }
  ]
}
```

---

## 🔧 Rebuilding After Changes

After editing `Frontend/src/config/form-config.json`, run the following in the `Frontend/` folder to regenerate `output/form.html`:

```powershell
npm run generate
```

This compiles the TypeScript, copies the config to `dist/config/`, and runs the generator in one step.

| Script | What it does |
|---|---|
| `npm run generate` | Full build + config copy + generate (recommended) |
| `npm run build` | TypeScript compile only |
| `npm run copy-config` | Copy `src/config/form-config.json` → `dist/config/` |

The generated form will be at `Frontend/output/form.html` — open it in any browser.
