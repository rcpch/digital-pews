/* ============================================================
   NPEWS demo harness - demo.js
   ES module. No build step.

   Drives the demonstration page: renders the scenario picker in the sidebar and,
   when a scenario is chosen, feeds it to a single <npews-chart> Web Component as a
   JSON object. The harness is now a plain *consumer* of the element - it owns the
   scenario data and knows nothing about how the chart renders; the two meet only
   through `chartEl.data = { patient, observations }`.
   ============================================================ */

import '../chart/npews-chart.js';
import { getViewWindow } from '../chart/chart.js';
import { scoreObservationsForPatient } from '../chart/npews-scorer.js';
import { ESCALATION_META } from '../chart/npews-scoring-config.js';
import { SCENARIOS, scenarioById } from './scenarios.js';

const host = document.getElementById('chart-host');
const list = document.getElementById('scenario-list');

// One chart element for the whole harness; selecting a scenario re-feeds its data.
const chartEl = document.createElement('npews-chart');
host.appendChild(chartEl);

// -- Chart colour themes ------------------------------------------------------
// Each theme is a CSS class applied to <html> (see the "Optional chrome themes"
// block in chart/styles.css). Themes only restyle the chart *chrome*; the
// clinically-mandated band/escalation colours are never touched. `swatch` is
// [section-label, parameter-label, accent] for the picker preview.
const THEMES = [
  { id: 'nhs',      label: 'NHS',      cls: '',               swatch: ['#003087', '#005eb8', '#0b0c0c'] },
  { id: 'rcpch',    label: 'RCPCH',    cls: 'theme-rcpch',    swatch: ['#0d0d58', '#3366cc', '#11a7f2'] },
  { id: 'slate',    label: 'Slate',    cls: 'theme-slate',    swatch: ['#191919', '#4d4d4d', '#b3b3b3'] },
  { id: 'midnight', label: 'Midnight', cls: 'theme-midnight', swatch: ['#191919', '#0d0d58', '#12406b'] },
];
const THEME_CLASSES = THEMES.map((t) => t.cls).filter(Boolean);
const THEME_KEY = 'npews-demo-theme';

function applyTheme(id) {
  const theme = THEMES.find((t) => t.id === id) || THEMES[0];
  document.documentElement.classList.remove(...THEME_CLASSES);
  if (theme.cls) document.documentElement.classList.add(theme.cls);
  try { localStorage.setItem(THEME_KEY, theme.id); } catch (_) { /* private mode */ }
  // The canvas reads --chart-line/--chart-dot at render time; nudge a re-render
  // so the trend line/dots pick up the new theme without losing zoom state.
  window.dispatchEvent(new Event('resize'));
}

// Build the theme radio group.
const themeOptions = document.getElementById('theme-options');
let savedTheme = 'nhs';
try { savedTheme = localStorage.getItem(THEME_KEY) || 'nhs'; } catch (_) { /* private mode */ }
if (!THEMES.some((t) => t.id === savedTheme)) savedTheme = 'nhs';

themeOptions.innerHTML = THEMES.map((t) => `
  <label class="theme-option">
    <input type="radio" name="theme" value="${t.id}"${t.id === savedTheme ? ' checked' : ''} />
    <span class="theme-option__swatch" aria-hidden="true">
      ${t.swatch.map((c) => `<i style="background:${c}"></i>`).join('')}
    </span>
    <span class="theme-option__label">${t.label}</span>
  </label>`).join('');

themeOptions.addEventListener('change', (e) => {
  if (e.target.name === 'theme') applyTheme(e.target.value);
});

applyTheme(savedTheme);

// -- Foldable controls sidebar ------------------------------------------------
const controls = document.getElementById('demo-controls');
const controlsToggle = document.getElementById('controls-toggle');
const COLLAPSE_KEY = 'npews-demo-controls-collapsed';

