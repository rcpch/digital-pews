## Roadmap

### Web Component packaging — Phase 2

The chart ships today as a framework-neutral `<npews-chart>` element (Phase 1: light
DOM, one chart per document, self-provisioned styles). Phase 2 hardens it for
distribution and multi-instance embedding:

- **Shadow DOM isolation** — render into a shadow root so the chart's styles can't
  leak into (or be broken by) the host page. Requires the engine to scope its DOM
  lookups and CSS-custom-property reads to a root element instead of `document`.
- **Multiple instances per page** — replace the engine's fixed DOM ids and the global
  `resize` listener with per-instance ids/state so several charts can coexist without
  iframes.
- **NPM package + UMD/CDN bundle with Subresource Integrity** — mirror the RCPCH
  Digital Growth Charts recipe (CJS `main` / ESM `module` / `types`, plus a UMD build
  exposed via `unpkg`/`jsdelivr` and a `generate-sri` SHA-384 step) so trusts without
  a build pipeline can `<script src>` the element from a CDN. Distribution-only build,
  source stays unbuilt.
- **TypeScript prop types** — publish `ObservationsObject` / `PatientObject` types
  (JSDoc + generated `.d.ts`) so consumers get autocomplete and compile-time checking.


* Everything that is currently hard-coded in the chart HTML needs to be parameterized, via the data model. This includes:
  * Age band thresholds
  * Escalation levels
  * Layout modes (landscape/portrait/mobile)
  * Color-blind mode toggle
  * Show values toggle
  * Zoom level
  * Time range
  * Oxygen modality changes (% → L/min)
  * Organisational branding (NHS logo)
  * Helper/explanatory text

### Priority 2: Add Interactive Controls
- Layout mode (landscape/portrait/mobile)
- Color-blind mode toggle
- Show values toggle
- Zoom level
- Time range

### Priority 3: Add Edge Case Stories
Create stories demonstrating:
- Skipped observations (unable to measure)
- Oxygen modality changes (% → L/min)
- Missing data patterns
- Rapid deterioration (multiple obs sets in short time)
- Recovery scenarios

### Priority 4: Visual Regression Testing
