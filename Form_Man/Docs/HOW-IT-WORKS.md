# 🔧 How It Works — Code Explanation
### A plain-English walkthrough of Form_Man's code structure

---

## The Big Picture

Form_Man is a **Node.js command-line tool** written in TypeScript.
You run it once; it reads a JSON config file and writes a complete HTML form to disk.

It follows the **MVC + OOP** pattern — the same pattern used by the Customizer:

```
  form-config.json  (your settings)
         │
         ▼
  📦  MODEL  — loads and holds the config data
         │
         ▼
  🧠  CONTROLLER — orchestrates the pipeline
         │
         ▼
  🖥️  VIEW  — builds the HTML document
         │
         ▼
  output/form.html  (your finished form)
```

---

## File Map

```
Form_Man/
├── package.json                   ← npm scripts and dependencies
├── tsconfig.json                  ← TypeScript compiler settings
└── src/
    ├── index.ts                   ← Entry point — boots FormController
    ├── ConfigLoader.ts            ← Reads form-config.json from disk
    │
    ├── types/                     ← TypeScript type definitions
    │   ├── index.ts               ← Barrel re-export (one import for all types)
    │   ├── InputTypes.ts          ← InputType union + InputConfig interface
    │   ├── PageTypes.ts           ← PageConfig interface
    │   └── FormTypes.ts           ← TransitionType + FormConfig interface
    │
    ├── validators/
    │   └── ConfigValidator.ts     ← Validates the shape of the config object
    │
    ├── models/
    │   └── FormConfigModel.ts     ← Owns the config data, exposes typed getters
    │
    ├── views/
    │   ├── FormView.ts            ← Top-level HTML assembler
    │   ├── PageBuilder.ts         ← Renders one form page
    │   ├── InputBuilder.ts        ← Renders one input field / textarea
    │   ├── StyleBuilder.ts        ← Builds the inline <style> CSS block
    │   └── ScriptBuilder.ts       ← Builds the inline <script> JS block
    │
    ├── controllers/
    │   └── FormController.ts      ← Orchestrates Model → View → write to disk
    │
    └── config/
        └── form-config.json       ← The config file that drives everything
```

---

## Compile & Build Flow

Form_Man is written in **TypeScript**, which browsers and Node.js can't run directly.
It must be **compiled** to plain JavaScript first.

### npm scripts

| Script | Command | What it does |
|---|---|---|
| `build` | `tsc` | Compiles all `.ts` files in `src/` → `.js` files in `dist/` |
| `copy-config` | `node -e "…"` | Copies `form-config.json` into `dist/config/` so Node can find it |
| `generate` | `build → copy-config → node dist/index.js` | Full pipeline |
| `start` | same as `generate` | Alias for convenience |

### Step-by-step flow

```
1. npm start
        │
        ▼
2. tsc  (TypeScript compiler)
   Reads tsconfig.json — compiles all src/**/*.ts → dist/**/*.js
        │
        ▼
3. copy-config script
   src/config/form-config.json  →  dist/config/form-config.json
        │
        ▼
4. node dist/index.js
   │
   ├── new FormController(configPath, outputPath)
   │         │
   │         ├── new FormConfigModel(configPath)
   │         │       └── ConfigLoader.load()
   │         │             └── ConfigValidator.validate()
   │         │
   │         └── .run()
   │               ├── model.toConfig()          →  raw FormConfig object
   │               ├── FormView.render(config)
   │               │     ├── StyleBuilder.build()              → CSS string
   │               │     ├── PageBuilder.build() × N pages
   │               │     │     └── InputBuilder.build() × M inputs
   │               │     ├── ScriptBuilder.build()             → JS string
   │               │     └── assembles full HTML document string
   │               └── fs.writeFileSync()        →  output/form.html
        │
        ▼
5. Frontend/output/form.html  ← open in any browser
```

### TypeScript compiler settings (`tsconfig.json`)

| Setting | Value | Why |
|---|---|---|
| `target` | `es2016` | Compiled JS uses modern-but-safe syntax current Node supports |
| `module` | `commonjs` | Node uses `require()` — this matches that |
| `esModuleInterop` | `true` | Lets you write `import fs from 'fs'` cleanly |
| `strict` | `true` | Catches more bugs at compile time |
| `skipLibCheck` | `true` | Skips type-checking inside `node_modules` — speeds up builds |
| `outDir` | `../dist` | Keeps compiled files out of the `src/` folder |

---

## The Types — `src/types/`

