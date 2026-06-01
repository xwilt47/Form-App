# 📖 How to Use Form_Man
### A beginner-friendly guide — no coding required beyond running one command!

---

## What Is Form_Man?

**Form_Man** is the engine that turns a simple JSON settings file into a
real, working, multi-page HTML form you can open in any browser.

You describe your form in a file called **`form-config.json`** — how many pages,
what fields, what animations — and Form_Man builds the complete HTML for you.

---

## What You Need First

| Requirement | How to get it |
|---|---|
| **Node.js** (v18 or newer) | Download from [nodejs.org](https://nodejs.org) — pick the "LTS" version |
| **A terminal / command prompt** | Already on your computer. Search "Terminal" or "PowerShell". |
| The **Form_Man** folder | Already in this project at `Form_Man/` |

---

## Quick-Start (3 steps)

### Step 1 — Install dependencies (once only)

Open a terminal, navigate to the `Form_Man` folder, and run:

```bash
npm install
```

This downloads the TypeScript compiler. You only need to do this once.

### Step 2 — Edit your config

Open this file in any text editor (Notepad works fine):

```
Form_Man/src/config/form-config.json
```

> 💡 **Tip:** Use the **Customizer** visual editor instead of editing by hand —
> it's much easier and has a live preview. Download the JSON from there and
> drop it into `Form_Man/src/config/`.

### Step 3 — Generate your form

Back in the terminal (still in the `Form_Man` folder), run:

```bash
npm start
```

When it finishes you'll see:

```
📖 Loading form config...
✅ Config loaded: "My Form Title"
   Pages   : 2
   Page 1 : "Personal Info" — 3 input(s)
   Page 2 : "Contact" — 2 input(s)

⚙️  Generating HTML...

✨ Form generated → .../Frontend/output/form.html
```

Open the file it points to in your browser — that's your finished form! 🎉

---

## Editing `form-config.json` by Hand

The config file is plain text in **JSON format**. Here's what each part means:

### Top-level settings

```json
{
  "formTitle": "My Form",
  "transition": "slide",
  "transitionDuration": "0.4s",
  "transitionDelay": "0s",
  "pages": [ ... ]
}
```

| Key | What it does | Options |
|---|---|---|
| `formTitle` | The heading at the top of the form | Any text |
| `transition` | Page-turn animation | `"slide"` `"fade"` `"vertical"` `"zoom"` |
| `transitionDuration` | How long the animation takes | `"0.4s"`, `"200ms"`, etc. |
| `transitionDelay` | Pause between old page leaving and new one arriving | `"0s"`, `"0.1s"`, etc. |

### Style settings

```json
"style": {
  "preset": "default",
  "accentColor": "#4f46e5",
  "bgColor": "#f0f4f8",
  "cardColor": "#ffffff"
}
```

These control the colours and look of the form. The easiest way to set them
is through the **Customizer** — but you can type hex colour codes manually too.

### Pages

```json
"pages": [
  {
    "pageTitle": "Personal Info",
    "inputs": [ ... ]
  }
]
```

Each item in `pages` is one step of the multi-step form.

### Inputs (fields on a page)

```json
"inputs": [
  {
    "name": "First Name",
    "type": "text",
    "limit": 50,
    "required": true,
    "placeholder": "Enter your first name"
  }
]
```

| Key | Required? | What it does |
|---|---|---|
| `name` | ✅ Yes | The label shown above the field |
| `type` | ✅ Yes | Input type — see table below |
| `limit` | ✅ Yes | Max characters (text) or max value (number) |
| `required` | No | If `true`, the user must fill this in before going to the next page |
| `placeholder` | No | Grey hint text inside the box. Defaults to the field name. |

### Supported input types

| Type | What the user sees |
|---|---|
| `"text"` | A single-line text box |
| `"email"` | Text box — browser checks for `@` |
| `"number"` | Number spinner |
| `"password"` | Text box where input is hidden |
| `"url"` | Text box — browser checks for a valid URL |
| `"tel"` | Text box optimised for phone numbers |
| `"date"` | A date picker |
| `"textarea"` | A multi-line text area |

---

## npm Scripts Reference

Run these from inside the `Form_Man` folder:

| Command | What it does |
|---|---|
| `npm install` | Downloads dependencies (run once) |
| `npm start` | Full pipeline — compile → copy config → generate form |
| `npm run generate` | Same as `npm start` |
| `npm run build` | Compiles TypeScript only (no form generated) |

---

## Where Does the Output Go?

The finished HTML file is saved to:

```
Frontend/output/form.html
```

Just double-click that file to open it in your browser.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm: command not found` | Install Node.js from nodejs.org first |
| `Config file not found` | Make sure `form-config.json` is in `Form_Man/src/config/` |
| `formTitle is required` | Open `form-config.json` and make sure `formTitle` has a value |
| `At least one page is required` | Your `pages` array is empty — add at least one page |
| `limit must be a positive number` | Every input needs a `limit` greater than 0 |
| Form generates but looks plain | Check that `style` settings are in your config |
| TypeScript errors on `npm start` | Run `npm install` first — the compiler may be missing |

---

*Last updated: May 2026*

