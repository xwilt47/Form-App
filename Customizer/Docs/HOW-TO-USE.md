# 📖 How to Use the Form Config Customizer
### A beginner-friendly guide — no coding required!

---

## What Is This?

The **Form Config Customizer** is a visual editor that lets you design a multi-page form
without writing any code. You click, type, and pick colours — it does the rest.

When you're happy with your form, you download a **`form-config.json`** file.
That file tells the app exactly how your form should look and behave.

---

## Opening the Customizer

1. Find the `Customizer` folder on your computer.
2. Double-click **`index.html`** to open it in your web browser
   *(Chrome or Edge work best)*.
3. You'll see the editor on the left and a live preview on the right.

---

## The Layout at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Form Config Customizer          🔄 Refresh  ⬇️ Download  │  ← Top bar
├──────┬──────────────────────┬────────────────────────────────┤
│ Tab  │                      │                                │
│ Nav  │   Editor Controls    │      Live Preview / JSON       │
│      │                      │                                │
│ 📝   │  (change things here)│  (see your form update here)  │
│ 🎨   │                      │                                │
│ 📄   │                      │                                │
└──────┴──────────────────────┴────────────────────────────────┘
```

---

## Step 1 — General Settings (📝 tab)

Click the **📝 General** tab on the left side bar.

| Setting | What it does |
|---|---|
| **Form Title** | The big heading shown at the top of your form. |
| **Page Transition** | The animation that plays when moving between pages. Choose Slide, Vertical Slide, Fade, or Zoom. |
| **Transition Duration** | How long the animation takes. `0.4s` = 0.4 seconds. Try `0.2s` for snappy, `0.8s` for slow. |
| **Transition Delay** | A pause *between* the old page leaving and the new page arriving. `0s` means no pause. |

> 💡 **Tip:** The preview on the right updates automatically as you type!

---

## Step 2 — Style Your Form (🎨 tab)

Click the **🎨 Style** tab.

### Pick a Preset Theme

At the top you'll see six coloured circles — these are **ready-made themes**:

| Theme | Vibe |
|---|---|
| **default** | Clean purple & white |
| **dark** | Dark mode |
| **ocean** | Cool blues |
| **rose** | Warm pinks |
| **forest** | Fresh greens |
| **custom** | Start from scratch |

Click any circle to apply that theme instantly.

### Fine-Tune the Colours

Every colour has two controls side by side:
- **The square colour picker** — click it to open a colour wheel.
- **The text box** — type a hex code like `#ff0000` for red.

Either control updates the other automatically.

| Colour setting | What it affects |
|---|---|
| **Accent** | Buttons, progress bar, focus rings |
| **Accent Hover** | Button colour when you hover over it |
| **Background** | The page background behind the card |
| **Card Color** | The white box the form sits in |
| **Heading** | The form title and page title text |
| **Label** | The small text above each input field |
| **Input Border** | The outline around text boxes |
| **Input BG** | The fill colour inside text boxes |
| **Input Text** | What the user types — that text colour |

### Layout & Typography

| Setting | What it does |
|---|---|
| **Card Radius** | How rounded the corners of the form card are. `0px` = sharp, `20px` = very round. |
| **Anim Speed** | Speed of the input-focus animation (usually fine to leave as-is). |
| **Font Family** | The font used everywhere. E.g. `'Georgia', serif` for a classic look. |
| **Card Shadow** | The drop-shadow under the form card. Leave blank to remove it. |

---

## Step 3 — Build Your Pages (📄 tab)

Click the **📄 Pages** tab.

### Adding a Page

Click **＋ Add Page** at the bottom. A new page card appears.

### Editing a Page

Each page card has:
- A **Page Title** field — this becomes the heading on that page of the form.
- A table of **input fields** (rows) with four columns:

| Column | What to fill in |
|---|---|
| **Name** | The label shown above the input (e.g. "First Name") |
| **Type** | What kind of input: `text`, `email`, `number`, `password`, `date`, `textarea`, etc. |
| **Limit** | Maximum characters allowed (or max value for number fields) |
| **Req** | The **–/✓** toggle. Click it to make the field required (turns green ✓). |

### Adding / Removing Fields

- Click **＋ Add Input** inside a page to add a new row.
- Click the **×** on the right of a row to delete that field.
- Click the **×** in a page card's header to delete the entire page.

> ⚠️ You must have at least **1 page** and **1 field per page** — the app will warn you if you try to go below that.

### Collapsing Pages

Click anywhere on the grey page header bar to collapse / expand that page card.
Useful when you have many pages and want to keep things tidy.

---

## Step 4 — Check the Live Preview

On the right panel, the **👁 Live Preview** tab shows exactly what your form will
look like in a browser. You can even click the **Next →** button inside the preview
to test your transitions!

Switch to **{ } JSON Output** to see the raw config data that drives everything.

---

## Step 5 — Save Your Work

### Download the JSON file

Click **⬇️ Download JSON** in the top-right corner.
This saves a file called **`form-config.json`** to your Downloads folder.

That file is what the Book App reads to generate the real form.
Copy it into the `Frontend/src/config/` folder to apply your design.

### Copy to Clipboard

Switch to the **{ } JSON Output** tab and click **📋 Copy** to copy the JSON
directly — useful for pasting into another tool or saving somewhere else.

---

## Loading a Previous Design

Click **📂 Load JSON** in the top bar and select any `form-config.json` file you
saved before. The editor will load all your settings back in so you can keep editing.

---

## Quick Troubleshooting

| Problem | Fix |
|---|---|
| Preview looks blank | Click **🔄 Refresh Preview** in the top bar. |
| Colours not updating | Make sure you typed a valid hex code starting with `#`. |
| Can't delete a page | You must have at least one page. Add another first. |
| Transition isn't working | Check the **Transition Duration** isn't set to `0s`. |
| JSON looks wrong after loading | The file may be corrupted. Try downloading a fresh copy. |

---

*Last updated: May 2026*

