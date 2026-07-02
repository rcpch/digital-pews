# CLAUDE.md — Digital PEWS

## What this project is

A plain HTML/CSS/JS implementation of the NHS National Paediatric Early Warning System (NPEWS) observation chart. No framework, no build step, no runtime dependencies. The chart renders vital signs over time on `<canvas>` elements, with colour-coded PEWS scoring bands matched to the NHS paper chart.

This is a **clinical safety tool**. Visual accuracy and spec compliance matter more than aesthetics. When in doubt, match the NHS reference chart.

---

## Project stack

- **Vanilla JS, HTML, CSS** — no runtime framework, no transpilation
- **Canvas** — all chart rendering is done with the 2D Canvas API
- **Web Component** — the chart is packaged as a framework-neutral `<npews-chart>` custom
  element (`npews-chart.js`) that takes a JSON `{ patient, observations }` object via its
  `.data` property. Works in plain HTML, React, Angular, Vue, or a SMART-on-FHIR app.
- **ES modules** — `pews-chart/` loads as native ES modules (no bundler, no build step)
- **Docker Compose** — local dev (`s/up` / `s/up demo`)
- Demo app: http://localhost:8000 (`/demo.html` = scenario harness · `/` = single chart ·
  `/embed-example.html` = minimal `<npews-chart>` drop-in)

### Module dependency graph
```
npews-scoring-config.js ─┐
npews-scorer.js          ├─→ chart.js ─→ npews-chart.js  (<npews-chart> element)
age-band.js              ┘        ▲
chart-shell.js ───────────────────┘
```
Files load as native ES modules and `import` their own dependencies — there is no fragile
global-script load order to preserve. A host page just imports `npews-chart.js` (module) and
feeds the `<npews-chart>` element its `{ patient, observations }` data. `demo-data.js` still
exposes `window.PATIENT`/`window.OBSERVATIONS` for the zero-config single-chart `index.html`.

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

All four age bands have demonstration scenarios in `pews-chart/scenarios.js` (shown in the `demo.html` sidebar), including a birthday-crossing scenario where a child turns 5 mid-admission. The two full-day datasets live in `demo-data.js`.

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

**Reference (transcriptions of the SPOT-NPEWS `.xlsx`):**
- `spec/spot-npews-ui-spec.md` — NHS SPOT/NPEWS UI specification (MOSCOW priorities). **Must** requirements are non-negotiable.
- `spec/spot-npews-spec.md` — NHS SPOT/NPEWS clinical/technical specification (`C*` IDs).

**Scoring (JSON is the source of truth):**
- `spec/npews-scoring-spec.json` — canonical numeric scoring spec; generates the runtime config + the table below (drift-tested).
- `spec/npews-scoring-tables.generated.md` — generated unified reference table (do not hand-edit).
- `spec/npews-scoring.md` — clinical narrative only (respiratory-distress descriptors, notes).

**Clinical policy & data:**
- `spec/escalation.md` — escalation levels, non-score triggers, sepsis, ISBAR.
- `spec/data-model.md` — the two input shapes (Patient, Observation) + data-entry reference codes.
- `spec/fhir.md` — FHIR adapter contract + conformance-testing approach.

**Project:**
- `spec/decisions.md` — durable decision log (ADR-style).
- `spec/implementation-notes.md` — implementation clarifications + visual QA checklist.
- `spec/react.md` — component-architecture decision (Web Component vs React).
- `spec/roadmap.md` — forward-looking work.

---

## Hard constraints (never violate)

1. **Do not change band colours** (`--band-*`). They are clinically mandated by the NHS NPEWS specification.
2. **Do not change escalation colours** (`--esc-*`). Same reason.
3. **Keep the runtime framework-neutral.** The chart core is plain HTML/CSS/JS packaged as a
   standards-based `<npews-chart>` Web Component with **no runtime framework dependency** — so it
   drops into any host (plain page, React, Angular, Vue, EHR/SMART-on-FHIR). Optional thin
   framework *wrappers* (e.g. a React wrapper over the element) are allowed, but the core must
   never require one. See `spec/react.md` for the decision.
4. **Do not add a build step to the `pews-chart/` source.** The source must stay plain
   HTML/CSS/JS loaded as native ES modules — no bundler, no transpiler in development. A
   **distribution-only** bundle (NPM/UMD build for CDN publishing) is allowed as a separate
   packaging step, provided the source itself keeps running unbuilt in the browser.
5. **Do not break colour-blind mode**. Test any colour-adjacent change with `.cb-mode` on `<body>`.
6. **Do not draw a line over a skipped observation** (spec U3.10). A skip must cause a break in the line.
7. **Respect the ES-module dependency order.** `chart.js` imports its config/scorer/age-band
   deps; `npews-chart.js` imports `chart-shell.js` + `chart.js`. Hosts render by feeding the
   `<npews-chart>` element a `{ patient, observations }` object (or calling `render(...)`
   directly) — never by relying on implicit global-script load order.

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

## Demo harness

The demonstration scenarios (the "stories") live in `pews-chart/scenarios.js` as a
`SCENARIOS` array of plain objects — each `{ id, title, ageBand, description, patient,
observations }`. `demo.html` + `demo.js` render them as a left-sidebar picker; selecting one
mounts a fresh chart shell (`chart-shell.js`) and passes the scenario straight to the chart
via `render({ patient, observations })`. Observations carry raw vitals only — the chart
computes the PEWS score, escalation level and age band from the patient's DOB.

To add a scenario, append an object to `SCENARIOS`:

```javascript
{
  id: 'my-scenario',            // unique; used in the URL hash (#my-scenario)
  title: 'Patient Name',
  ageBand: '5-12y',
  description: 'One line describing the clinical picture.',
  patient: { name: 'Patient Name', dob: '2018-05-01', /* ... */ },
  observations: [ /* raw vitals only — NO pewsTotal / escalationLevel */ ],
}
```

live-server hot-reloads the sidebar on save.

---

## How to give visual feedback effectively

When asking for UI changes:

1. **Share a screenshot** of the current rendered state (paste image directly into chat)
2. Reference the relevant NHS chart image from `reference-sources/images/`
3. Reference the relevant spec requirement by ID (e.g. "per U3.6")
4. Describe the change in CSS terms where possible: colours by token name, layout by grid/flex terminology

Example of a good prompt:
> "The escalation banner at `--esc-emergency` needs more visual weight. See screenshot vs `reference-sources/images/chart-5-12-years-1.png`. Increase font size of `.escalation-banner__level` and add a stronger left border."
