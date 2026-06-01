# 🔧 How It Works — Code Explanation
### A plain-English walkthrough of the Customizer's code structure

---

## The Big Picture

The Customizer is a single web page (`index.html`) that is split into three
logical layers — called **MVC** (Model · View · Controller).
Think of it like a restaurant:

```
  You (the user)
       │
       ▼
  🖥️  VIEW  — the waiter — shows you things, takes your order
       │
       ▼
  🧠  CONTROLLER — the kitchen manager — decides what to do
       │
       ▼
  📦  MODEL  — the pantry — stores all the data
```

None of these layers talk *past* each other.
The View never touches the data directly.
The Model never touches the screen directly.
The Controller is the only one who connects them.

---

## File Map

```
Customizer/
├── index.html                    ← The page skeleton (HTML only, no logic)
├── css/
│   └── style.css                 ← All visual styling for the editor
└── js/
    ├── app.js                    ← Starts everything up
    ├── ColorUtils.js             ← Colour maths helpers
    ├── shared/
    │   └── AppConstants.js       ← Shared data (presets, defaults)
    ├── services/
    │   └── FormGenerator.js      ← Builds the preview form HTML
    ├── models/
    │   └── ConfigModel.js        ← Owns and mutates the form config
    ├── views/
    │   ├── EditorView.js         ← Draws the editor panel, reads controls
    │   └── PreviewView.js        ← Updates the iframe + JSON textarea
    └── controllers/
        └── AppController.js      ← Wires everything together
```

---

## How the Page Loads (step by step)

1. The browser loads `index.html` and reads all the `<script>` tags at the bottom.
2. Scripts are loaded **in order** — constants first, utilities second, then the MVC files, then `app.js` last.
3. `app.js` runs `new AppController()` to create the controller, then waits for the DOM to be ready.
4. Once ready, `app.init()` fires:
   - Builds the preset colour grid.
   - Populates all the editor controls with default values.
   - Tries to fetch the saved `form-config.json` from the Frontend folder.
   - Runs the first sync so the preview appears immediately.

---

## The Shared Data — `shared/AppConstants.js`

This file is just a bag of **frozen** (read-only) objects. Nothing in here ever changes at runtime.

```
PRESETS          ← six colour/style bundles (default, dark, ocean, rose, forest, custom)
PRESET_SWATCHES  ← the two colours shown on each preset button circle
INPUT_TYPES      ← the list in the Type dropdown ('text', 'email', 'number', …)
DEFAULT_CONFIG   ← what the form looks like when you first open the app
```

**Why freeze them?**
`Object.freeze()` stops any code from accidentally overwriting a preset.
If you tried to write `PRESETS.dark.bgColor = 'red'` it would silently fail,
keeping the originals safe.

---

## The Model — `models/ConfigModel.js`

**One job:** be the single place where the current form configuration lives.

```
this._config        ← the full config object (pages, style, transitions, …)
this._activePreset  ← which preset name is currently selected
```

Every mutation goes through a method. For example:

```javascript
model.addPage()              // pushes a new blank page into _config.pages
model.setInputField(0,1,'name','Email')  // sets page 0, input 1's name to "Email"
model.applyPreset('dark')    // copies the dark preset tokens into _config.style
```

The model **never** touches `document` or any HTML element.
It only holds and returns data.

**Why does this matter?**
If you ever wanted to save the config to a server instead of a file, you'd
only change this one file. The views and controller don't need to know.

---

## The Views

### `views/EditorView.js` — the editor panel

This class handles everything on the **left side** of the screen.

**Reading from the DOM (UI → data):**
```javascript
editorView.readConfigFromUI(pages, activePreset)
// Reads every input/select/color control and returns a plain config object.
```

**Writing to the DOM (data → UI):**
```javascript
editorView.loadConfigIntoUI(cfg, activePreset)
// Fills in every control from a config object (used when loading a file).

editorView.renderPages(pages)
// Wipes and rebuilds the entire pages list from scratch.
```

**Events — how user actions reach the controller:**
`EditorView` does *not* call the controller directly. Instead, the controller passes
a `handlers` object when creating the view:

```javascript
new EditorView({
  onAddPage:    () => ...,
  onRemovePage: (pi) => ...,
  // … etc.
})
```

When the user clicks **＋ Add Page**, `EditorView` calls `handlers.onAddPage()`.
The controller decides what to do next.
This keeps the View "dumb" — it doesn't need to know about the model at all.

**Event delegation:**
Instead of attaching a click listener to every single input row, the view attaches
**one listener per page card** to the entire list inside it.
When a click arrives, it checks `event.target` to figure out which row was clicked.
This is much more efficient and means old listeners don't pile up when rows are re-rendered.

### `views/PreviewView.js` — the output panel

Tiny class with just two jobs:

```javascript
previewView.updatePreview(htmlString)
// Drops an HTML string into the iframe's srcdoc attribute.
// The browser renders it as a completely separate mini-page.

previewView.updateJSON(configObject)
// Stringifies the config and puts it in the JSON textarea.
```

---