Pure TypeScript — no logic, no side effects. Just the shapes of the data objects.

| File | What it defines |
|---|---|
| `InputTypes.ts` | `InputType` (union of allowed type strings) + `InputConfig` (one field) |
| `PageTypes.ts` | `PageConfig` (one form page with its inputs array) |
| `FormTypes.ts` | `TransitionType` (union of animation names) + `FormConfig` (the full config root) |
| `index.ts` | Re-exports everything so other files can write `import { FormConfig } from "../types"` |

**What is a TypeScript interface?**
An interface is a contract — it says "any object claiming to be a `FormConfig`
must have these fields with these types." If you write `"formTitel"` (typo), TypeScript
catches it at compile time before you even run the code.

---

## The Validator — `src/validators/ConfigValidator.ts`

**One job:** check that a parsed JSON object is a valid `FormConfig`.

```
validate(config)
  └── _validateRoot(config)         ← checks formTitle + pages array exists
  └── _validatePage(page, index)    ← checks pageTitle + inputs array exist
        └── _validateInput(input)   ← checks name, type, and limit are present
```

If anything is wrong it throws a clear English error message, e.g.:

```
Page 2 ("Contact"), input 1 ("Email"): limit must be a positive number.
```

**Why is it separate from ConfigLoader?**
ConfigLoader handles file I/O. ConfigValidator handles data rules.
Each class has one job. If the validation rules change, you edit one file.
If the file format changes (e.g. YAML instead of JSON), you edit the other.

---

## The Model — `src/models/FormConfigModel.ts`

**One job:** own the loaded config and hand out data through typed getters.

```javascript
const model = new FormConfigModel("/path/to/form-config.json");

model.formTitle          // → "My Form"
model.pages              // → PageConfig[]
model.pageCount          // → 2
model.transition         // → "slide" (defaults to "slide" if not set)
model.transitionDuration // → "0.4s"
model.transitionDelay    // → "0s"
model.toConfig()         // → a shallow copy of the raw FormConfig object
```

The model **never** touches the file system, the terminal, or any HTML.
It just holds data and returns it when asked.

**Why use getters instead of exposing `_config` directly?**
Getters let you apply defaults in one place. `transition ?? "slide"` means
if the config didn't set a transition, every caller automatically gets `"slide"` —
without having to remember to check everywhere.

---

## The ConfigLoader — `src/ConfigLoader.ts`

**One job:** read a JSON file from disk and return a parsed, validated `FormConfig`.

```
ConfigLoader.load(filePath)
  1. Resolves the absolute path
  2. Checks the file exists  →  throws if missing
  3. Reads the file as UTF-8 text
  4. JSON.parse() turns the text into an object
  5. Delegates to ConfigValidator.validate()
  6. Returns the validated FormConfig
```

It also supports instance usage (for dependency injection / testing):

```typescript
const loader = new ConfigLoader(myCustomValidator);
const config = loader.load("/path/to/config.json");
```

---

## The Views — `src/views/`

The views are pure HTML/CSS/JS string builders. They take data in, return strings out,
and never touch the file system or console.

### `FormView.ts` — top-level assembler

```
FormView.render(config)
  │
  ├── StyleBuilder.build()             → styles string
  ├── PageBuilder.build() × each page  → pages HTML string
  └── ScriptBuilder.build()            → script string
  │
  └── wraps everything in the HTML document skeleton:
      <!DOCTYPE html> … <head> … <body> … </html>
```

Dependencies (`PageBuilder`, `StyleBuilder`, `ScriptBuilder`) are injected via
the constructor — you can swap them in tests without changing `FormView`.

### `PageBuilder.ts` — one form page

```
PageBuilder.build(page, index, total)
  │
  ├── Renders the page heading and counter ("Page 1 of 3")
  ├── Calls InputBuilder.build() for each input
  └── Adds nav buttons (← Previous | Next → | Submit ✓)
      depending on whether this is the first, middle, or last page
```

### `InputBuilder.ts` — one input field

Takes one `InputConfig` and returns the HTML for that field:

```html
<div class="form-group">
  <label for="first-name">First Name</label>
  <input type="text" id="first-name" maxlength="50" required />
  <small class="limit-hint">Max 50 characters</small>
</div>
```

It also converts the field `name` (e.g. `"First Name"`) into a safe HTML
`id` attribute (`"first-name"`) by lowercasing and replacing spaces with `-`.

### `StyleBuilder.ts` — the CSS

