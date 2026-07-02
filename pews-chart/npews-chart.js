/* ============================================================
   <npews-chart> - framework-neutral Web Component - npews-chart.js
   ES module. No build step.

   A drop-in Custom Element that renders the NPEWS observation chart from a plain
   JSON object. It is the framework-neutral packaging of the chart: the same
   element works in plain HTML, React, Angular, Vue, or inside a SMART-on-FHIR
   app, and consumers never touch the internal engine.

     <script type="module" src="npews-chart.js"></script>
     <npews-chart id="c"></npews-chart>
     <script type="module">
       document.getElementById('c').data = { patient, observations };
     </script>

   Data is passed as a JS *property* (not an attribute) because it is a rich
   object - `.data = { patient, observations }`, or the `.patient` / `.observations`
   convenience setters. Observations carry raw vitals only; the engine computes the
   PEWS score, escalation level and applicable age band from the patient's DOB.

   Phase 1 (this file): light DOM, one chart per page (the engine uses fixed DOM
   ids). For a SMART-on-FHIR deployment the app runs in its own EHR iframe, so the
   iframe already provides style/DOM isolation and light DOM is sufficient.
   Phase 2 (see spec/roadmap.md): Shadow DOM isolation + multiple instances per
   page + an NPM/UMD bundle with Subresource Integrity + TypeScript prop types.
   ============================================================ */

import { mountChartShell } from './chart-shell.js';
import { render } from './chart.js';

// The chart's stylesheet lives next to this module. Inject it once (resolved
// relative to this file) so the element is a genuine drop-in: a consumer only has
// to load npews-chart.js, not remember to link styles.css.
//
// CRITICAL: the chart's band and escalation colours are clinically mandated and
// are read from CSS custom properties at *canvas render time*. If we drew before
// the stylesheet had loaded, getComputedStyle would return empty and the engine
// would fall back to non-spec default colours. So ensureStyles() returns a promise
// that resolves only once the stylesheet has loaded (and fonts have settled), and
// the element waits on it before rendering. Idempotent - runs once per document.
let _stylesReady = null;

function linkLoaded(link) {
  // Already parsed/applied (e.g. a same-origin <link> in <head>)?
  if (link.sheet) return Promise.resolve();
  return new Promise((resolve) => {
    // Resolve on error too, so a blocked/missing sheet never hangs the chart.
    link.addEventListener('load', resolve, { once: true });
    link.addEventListener('error', resolve, { once: true });
  });
}

function fontsSettled() {
  if (!(document.fonts && document.fonts.ready)) return Promise.resolve();
  // Wait for fonts so canvas text metrics are correct, but never block forever.
  return Promise.race([
    document.fonts.ready.catch(() => {}),
    new Promise((resolve) => setTimeout(resolve, 1500)),
  ]);
}

function ensureStyles() {
  if (_stylesReady) return _stylesReady;
  if (typeof document === 'undefined') {
    _stylesReady = Promise.resolve();
    return _stylesReady;
  }

  // Stylesheet (critical - see note above).
  let styleLink = document.querySelector('link[data-npews-chart-styles]');
  if (!styleLink) {
    styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = new URL('./styles.css', import.meta.url).href;
    styleLink.setAttribute('data-npews-chart-styles', '');
    document.head.appendChild(styleLink);
  }

  // Lato approximates Frutiger (the NHS typeface). Non-critical for colour; if the
  // request is blocked the chart falls back to Trebuchet MS / Arial via --font.
  let fontLink = document.querySelector('link[data-npews-chart-fonts]');
  if (!fontLink) {
    fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap';
    fontLink.setAttribute('data-npews-chart-fonts', '');
    document.head.appendChild(fontLink);
  }

  _stylesReady = Promise.all([
    linkLoaded(styleLink),
    linkLoaded(fontLink).catch(() => {}),
  ]).then(fontsSettled);
  return _stylesReady;
}

let _liveInstances = 0;

class NpewsChartElement extends HTMLElement {
  #data = null;

  /** @param {{patient: object, observations: object[]}|null} value */
  set data(value) {
    this.#data = value;
    if (this.isConnected) this.#renderNow();
  }
  get data() {
    return this.#data;
  }

  /** Convenience setter: `el.patient = {...}` (merges with any observations). */
  set patient(patient) {
    this.#data = { ...(this.#data || {}), patient };
    if (this.isConnected) this.#renderNow();
  }
  get patient() {
    return this.#data ? this.#data.patient ?? null : null;
  }

  /** Convenience setter: `el.observations = [...]` (merges with any patient). */
  set observations(observations) {
    this.#data = { ...(this.#data || {}), observations };
    if (this.isConnected) this.#renderNow();
  }
  get observations() {
    return this.#data ? this.#data.observations ?? null : null;
  }

  connectedCallback() {
    _liveInstances += 1;
    if (_liveInstances > 1) {
      console.warn(
        '<npews-chart>: more than one instance is on the page. The chart engine ' +
          'currently uses fixed DOM ids, so only one chart per document is supported ' +
          'until Shadow DOM isolation lands (Phase 2). Embed additional charts in ' +
          'separate iframes for now.'
      );
    }
    this.#renderNow();
  }

  disconnectedCallback() {
    _liveInstances = Math.max(0, _liveInstances - 1);
  }

  #renderNow() {
    const data = this.#data;
    if (!data || !data.patient || !Array.isArray(data.observations)) {
      // Not enough to draw yet - wait for `.data` to be set.
      return;
    }
    // Wait for the stylesheet (and fonts) before drawing so the canvas reads the
    // clinically-mandated band/escalation colours rather than fallback defaults.
    ensureStyles().then(() => {
      // Bail if we were disconnected or re-fed different data while waiting.
      if (!this.isConnected || this.#data !== data) return;
      // Fresh shell each time so re-setting data re-mounts cleanly into empty DOM.
      mountChartShell(this);
      render({ patient: data.patient, observations: data.observations });
    });
  }
}

if (typeof customElements !== 'undefined' && !customElements.get('npews-chart')) {
  customElements.define('npews-chart', NpewsChartElement);
}

export { NpewsChartElement };
