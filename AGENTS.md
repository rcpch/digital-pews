# Agent Instructions — Digital PEWS

A plain HTML/CSS/JS implementation of the NHS National Paediatric Early Warning System (NPEWS) observation chart. No framework, no build step, no runtime dependencies. The chart renders vital signs over time on `<canvas>` elements, with colour-coded PEWS scoring bands matched to the NHS paper chart.

This is a **clinical safety tool**. Visual accuracy and spec compliance matter more than aesthetics. When in doubt, match the NHS reference chart.

## Read First

- [README.md](README.md) - setup and project overview.
- [SAFETY.md](SAFETY.md) - clinical safety status, hazards, controls, and release limitations.
- [spec/README.md](spec/README.md) - spec index and landing page.
- [spec/product-boundary.md](spec/product-boundary.md) - component-only scope, responsibility allocation, and compliance claims.
- [spec/roadmap.md](spec/roadmap.md) - forward-looking work.
- [~/code/house-style/AGENTS.md](~/code/house-style/AGENTS.md) - cross-repo standards.

## Project Stack

- **Vanilla JS, HTML, CSS** - no runtime framework, no transpilation.
- **Canvas** - all chart rendering is done with the 2D Canvas API.
- **Web Component** - the chart is packaged as a framework-neutral `<npews-chart>` custom element (`npews-chart.js`) that takes a JSON `{ patient, observations }` object via its `.data` property.
- **ES modules** - the `chart/` component loads as native ES modules (no bundler, no build step).
- **Docker Compose** - local dev (`s/up` / `s/up demo`).
- Repo layout: `chart/` = reusable component source, `demo/` = demonstration harness, `spec/` = specification and decisions, `reference-sources/` = authoritative NHS source material.
- Demo app: http://localhost:8000 (`/demo.html` = scenario harness, `/` = single chart, `/embed-example.html` = minimal `<npews-chart>` drop-in).

### Module dependency graph

```
chart/                                    demo/
  npews-scoring-config.js -> chart.js -> npews-chart.js  <- demo.js / scenarios.js
  npews-scorer.js         -> chart.js
  age-band.js             -> chart.js
  chart-shell.js          -> npews-chart.js
```

Files load as native ES modules and `import` their own dependencies. A host page just imports `chart/npews-chart.js` (module) and feeds the `<npews-chart>` element its `{ patient, observations }` data.

## Core Invariants

1. **Do not change band colours** (`--band-*`). They are clinically mandated by the NHS NPEWS specification.
2. **Do not change escalation colours** (`--esc-*`). Same reason.
3. **Keep the runtime framework-neutral.** The chart core is plain HTML/CSS/JS packaged as a standards-based `<npews-chart>` Web Component with no runtime framework dependency. Optional thin framework wrappers are allowed, but the core must never require one. See `spec/react.md`.
4. **Do not add a build step to the `chart/` source.** The source must stay plain HTML/CSS/JS loaded as native ES modules. A distribution-only bundle (NPM/UMD for CDN publishing) is allowed as a separate packaging step.
5. **Do not draw a line over a skipped observation** (spec U3.10). A skip must cause a break in the line.
6. **Respect the ES-module dependency order.** `chart.js` imports its config/scorer/age-band deps; `npews-chart.js` imports `chart-shell.js` + `chart.js`. Hosts render by feeding the `<npews-chart>` element a `{ patient, observations }` object, never by relying on implicit global-script load order.
7. **Keep the product boundary component-only.** This repository owns NPEWS scoring and observation-chart rendering, not observation entry, EPR records, persistence, audit, operational alerting, reporting, or supplier services. It must not independently claim complete National PEWS compliance. See `spec/product-boundary.md`.

## Design Tokens

All colours, spacing, and typography are defined as CSS custom properties in `chart/styles.css`.

### PEWS band colours (clinically mandated - do not change)

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

### Typography

```css
--font: 'Lato', 'Trebuchet MS', Helvetica, Arial, sans-serif;
```

Lato approximates Frutiger (the NHS typeface). Implementers with a Frutiger licence override `--font` in a local stylesheet - the canvas `chartFont()` helper reads this at render time automatically.

## Layout System

Three modes, set via `data-layout` attribute on `<body>`:

| Mode | Trigger | Chart height |
|------|---------|-------------|
| `landscape` | >1200px | 140px |
| `portrait`  | 768-1199px | 90px |
| `mobile`    | <768px | 70px |

Auto-detection runs on load and resize. Lock layout in code with `data-lock-layout="landscape"` on `<body>`.

### Chart grid columns

```
Col 1 (40px):  Section label - vertical text, NHS navy background
Col 2 (180px): Parameter label - name, unit, description, NHS blue background
Col 3 (1fr):   Canvas chart
```

