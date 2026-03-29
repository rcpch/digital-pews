# CLAUDE.md — Digital PEWS

## What this project is

A plain HTML/CSS/JS implementation of the NHS National Paediatric Early Warning System (NPEWS) observation chart. No framework, no build step, no runtime dependencies. The chart renders vital signs over time on `<canvas>` elements, with colour-coded PEWS scoring bands matched to the NHS paper chart.

This is a **clinical safety tool**. Visual accuracy and spec compliance matter more than aesthetics. When in doubt, match the NHS reference chart.

---

## Project stack

- **Vanilla JS, HTML, CSS** — no framework, no transpilation
- **Canvas** — all chart rendering is done with the 2D Canvas API
- **Storybook 8** (HTML/Vite) — component development and visual testing
- **Docker Compose** — local dev (`s/up`, `s/up demo`, `s/up storybook`)
- Demo app: http://localhost:8000 | Storybook: http://localhost:6006

### Script load order (must not change)
```
npews-scoring-config.js  →  demo-data.js  →  chart.js
```
Files use global scope, not ES modules. They must load in this exact order.

---

## Visual reference

**Primary reference:** `reference-sources/images/chart-5-12-years-1.png`

All four age band references:
- `reference-sources/images/chart-0-11-months-1.png`
- `reference-sources/images/chart-1-4-years-1.png`
- `reference-sources/images/chart-5-12-years-1.png`
- `reference-sources/images/chart-13-years-1.png`

When working on visual fidelity: open the reference image and the running chart side by side. The goal is pixel-level match to the NHS paper chart.

When asking for visual work, **share a screenshot** of the current rendered state alongside the reference image. This is far more precise than text descriptions.

---

## Design tokens

All colours, spacing, and typography are defined as CSS custom properties in `pews-chart/styles.css`.

### PEWS band colours (clinically mandated — do not change)
```css
--band-white:  #ffffff   /* normal */
--band-yellow: #ffeda0   /* low concern */
--band-orange: #ffb366   /* moderate concern */
--band-pink:   #ffb3d9   /* high concern */
```

### Escalation level colours
```css
--esc-low:       #1d70b8   /* text: #ffffff */
--esc-medium:    #ffdd00   /* text: #0b0c0c */
--esc-high:      #f47738   /* text: #ffffff */
--esc-emergency: #d4351c   /* text: #ffffff */
```

### UI chrome
```css
--page-bg:        #f3f2f1
--surface:        #ffffff
--border:         #b1b4b6
--text-primary:   #0b0c0c
--text-secondary: #505a5f
--focus-ring:     #ffdd00
--chart-bg:       #f8f8f8
```

### Chart structure colours
```css
/* Section labels (col 1) */  background: #003087   /* NHS navy */
/* Parameter labels (col 2) */ background: #005eb8  /* NHS blue */
```

### Colour-blind mode
Activated by `.cb-mode` on `<body>`. Higher-contrast overrides for band and escalation colours are in `styles.css`. **Never remove this mode.**

### Typography
```css
--font: 'Lato', 'Trebuchet MS', Helvetica, Arial, sans-serif;
```
Lato approximates Frutiger (the NHS typeface). Implementers with a Frutiger licence override `--font` in a local stylesheet — the canvas `chartFont()` helper reads this at render time automatically.

---

## Layout system

Three modes, set via `data-layout` attribute on `<body>`:

| Mode | Trigger | Chart height |
|------|---------|-------------|
| `landscape` | >1200px or toolbar | 140px |
| `portrait`  | 768–1199px or toolbar | 90px |
| `mobile`    | <768px or toolbar | 70px |

The CSS grid adjusts column widths per layout mode. Chart canvas heights are controlled by JS (`getChartHeight()`). Lock layout in code with `data-lock-layout="landscape"` on `<body>` (hides toolbar toggle).

### Chart grid columns
```
Col 1 (40px):  Section label — vertical text, NHS navy background
Col 2 (180px): Parameter label — name, unit, description, NHS blue background
Col 3 (1fr):   Canvas chart
```

