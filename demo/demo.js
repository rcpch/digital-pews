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
