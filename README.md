# Digital PEWS - NPEWS Chart UI

Plain HTML/CSS/JS implementation of the NHS National Paediatric Early Warning System (NPEWS) observation chart. No framework, no build step, no dependencies.

## Prerequisites

- **Docker** and **Docker Compose** (for running services)

## Quick start

### Using Docker Compose (recommended)

```bash
# Start both demo app and Storybook
s/up

# Start only the demo app (http://localhost:8000)
s/up demo

# Start only Storybook (http://localhost:6006)
s/up storybook
```

Press Ctrl+C to stop the services. Docker Compose will automatically clean up containers.

### Demo app
- Serves at http://localhost:8000
- Live-reload enabled for `apps/chart-ui/` changes

### Storybook
- Serves at http://localhost:6006
- Live-reload enabled for `.storybook/` changes


## How the chart works

`index.html` loads the following scripts in order:
1. `npews-scoring-config.js` - age bands and scoring thresholds
2. `demo-data.js` - fictional patient and observations
3. `data.js` - compatibility layer (SCORING_BANDS, CHART_CONFIG)
4. `chart.js` - rendering logic
5. `styles.css` - styling

The chart is rendered on `<canvas>` elements. All rendering is kicked off by `renderAll()` which is called from `index.html` after the DOM is ready.

Data files use global scope (not ES6 modules) and must load in the specific order shown above.

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

Currently only `5-12y` has a complete fictional data scenario in `demo-data.js`. The other three age bands have placeholder Storybook stories that need data.

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

## Adding a Storybook story

1. Create a `.stories.js` file in `apps/chart-ui/`
2. Export a default object with a `title`:

```javascript
export default {
  title: 'NPEWS/My Category',
};

export const MyStory = {
  render: () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <iframe
        src="/apps/chart-ui/index.html"
        style="width: 100%; height: 800px; border: none;">
      </iframe>
    `;
    return container;
  },
};
```

Storybook auto-detects `.stories.js` files and hot-reloads on save.

## Specs and reference materials

- `spec/data-model.md` - data model documentation (Patient, Observation, AgeBand, etc.)
- `spec/spot-npews-ui-spec.md` - UI specification
- `spec/npews-scoring.md` - scoring rules
- `spec/escalation.md` - escalation levels
- `reference-sources/images/` - PNG exports of the NHS NPEWS paper charts for each age band
- `reference-sources/*.pdf` - source PDFs and specifications