function setCollapsed(collapsed) {
  controls.classList.toggle('demo-controls--collapsed', collapsed);
  document.body.classList.toggle('demo--controls-collapsed', collapsed);
  controlsToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  try { localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0'); } catch (_) { /* private mode */ }
}

let startCollapsed = false;
try { startCollapsed = localStorage.getItem(COLLAPSE_KEY) === '1'; } catch (_) { /* private mode */ }
setCollapsed(startCollapsed);

controlsToggle.addEventListener('click', () => {
  setCollapsed(!controls.classList.contains('demo-controls--collapsed'));
});

// -- Build the sidebar scenario list -----------------------------------------
list.innerHTML = SCENARIOS.map((s) => `
  <li role="presentation">
    <button class="scenario" type="button" role="tab"
            id="scenario-tab-${s.id}" data-id="${s.id}"
            aria-selected="false" aria-controls="chart-host">
      <span class="scenario__title">${s.title}</span>
      <span class="scenario__band">${s.ageBand}</span>
      <span class="scenario__desc">${s.description}</span>
    </button>
  </li>`).join('');

const buttons = () => Array.from(list.querySelectorAll('.scenario'));

// -- Select + render a scenario ----------------------------------------------
function select(id) {
  const scenario = scenarioById(id) || SCENARIOS[0];

  chartEl.data = { patient: scenario.patient, observations: scenario.observations };

  buttons().forEach((btn) => {
    const active = btn.dataset.id === scenario.id;
    btn.classList.toggle('scenario--active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  if (location.hash.slice(1) !== scenario.id) {
    history.replaceState(null, '', `#${scenario.id}`);
  }
}

list.addEventListener('click', (e) => {
  const btn = e.target.closest('.scenario');
  if (btn) select(btn.dataset.id);
});

// Keyboard navigation between scenario tabs (up/down arrows).
list.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
  const all = buttons();
  const i = all.indexOf(document.activeElement);
  if (i === -1) return;
  e.preventDefault();
  const next = e.key === 'ArrowDown' ? (i + 1) % all.length : (i - 1 + all.length) % all.length;
  all[next].focus();
  select(all[next].dataset.id);
});

// -- Initial selection (deep-linkable via #scenario-id) ----------------------
const requested = location.hash.slice(1);
select(scenarioById(requested) ? requested : SCENARIOS[0].id);

// -- Timeline scrubber (demo only) --------------------------------------------
// Lets you scroll through the scenario's observations and see the PEWS score
// at each time point. The chart's own banner/footer always show the latest
// observation (RCPCH 1.1 invariant); the scrubber readout is separate demo
// chrome. Uses getViewWindow() from chart.js for x-position alignment.

const scrubber      = document.getElementById('scrubber');
const scrubSlider    = document.getElementById('scrubber-slider');
const scrubOverlay   = document.getElementById('scrubber-overlay');
const scrubReadout   = document.getElementById('scrubber-readout');

let scoredObs = [];   // scored observations for the current scenario
let scrubIndex = 0;   // current scrubber index into scoredObs

function initScrubber(scenario) {
  if (!scenario || !scenario.observations || scenario.observations.length === 0) {
    scrubber.hidden = true;
    return;
  }

  scoredObs = scoreObservationsForPatient(scenario.patient, scenario.observations);
  scrubIndex = scoredObs.length - 1;  // start at the latest observation
  scrubber.hidden = false;

  scrubSlider.min = 0;
  scrubSlider.max = scoredObs.length - 1;
  scrubSlider.value = scrubIndex;

  updateScrubber();
}

function updateScrubber() {
  if (!scoredObs.length) return;
  const obs = scoredObs[scrubIndex];
  if (!obs) return;

  // Readout: time + PEWS total + escalation badge
  const time = new Date(obs.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const pews = obs.pewsTotal != null ? obs.pewsTotal : '—';
  const level = obs.escalationLevel;
  const meta = level ? ESCALATION_META[level] : null;
  const badge = meta
    ? `<span class="esc-badge" style="background:${meta.color};color:${meta.textColor}">${meta.label}</span>`
    : '<span class="esc-badge" style="background:#dee0e2;color:#0b0c0c">Normal</span>';

  scrubReadout.innerHTML = `<strong>${time}</strong> &middot; PEWS <strong>${pews}</strong> ${badge}`;

  positionOverlay();
}

function positionOverlay() {
  if (!scoredObs.length) return;
  const obs = scoredObs[scrubIndex];
  if (!obs) return;

  // Find the first canvas in the chart grid to compute x offset
  const canvas = document.querySelector('#chart-grid canvas');
  if (!canvas) { scrubOverlay.style.display = 'none'; return; }

  const vw = getViewWindow();
  if (!vw || vw.start == null || vw.end == null) { scrubOverlay.style.display = 'none'; return; }

  const range = vw.end - vw.start;
  if (range <= 0) { scrubOverlay.style.display = 'none'; return; }

  const ts = new Date(obs.timestamp).getTime();
  const canvasW = canvas.offsetWidth;
  const drawW = canvasW - vw.padLeft - vw.padRight;
  const xInCanvas = vw.padLeft + ((ts - vw.start) / range) * drawW;

  // The overlay sits inside .scrubber__bar, which is below the chart grid.
  // We want the vertical line to align with the canvas x-position. Since the
  // chart grid is in a separate container above, we position the overlay
  // relative to the chart grid container, not the scrubber bar.
  const chartGrid = document.getElementById('chart-grid');
  if (!chartGrid) { scrubOverlay.style.display = 'none'; return; }

  // The canvas is in the 3rd grid column (after 40px section label + 180px
  // parameter label). The canvas starts at 220px from the grid's left edge.
  // But the grid might have its own padding/margin. Use the canvas offsetLeft
  // relative to the chart grid container.
  const canvasLeftInGrid = canvas.offsetLeft;
  const xInGrid = canvasLeftInGrid + xInCanvas;

  // Position the overlay line over the chart grid, full height
  const gridRect = chartGrid.getBoundingClientRect();
  const barRect = scrubber.getBoundingClientRect();
  const overlayParent = scrubOverlay.parentElement; // .scrubber__bar

  // The overlay needs to be positioned relative to the chart grid area,
  // not the scrubber bar. Move it into the chart-host container instead.
  // Actually, let's position it absolutely within chart-host.
  const chartHost = document.getElementById('chart-host');
  if (!chartHost) { scrubOverlay.style.display = 'none'; return; }

  // Find the chart grid's position within chart-host
  const hostRect = chartHost.getBoundingClientRect();
  const gridLeftInHost = gridRect.left - hostRect.left;
  const xInHost = gridLeftInHost + xInGrid;

  // Move the overlay into chart-host if it's not already there
  if (scrubOverlay.parentElement !== chartHost) {
    chartHost.appendChild(scrubOverlay);
  }

  // Position: absolute within chart-host (which is position: relative or static)
  // Make chart-host position: relative so the overlay anchors correctly
  if (getComputedStyle(chartHost).position === 'static') {
    chartHost.style.position = 'relative';
  }

  const gridTopInHost = gridRect.top - hostRect.top;
  const gridBottomInHost = gridRect.bottom - hostRect.top;

  scrubOverlay.style.display = 'block';
  scrubOverlay.style.position = 'absolute';
  scrubOverlay.style.left = `${xInHost}px`;
  scrubOverlay.style.top = `${gridTopInHost}px`;
  scrubOverlay.style.height = `${gridBottomInHost - gridTopInHost}px`;
}

scrubSlider.addEventListener('input', () => {
  scrubIndex = parseInt(scrubSlider.value, 10);
  updateScrubber();
});

// Reposition overlay after chart re-renders (zoom, range, resize, scenario switch)
document.addEventListener('npews-chart:render', () => {
  if (!scrubber.hidden) positionOverlay();
});

window.addEventListener('resize', () => {
  if (!scrubber.hidden) positionOverlay();
});

// Hook into scenario selection to (re)initialise the scrubber
const _originalSelect = select;
select = function(id) {
  _originalSelect(id);
  initScrubber(scenarioById(id) || SCENARIOS[0]);
};