## The Service — `services/FormGenerator.js`

This class takes a config object and **builds an entire HTML document as a string**.
It has no side effects — give it the same config twice and you get the same HTML twice.

```
generate(cfg)
  └── _buildPage(page, index, total)
        └── _buildInput(inp)
  └── _buildStyles(styleTokens, focusShadow)
  └── _buildScript(totalPages, transition, duration, delay)
```

`_buildStyles()` inlines all the CSS directly into the generated HTML — this is why
the preview form looks correct even though it's inside an iframe with no external stylesheets.

`_buildScript()` embeds the navigation JavaScript inside a `<script>` tag in the output.
That script handles the **Next / Previous** button logic and the page transitions
entirely on its own, with no connection back to the Customizer.

---

## The Controller — `controllers/AppController.js`

The controller is the **brain**. It owns instances of everything else and decides
what happens when an event fires.

```javascript
this._model       = new ConfigModel();
this._editorView  = new EditorView(this._buildHandlers());
this._previewView = new PreviewView();
this._generator   = new FormGenerator();
```

### The Sync Pipeline

Every time anything changes in the editor, this chain runs:

```
User changes a control
        │
        ▼
EditorView fires onSyncAll callback
        │
        ▼
AppController.syncAll()  ← debounced 120ms (waits for typing to stop)
        │
        ▼
AppController._sync()
        │
        ├── _buildConfig()         ← reads UI + merges with model pages
        │       │
        │       └── editorView.readConfigFromUI(pages, preset)
        │
        ├── previewView.updateJSON(cfg)    ← updates the JSON textarea
        └── previewView.updatePreview(     ← updates the iframe
                generator.generate(cfg)
            )
```

**What is debouncing?**
Without debouncing, every single key press would rebuild the entire preview —
very wasteful. Debouncing means: *"wait until the user stops typing for 120ms,
then run once."* This keeps the UI smooth.

### File Upload Flow

```
User picks a file  →  FileReader reads it as text
                   →  JSON.parse turns it into an object
                   →  model.loadConfig(parsed)
                   →  editorView.loadConfigIntoUI(...)
                   →  _sync()  →  preview updates
```

---

## The Entry Point — `app.js`

`app.js` does two things and nothing else:

1. Creates the `AppController` and assigns it to a global variable called `app`.
2. Provides short **shim functions** like `downloadJSON()` and `syncAll()` that
   the HTML buttons can call directly.

```javascript
// index.html button:
<button onclick="downloadJSON()">⬇️ Download JSON</button>

// app.js shim:
function downloadJSON() { app.downloadJSON(); }

// AppController method does the real work:
downloadJSON() {
  const cfg = this._buildConfig();
  // … create Blob, trigger download …
}
```

This pattern keeps `onclick=""` attributes in the HTML short and readable while
all actual logic stays inside the class.

---

## The Utilities — `ColorUtils.js`

A static helper class (you never `new` it — just call `ColorUtils.someMethod()`).

| Method | What it does |
|---|---|
| `normalizeHex(val)` | Turns `#abc` into `#aabbcc`. Returns `#000000` for garbage input. |
| `hexToRgb(hex)` | Turns `#4f46e5` into `"79,70,229"` — used to build `rgba()` focus shadows. |
| `escHtml(str)` | Replaces `<`, `>`, `&`, `"` with safe HTML entities so user text can't break the page layout. |

---

## The Styling — `css/style.css`

All CSS variables are defined at the top in `:root { }`.
Changing one variable (like `--accent`) updates every button, border, and highlight
that uses it — no need to hunt through the file.

The layout uses **CSS Grid**:
```css
body {
  grid-template-columns: 380px 1fr;   /* editor | preview */
  grid-template-rows: 56px calc(100vh - 56px); /* header | content */
}
```

The **editor tabs** work by toggling a CSS class:
- `.editor-tab` has `display: none`
- `.editor-tab.active` has `display: flex`

When the controller calls `editorView.switchEditorTab('style')`,
it removes `.active` from all tabs and adds it to only the `#etab-style` element.
Pure CSS takes care of the rest — no animation library needed.

---

## Glossary for Beginners

| Term | Plain-English meaning |
|---|---|
| **MVC** | A way of organising code into three separate jobs: data (Model), screen (View), logic (Controller). |
| **Class** | A blueprint for creating objects. Like a recipe — you follow it to make an instance. |
| **Instance** | One specific object created from a class. `new AppController()` creates one instance. |
| **Method** | A function that belongs to a class. Called with `object.method()`. |
| **Debounce** | Wait until the user stops doing something before reacting — avoids doing work too many times. |
| **Event delegation** | Attach one listener to a parent element instead of many listeners to each child. |
| **Freeze / immutable** | Data that can't be changed after it's created. |
| **srcdoc** | An HTML attribute on `<iframe>` that lets you set the iframe's content directly as a string. |
| **Hex colour** | A colour written as `#RRGGBB` — six letters/numbers after a `#`. |
| **JSON** | A text format for storing structured data. Looks like `{ "key": "value" }`. |

---

*Last updated: May 2026*

