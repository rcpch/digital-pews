# Digital PEWS - NPEWS Chart UI

Plain HTML/CSS/JS implementation of the NHS National Paediatric Early Warning System (NPEWS) observation chart. No framework, no build step, dependencies.

## Prerequisites

To serve the chart locally you need any local webserver.

To run Storybook you need:

- **Node.js** (v18+) and **npm**

## Quick start

### Chart dev server

```bash
npm run serve            # serves on http://localhost:3000
npm run serve -- 8765    # custom port
```

Then open `http://localhost:3000` in your browser.

The script (`scripts/serve`) tries python3, then python, then npx in order and exits with an error if none are available.

### Storybook

```bash
npm run storybook            # opens http://localhost:6006
npm run storybook -- 6007    # custom port
```

`npm install` is run automatically by the script if `node_modules` is missing.

To build a static Storybook for deployment:

```bash
npm run build-storybook  # output in storybook-static/
```

## File structure

```
digital-pews/
├── apps/chart-ui/
│   ├── index.html                  # entry point - open this via the dev server
│   ├── chart.js                    # all rendering logic (~1500 lines)
│   ├── styles.css                  # CSS variables, layout modes, colour tokens
│   ├── data.js                     # fictional patient + observations, age band configs
│   ├── AgeBands.stories.js         # Storybook age band stories
│   ├── Documentation.stories.js    # Storybook documentation stories
│   └── README.md                   # data model documentation
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── spec/                           # reference only - do not modify
│   ├── spot-npews-ui-spec.md
│   ├── npews-scoring.md
│   └── escalation.md
├── reference-sources/
│   └── images/
│       ├── chart-5-12-years-1.png  # primary visual reference
│       ├── chart-0-11-months-1.png
│       ├── chart-1-4-years-1.png
│       └── chart-13-years-1.png
├── test-output/
│   └── VISUAL_COMPARISON.md        # visual fidelity checklist
├── scripts/
│   ├── serve                       # chart dev server
│   └── storybook                   # Storybook dev server
└── package.json
```

## How the chart works

`index.html` loads `data.js`, `chart.js`, and `styles.css` directly - no bundler or transpiler involved. The chart is rendered on `<canvas>` elements. Open the file through the dev server (not `file://`) so ES module imports resolve correctly.

`chart.js` exports nothing to the global scope. All rendering is kicked off by `renderAll()` which is called from `index.html` after the DOM is ready.

`data.js` contains fictional test data only. Patient details and observations are invented for development and testing purposes.

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

Currently only `5-12y` has a complete fictional data scenario in `data.js`. The other three age bands have placeholder Storybook stories that need data.

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

- `spec/` - read-only reference specifications (scoring rules, escalation levels, UI spec)
- `reference-sources/images/` - PNG exports of the NHS NPEWS paper charts for each age band
- `apps/chart-ui/README.md` - data model documentation
- `test-output/VISUAL_COMPARISON.md` - visual fidelity checklist against the PDFs
