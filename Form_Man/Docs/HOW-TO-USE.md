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

`npm start` produces **two files**:

| File | What it is |
|---|---|
| `Frontend/output/form.html` | The multi-step HTML form — open in any browser |
| `Frontend/output/api.py` | A ready-to-run FastAPI Python server |

---

## Running the Python API

The generated `api.py` is a full REST API server.  When the form is submitted
it **automatically calls the API** and slides the JSON response into view — the
same animation as the page transitions.

### 1 — Install Python dependencies (once only)

```bash
pip install fastapi "uvicorn[standard]" pydantic[email]
```

### 2 — Start the server

```bash
python api.py
```

You'll see:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### 3 — Fill in and submit the form

Open `Frontend/output/form.html` in your browser, fill in every page, then click
**Submit ✓**.  The form will:

1. Animate the last page out using your configured transition.
2. Slide in the **Result** screen.
3. POST your answers to `http://localhost:8000/submit`.
4. Display the full JSON response from the API in a dark code box.
5. Show a **📋 Copy** button to copy the JSON to your clipboard.

> ⚠️ If the Python server is **not** running when you submit, the result slide
> still appears but shows an error message telling you to start `python api.py`.

### 4 — Explore the API directly in browser

| URL | What you get |
|---|---|
| `http://localhost:8000/docs` | **Swagger UI** — interactive JSON explorer, try every endpoint |
| `http://localhost:8000/redoc` | **ReDoc** — clean read-only API reference |
| `http://localhost:8000/` | Form metadata as JSON |
| `http://localhost:8000/schema` | Full form schema as JSON |
| `http://localhost:8000/pages` | All pages and fields as JSON |
| `http://localhost:8000/pages/0` | Just page 1 as JSON |

### Available endpoints

| Method | Path | What it does |
|---|---|---|
| `GET` | `/` | Form title and page count |
| `GET` | `/schema` | Full schema matching `form-config.json` |
| `GET` | `/pages` | Array of all page schemas |
| `GET` | `/pages/{index}` | One page schema (0 = first page) |
| `POST` | `/submit` | Submit the entire form at once |
| `POST` | `/submit/{index}` | Submit one page (0 = first page) |

> 💡 **Tip:** The Swagger UI at `/docs` lets you fill in and POST data directly
> in the browser — no extra tools needed.

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
| `python api.py` not found | Run `pip install fastapi "uvicorn[standard]" pydantic[email]` first |
| `ModuleNotFoundError: No module named 'fastapi'` | Same as above — pip install the dependencies |
| `Address already in use` on port 8000 | Another process is using port 8000. Stop it or change the port in `api.py` |
| POST /submit returns 422 | A required field is missing or a value exceeds the limit |

---

*Last updated: May 2026*

