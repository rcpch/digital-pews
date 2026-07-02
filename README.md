# Digital PEWS - NPEWS Chart UI

Plain HTML/CSS/JS implementation of the NHS National Paediatric Early Warning System (NPEWS) observation chart. No framework, no build step, no dependencies.

## Prerequisites

- **Docker** and **Docker Compose** (for running services)

## Quick start

### Using Docker Compose (recommended)

```bash
# Start the demo app (http://localhost:8000)
s/up

# Equivalent - start only the demo app
s/up demo
```

Press Ctrl+C to stop the services. Docker Compose will automatically clean up containers.

### Demo app

- Serves at <http://localhost:8000>
- Uses live-server for automatic reload
- Volume-mounted from `pews-chart/`
- Open <http://localhost:8000/demo.html> for the demonstration harness (left
  sidebar of example patients); <http://localhost:8000/> renders a single chart.

## How the chart works

The chart is a **props-driven visualisation component**: given a patient and a
list of observations it renders into a fixed set of DOM hooks. Data is kept
separate from presentation - the chart never carries a specific patient in its
markup, and it computes all PEWS scores itself (see below).

`pews-chart/` is loaded as ES modules (no build step):

- `chart-shell.js` - the shared chart DOM scaffold (`mountChartShell(host)`), used
  by both the standalone page and the demo harness so they can't drift.
- `chart.js` - the rendering engine. Import `render` and call
  `render({ patient, observations })`. It imports its own dependencies:
  - `npews-scoring-config.js` - age bands, scoring thresholds and age-band bounds.
  - `npews-scorer.js` - computes the PEWS score, escalation level and applicable
    age band for every observation from the patient's date of birth. **Scores are
    always computed, never hand-typed** - any score in the input data is ignored.
  - `age-band.js` - pure date maths for resolving the age band(s) an admission
    spans (supports seamless charting across a birthday boundary).
- `styles.css` - all styling (colours, layout, colour-blind mode).

Two entry points render the chart:

- `index.html` - a single standalone chart. Loads `demo-data.js` (which publishes
  `window.PATIENT` / `window.OBSERVATIONS`), mounts the shell, then calls `render`.
- `demo.html` - the **demonstration harness**. A left sidebar lists example
  patients from `scenarios.js`; selecting one mounts a fresh shell and passes the
  scenario to `render({ patient, observations })`. This replaced Storybook.

## Use as a Web Component

The chart is also packaged as a **framework-neutral `<npews-chart>` custom element**
so it drops into any host — a plain page, React/Angular/Vue, or a SMART-on-FHIR
app — with no framework dependency. The element self-provisions its stylesheet and
fonts, so a consumer only loads one module and feeds it a JSON object:

```html
<script type="module" src="npews-chart.js"></script>

<npews-chart id="chart"></npews-chart>

<script type="module">
  document.getElementById('chart').data = {
    patient: {
      name: 'Alex Thompson',
      dob: '2017-03-14',
      // ...nhsNumber, ward, bed, consultant
    },
    observations: [
      // raw vitals only — no scores; the engine computes them
      { timestamp: '2025-01-10T08:00:00Z', respiratoryRate: 20, spo2: 99, /* ... */ },
      // ...
    ],
  };
</script>
```

- Data is passed as a JS **property** (`.data`), not an attribute, because it is a
  rich object. Convenience setters `.patient` and `.observations` are also available.
- **Scores are always computed** from the patient's date of birth and the raw
  observations — any score in the input is ignored (single source of truth).
- See `pews-chart/embed-example.html` for a minimal, self-contained drop-in
  (<http://localhost:8000/embed-example.html>). It links no chart stylesheet and
  calls no rendering API — it just loads the module and sets `.data`.

**Phase 1 limitation:** the engine uses fixed DOM ids, so one chart per document is
supported today; embed additional charts in separate iframes. Shadow-DOM isolation,
multiple instances per page, and an NPM/UMD + Subresource-Integrity CDN bundle with
TypeScript prop types are Phase 2 (see `spec/roadmap.md`).

## Layout modes

Three modes are supported, selectable via the toolbar toggle in the UI:

| Mode | Trigger | Chart height |
|------|---------|--------------|
| Landscape | >1200px or manual | 140px |
| Portrait | 768-1199px or manual | 90px |
| Mobile | <768px or manual | 70px |

Auto-detection runs on load. The toolbar lets you override manually. To lock a layout in code, set `data-lock-layout="landscape"` (or `portrait`/`mobile`) on the `<body>` tag.

## Age bands

Four age bands are defined, each with different y-axis ranges, scoring thresholds, and header colours:

| Band | Label | Header colour |
|------|-------|--------------|
| `0-11m` | 0 to 11 months | Pink |
| `1-4y` | 1-4 Years | Orange |
| `5-12y` | 5-12 Years | Yellow |
| `13+y` | 13+ Years | Grey |

All four age bands have demonstration scenarios in `pews-chart/scenarios.js`
(shown in the `demo.html` sidebar), including a birthday-crossing scenario where a
child turns 5 mid-admission and the chart seamlessly joins the `1-4y` and `5-12y`
bands. `demo-data.js` holds the two full-day datasets reused by those scenarios.

## Visual reference

The primary reference image is `reference-sources/images/chart-5-12-years-1.png`. Use `test-output/VISUAL_COMPARISON.md` to track which visual elements have been matched against the NHS paper chart.

When working on visual fidelity, keep the reference image and the running chart open side by side.

## Fonts

Lato (from Google Fonts) is the default fallback. If you have a Frutiger licence, override the CSS variable in your local stylesheet:

```css
:root {
  --font: 'Frutiger', 'Frutiger LT Std', Lato, sans-serif;
}
```

Canvas text rendering uses the `chartFont(size, weight)` helper in `chart.js`, which reads `--font` at call time so the override takes effect automatically.

## Adding a demo scenario

Demonstration scenarios (the example patients in the `demo.html` sidebar) live in
`pews-chart/scenarios.js`. Add a plain object to the `SCENARIOS` array:

```javascript
{
  id: 'my-scenario',            // unique, used in the URL hash (#my-scenario)
  title: 'Patient Name',        // sidebar label
  ageBand: '5-12y',             // shown as a chip
  description: 'One line describing the clinical picture.',
  patient: { name: 'Patient Name', dob: '2018-05-01', /* ... */ },
  observations: [ /* raw vitals only - NO pewsTotal / escalationLevel */ ],
}
```

Observations carry raw vital signs only; the chart computes the PEWS score,
escalation level and applicable age band from the patient's date of birth. The
sidebar hot-reloads on save (live-server).

## Specs and reference materials

- `spec/spot-npews-ui-spec.md` / `spec/spot-npews-spec.md` - NHS SPOT/NPEWS specification (transcribed from the reference `.xlsx`)
- `spec/npews-scoring-spec.json` - canonical scoring spec (source of truth); `spec/npews-scoring-tables.generated.md` - generated reference table; `spec/npews-scoring.md` - clinical narrative
- `spec/data-model.md` - the Patient + Observation input shapes and data-entry codes
- `spec/escalation.md` - escalation levels, triggers, sepsis and ISBAR
- `spec/fhir.md` - FHIR adapter + conformance testing
- `spec/decisions.md` - durable decision log; `spec/implementation-notes.md` - implementation notes + QA checklist; `spec/roadmap.md` - roadmap
- `reference-sources/images/` - PNG exports of the NHS NPEWS paper charts for each age band
- `reference-sources/*.pdf` - source PDFs and specifications