---

## Age bands

| Band   | Label         | Header colour |
|--------|---------------|--------------|
| `0-11m` | 0 to 11 months | Pink |
| `1-4y`  | 1–4 Years      | Orange |
| `5-12y` | 5–12 Years     | Yellow |
| `13+y`  | 13+ Years      | Grey |

Currently only `5-12y` has complete demo data. The other three age bands have placeholder Storybook stories.

---

## Escalation levels

| Level | PEWS score | Colour |
|-------|-----------|--------|
| Low | 1–4 | Blue `#1d70b8` |
| Medium | 5–8 | Yellow `#ffdd00` |
| High | 9–12 | Orange `#f47738` |
| Emergency | ≥13 | Red `#d4351c` |

Escalation can also be triggered by Carer Question (W=Worse), Clinical Intuition (Yes=Concerned), or Specific Concern (sepsis, AVPU change), overriding the PEWS score-based level. See `spec/escalation.md` for full detail.

---

## Spec documents (read before making changes)

- `spec/spot-npews-ui-spec.md` — NHS SPOT/NPEWS UI specification (MOSCOW priorities). **Must** requirements are non-negotiable.
- `spec/npews-scoring.md` — Scoring rules by age band
- `spec/escalation.md` — Escalation level triggers and guidance
- `spec/data-model.md` — Patient, Observation, AgeBand, ScoringBand data structures
- `spec/observation-options.md` — Observation parameter definitions

---

## Hard constraints (never violate)

1. **Do not change band colours** (`--band-*`). They are clinically mandated by the NHS NPEWS specification.
2. **Do not change escalation colours** (`--esc-*`). Same reason.
3. **Do not add a framework**. This is intentionally dependency-free.
4. **Do not add a build step** to `pews-chart/`. Storybook has its own Vite build — that's fine. The demo app must stay plain HTML/CSS/JS.
5. **Do not break colour-blind mode**. Test any colour-adjacent change with `.cb-mode` on `<body>`.
6. **Do not draw a line over a skipped observation** (spec U3.10). A skip must cause a break in the line.
7. **Do not change script load order** in `index.html`.

---

## CSS conventions

- BEM-style class naming: `.chart-grid__label`, `.escalation-banner--high`
- Use CSS custom properties for all colours and typography — no hardcoded hex values in new rules
- Layout via CSS Grid and Flexbox
- Responsive via `body[data-layout="..."]` attribute selectors, not media queries alone
- Keep layout mode styles scoped: `body[data-layout="portrait"] .chart-grid { ... }`

---

## JS conventions

- ES6+ (arrow functions, destructuring, const/let, template literals)
- No classes unless the pattern clearly calls for it
- Canvas rendering lives in `chart.js` — keep it there
- Use `chartFont(size, weight)` for all canvas text (reads `--font` CSS variable)
- Data files (`npews-scoring-config.js`, `demo-data.js`) use global scope — this is intentional

---

## Storybook

Stories live in `pews-chart/*.stories.js`. Each story renders an `<iframe src="/pews-chart/index.html">`. Add new stories for new states you want to visually test. Storybook hot-reloads on save.

```javascript
export default { title: 'NPEWS/My Category' };

export const MyStory = {
  render: () => {
    const el = document.createElement('div');
    el.innerHTML = `<iframe src="/pews-chart/index.html" style="width:100%;height:800px;border:none;"></iframe>`;
    return el;
  },
};
```

---

## How to give visual feedback effectively

When asking for UI changes:

1. **Share a screenshot** of the current rendered state (paste image directly into chat)
2. Reference the relevant NHS chart image from `reference-sources/images/`
3. Reference the relevant spec requirement by ID (e.g. "per U3.6")
4. Describe the change in CSS terms where possible: colours by token name, layout by grid/flex terminology

Example of a good prompt:
> "The escalation banner at `--esc-emergency` needs more visual weight. See screenshot vs `reference-sources/images/chart-5-12-years-1.png`. Increase font size of `.escalation-banner__level` and add a stronger left border."