Returns one large `<style>` block string containing all the CSS for the
generated form — layout, colours, animations, transitions. No external
stylesheet is needed because everything is inlined.

All four transition types (`slide`, `fade`, `vertical`, `zoom`) have their
`@keyframes` defined here, even if only one is used. The embedded script
picks the right CSS class names at runtime.

### `ScriptBuilder.ts` — the JavaScript

Returns a `<script>` block that is embedded in the output HTML.
This script is completely self-contained — it runs inside the form file
and has no connection back to Form_Man or the Customizer.

What the script does:
- `navigate(currentIndex, direction)` — validates required fields, runs the
  transition animation, shows the next page
- `getClasses(direction)` — picks the right CSS animation class names based on
  `transitionType` (slide / fade / vertical / zoom)
- `updateProgress(pageIndex)` — moves the progress bar at the top
- `cssTimeToMs(val)` — converts `"0.4s"` or `"400ms"` to a number for `setTimeout`
- Locks the track height during transitions so the card never resizes mid-animation
- Submit handler — collects form data, hides the form, shows the success message

---

## The Controller — `src/controllers/FormController.ts`

The controller is the **only** class that has side effects (reads files, writes files, logs to the console). Everything else is pure functions or data holders.

```
FormController(configPath, outputPath, view?)
  │
  └── .run()
        │
        ├── 1. new FormConfigModel(configPath)   ← load + validate
        │       Logs: Pages, page names, input counts
        │
        ├── 2. view.render(model.toConfig())     ← build HTML string
        │
        └── 3. fs.writeFileSync(outputPath, html) ← write to disk
                Logs: output path
```

The `view` parameter is optional — it defaults to `new FormView()`.
Passing a different view in makes the controller testable without touching the file system.

---

## The Entry Point — `src/index.ts`

```typescript
import * as path from "path";
import { FormController } from "./controllers/FormController";

const CONFIG_PATH = path.resolve(__dirname, "config/form-config.json");
const OUTPUT_PATH = path.resolve(__dirname, "../Frontend/output/form.html");

new FormController(CONFIG_PATH, OUTPUT_PATH).run();
```

That's it — four lines. The entry point does nothing itself. It just resolves
the two file paths and hands them to the controller.

`__dirname` is a Node.js built-in that means "the folder this file is in".
Using `path.resolve(__dirname, "…")` means the paths always work regardless
of which directory you run the command from.

---

## How It All Connects (data flow summary)

```
form-config.json
      │  (read by)
      ▼
ConfigLoader  →  ConfigValidator  →  validated FormConfig object
                                              │  (stored by)
                                              ▼
                                      FormConfigModel
                                              │  (toConfig())
                                              ▼
                                       FormController
                                              │  (passes config to)
                                              ▼
                                          FormView
                                    ┌────────┼────────┐
                                    ▼        ▼        ▼
                               StyleBuilder  ScriptBuilder
                                         PageBuilder
                                            │
                                            ▼
                                      InputBuilder
                                            │
                               (all strings assembled into)
                                            ▼
                                   complete HTML string
                                            │  (written by)
                                            ▼
                               Frontend/output/form.html
```

---

## Glossary for Beginners

| Term | Plain-English meaning |
|---|---|
| **TypeScript** | JavaScript with type-checking added. Catches mistakes before you run the code. |
| **Compile** | Translate TypeScript (`.ts`) into JavaScript (`.js`) that Node.js can run. |
| **MVC** | Model · View · Controller — three separate jobs so code stays organised. |
| **Class** | A blueprint for objects. `new FormController(…)` creates one instance from the blueprint. |
| **Interface** | A TypeScript "contract" — describes what fields an object must have. |
| **Getter** | A property on a class that runs a small function when you read it (e.g. `model.transition`). |
| **Dependency injection** | Passing a collaborator into a class via the constructor instead of hard-coding it inside. Makes testing easier. |
| **Barrel file** | A file (usually `index.ts`) that just re-exports things from other files in the same folder. |
| **`__dirname`** | Node.js built-in — the absolute path of the folder the current file lives in. |
| **JSON** | A text format for structured data. Looks like `{ "key": "value" }`. |
| **Inline CSS/JS** | Styles and scripts written directly inside the HTML file rather than in separate `.css` / `.js` files. |
| **`@keyframes`** | CSS syntax for defining an animation (e.g. slide in from the right). |
| **Debounce** | Wait until the user stops doing something before reacting — not used in Form_Man but used in the Customizer. |

---

*Last updated: May 2026*