## Age Bands

| Band   | Label         | Header colour |
|--------|---------------|--------------|
| `0-11m` | 0 to 11 months | Pink |
| `1-4y`  | 1-4 Years      | Orange |
| `5-12y` | 5-12 Years     | Yellow |
| `13+y`  | 13+ Years      | Grey |

All four age bands have demonstration scenarios in `demo/scenarios.js`, including a birthday-crossing scenario where a child turns 5 mid-admission.

## Escalation Levels

| Level | PEWS score | Colour |
|-------|-----------|--------|
| Low | 1-4 | Blue `#1d70b8` |
| Medium | 5-8 | Yellow `#ffdd00` |
| High | 9-12 | Orange `#f47738` |
| Emergency | >=13 | Red `#d4351c` |

Escalation can also be triggered by Carer Question (W=Worse), Clinical Intuition (Yes=Concerned), or Specific Concern (sepsis, AVPU change), overriding the PEWS score-based level. See `spec/escalation.md`.

## Visual Reference

**Primary reference:** `reference-sources/images/chart-5-12-years-1.png`

All four age band references:
- `reference-sources/images/chart-0-11-months-1.png`
- `reference-sources/images/chart-1-4-years-1.png`
- `reference-sources/images/chart-5-12-years-1.png`
- `reference-sources/images/chart-13-years-1.png`

When working on visual fidelity: open the reference image and the running chart side by side. The goal is pixel-level match to the NHS paper chart.

## Spec Documents

Start at `spec/README.md` - the spec index and landing page.

**Reference (transcriptions of the SPOT-NPEWS `.xlsx`):**
- `spec/spot-npews-ui-spec.md` - NHS SPOT/NPEWS UI specification (MOSCOW priorities). **Must** requirements are non-negotiable.
- `spec/spot-npews-spec.md` - NHS SPOT/NPEWS clinical/technical specification (`C*` IDs).

**Scoring (JSON is the source of truth):**
- `spec/npews-scoring-spec.json` - canonical numeric scoring spec; generates the runtime config + the reference table (drift-tested).
- `spec/npews-scoring-tables.generated.md` - generated unified reference table (do not hand-edit).
- `spec/npews-scoring.md` - clinical narrative only.

**Clinical policy and data:**
- `spec/escalation.md` - escalation levels, non-score triggers, sepsis, ISBAR.
- `spec/data-model.md` - the two input shapes (Patient, Observation) + data-entry reference codes.
- `spec/fhir.md` - FHIR adapter contract + conformance-testing approach.

**Project:**
- `spec/decisions.md` - durable decision log (ADR-style).
- `spec/implementation-notes.md` - implementation clarifications + visual QA checklist.
- `spec/react.md` - component-architecture decision (Web Component vs React).
- `spec/roadmap.md` - forward-looking work.

## Workflow

- `s/up` - start the demo app (http://localhost:8000).
- `s/up demo` - start only the demo app.
- `s/down` - stop services.
- `npm test` - run the test suite (Vitest).
- `npm run generate:scoring` - regenerate scoring config from the canonical JSON.
- `npm run generate:scoring:check` - verify generated artifacts are up to date.

## Before Every Commit

```sh
npm test
npm run generate:scoring:check
```

## CSS Conventions

- BEM-style class naming: `.chart-grid__label`, `.escalation-banner--high`
- Use CSS custom properties for all colours and typography - no hardcoded hex values in new rules
- Layout via CSS Grid and Flexbox
- Responsive via `body[data-layout="..."]` attribute selectors, not media queries alone

## JS Conventions

- ES6+ (arrow functions, destructuring, const/let, template literals)
- No classes unless the pattern clearly calls for it
- Canvas rendering lives in `chart.js` - keep it there
- Use `chartFont(size, weight)` for all canvas text (reads `--font` CSS variable)
- Data files (`npews-scoring-config.js`, `demo-data.js`) use global scope - this is intentional

## Demo Harness

The demonstration scenarios live in `demo/scenarios.js` as a `SCENARIOS` array of plain objects. `demo.html` + `demo.js` render them as a left-sidebar picker; selecting one mounts a fresh chart shell and passes the scenario straight to the chart via `render({ patient, observations })`. Observations carry raw vitals only - the chart computes the PEWS score, escalation level and age band from the patient's DOB.

To add a scenario, append an object to `SCENARIOS`:

```javascript
{
  id: 'my-scenario',
  title: 'Patient Name',
  ageBand: '5-12y',
  description: 'One line describing the clinical picture.',
  patient: { name: 'Patient Name', dob: '2018-05-01' },
  observations: [ /* raw vitals only */ ],
}
```

## Approval Required

Ask before publishing releases, deleting branches, force-pushing, or taking externally visible actions.
