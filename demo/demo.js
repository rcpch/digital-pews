/* ============================================================
   NPEWS demo harness - demo.js
   ES module. No build step.

   Drives the demonstration page: renders the scenario picker in the sidebar and,
   when a scenario is chosen, feeds it to a single <npews-chart> Web Component as a
   JSON object. The harness is now a plain *consumer* of the element - it owns the
   scenario data and knows nothing about how the chart renders; clinical data is
   passed through `.data` and display choices through `.options`.
   ============================================================ */

import './chart/npews-chart.js';
import { scoreObservationsForPatient } from './chart/npews-scorer.js';
import { ESCALATION_META } from './chart/npews-scoring-config.js';
import { escalationStatusLabel } from './chart/escalation-presentation.js';
import { SCENARIOS, scenarioById } from './scenarios.js';
import { nearestObservationIndex, observationTimelinePositions } from './playback-math.js';

const host = document.getElementById('chart-host');
const list = document.getElementById('scenario-list');

// One chart element for the whole harness; selecting a scenario re-feeds its data.
const chartEl = document.createElement('npews-chart');
host.appendChild(chartEl);

const triggerControls = document.getElementById('demo-triggers');
const clinicianTrigger = document.getElementById('trigger-clinician');
const clinicianLevel = document.getElementById('trigger-clinician-level');
const carerTrigger = document.getElementById('trigger-carer');
const carerLevel = document.getElementById('trigger-carer-level');
const specificTrigger = document.getElementById('trigger-specific');
const specificLevel = document.getElementById('trigger-specific-level');
const showDemographics = document.getElementById('show-demographics');

chartEl.options = { showDemographics: showDemographics.checked };

let selectedScenario = null;

function resetDemoTriggers() {
  clinicianTrigger.checked = false;
  clinicianLevel.value = 'low';
  clinicianLevel.disabled = true;
  carerTrigger.checked = false;
  carerLevel.value = 'low';
  carerLevel.disabled = true;
  specificTrigger.checked = false;
  specificLevel.value = 'low';
  specificLevel.disabled = true;
}

function observationsWithDemoTriggers(scenario, targetIndex) {
  const triggers = [];
  if (clinicianTrigger.checked) triggers.push({ code: 'CI', level: clinicianLevel.value });
  if (carerTrigger.checked) triggers.push({ code: 'CQ', level: carerLevel.value });
  if (specificTrigger.checked) triggers.push({ code: 'SC', level: specificLevel.value });

  return scenario.observations.map((observation, index) => {
    if (index !== targetIndex || triggers.length === 0) return observation;
    return {
      ...observation,
      ...(clinicianTrigger.checked ? { clinicalIntuition: 'yes' } : {}),
      ...(carerTrigger.checked ? { carerQuestion: 'W' } : {}),
      escalationTriggers: [...(observation.escalationTriggers || []), ...triggers],
    };
  });
}

function renderSelectedScenario() {
  if (!selectedScenario) return;
  const observations = observationsWithDemoTriggers(selectedScenario, playbackIndex);
  const scored = scoreObservationsForPatient(selectedScenario.patient, observations);
  chartEl.data = {
    patient: selectedScenario.patient,
    observations: observations.slice(0, playbackIndex + 1),
  };
  updatePlayback(scored[playbackIndex], observations.length);
}

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
  // so the trend line/dots pick up the new theme without losing view state.
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

showDemographics.addEventListener('change', () => {
  chartEl.options = { ...chartEl.options, showDemographics: showDemographics.checked };
});

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
  selectedScenario = scenario;
  resetDemoTriggers();

  buttons().forEach((btn) => {
    const active = btn.dataset.id === scenario.id;
    btn.classList.toggle('scenario--active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  if (location.hash.slice(1) !== scenario.id) {
    history.replaceState(null, '', `#${scenario.id}`);
  }

  initPlayback(scenario);
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

triggerControls.addEventListener('change', () => {
  clinicianLevel.disabled = !clinicianTrigger.checked;
  carerLevel.disabled = !carerTrigger.checked;
  specificLevel.disabled = !specificTrigger.checked;
  renderSelectedScenario();
});

// -- Observation playback (demo only) -----------------------------------------

const playback = document.getElementById('playback');
const playbackSlider = document.getElementById('playback-slider');
const playbackReadout = document.getElementById('playback-readout');

let playbackIndex = 0;
let playbackPositions = [];

function initPlayback(scenario) {
  if (!scenario || !scenario.observations || scenario.observations.length === 0) {
    playback.hidden = true;
    return;
  }

  playbackIndex = scenario.observations.length - 1;
  playbackPositions = observationTimelinePositions(scenario.observations);
  playback.hidden = false;
  playbackSlider.min = 0;
  playbackSlider.max = 1;
  playbackSlider.step = 'any';
  playbackSlider.value = playbackPositions[playbackIndex];
  playbackSlider.disabled = scenario.observations.length === 1;
  renderSelectedScenario();
}

function updatePlayback(obs, observationCount) {
  if (!obs) return;

  const dateTime = new Date(obs.timestamp).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const pews = obs.pewsTotal != null ? obs.pewsTotal : '—';
  const level = obs.escalationLevel;
  const meta = level ? ESCALATION_META[level] : null;
  const statusLabel = escalationStatusLabel(obs, ESCALATION_META);
  const badge = meta
    ? `<span class="esc-badge" style="background:${meta.color};color:${meta.textColor}">${meta.label}</span>`
    : `<span class="esc-badge" style="background:#dee0e2;color:#0b0c0c">${statusLabel}</span>`;

  const position = `Observation ${playbackIndex + 1} of ${observationCount}`;
  const activeCodes = (obs.escalationReasons || [])
    .filter(reason => reason.code !== 'P')
    .map(reason => reason.code)
    .filter((code, index, codes) => codes.indexOf(code) === index);
  const noneCodes = (obs.escalationDecisions || [])
    .filter(decision => decision.level === 'none')
    .map(decision => `${decision.code}:0`);
  const notices = [
    ...(obs.clinicalWarnings || []).map(warning => warning.message),
    ...(obs.pendingEscalationResponses || []).map(response => `${response.code} level required`),
  ];
  const detail = [
    activeCodes.length ? `Trigger ${activeCodes.join('+')}` : null,
    noneCodes.length ? `Recorded ${noneCodes.join('+')}` : null,
    ...notices,
  ].filter(Boolean);
  playbackReadout.innerHTML = `${position} &middot; <strong>${dateTime}</strong> &middot; PEWS <strong>${pews}</strong> ${badge}${detail.length ? ` &middot; ${detail.join(' &middot; ')}` : ''}`;
  playbackSlider.value = playbackPositions[playbackIndex];
  playbackSlider.setAttribute('aria-valuetext', `${position}, ${dateTime}, PEWS ${pews}, ${statusLabel}${detail.length ? `, ${detail.join(', ')}` : ''}`);
}

playbackSlider.addEventListener('input', () => {
  const nearestIndex = nearestObservationIndex(playbackPositions, Number(playbackSlider.value));
  if (nearestIndex === playbackIndex) {
    playbackSlider.value = playbackPositions[playbackIndex];
    return;
  }
  playbackIndex = nearestIndex;
  renderSelectedScenario();
});

playbackSlider.addEventListener('keydown', (event) => {
  const direction = ['ArrowLeft', 'ArrowDown'].includes(event.key)
    ? -1
    : ['ArrowRight', 'ArrowUp'].includes(event.key)
      ? 1
      : 0;
  if (direction === 0 && !['Home', 'End'].includes(event.key)) return;

  event.preventDefault();
  if (event.key === 'Home') playbackIndex = 0;
  else if (event.key === 'End') playbackIndex = playbackPositions.length - 1;
  else playbackIndex = Math.max(0, Math.min(playbackPositions.length - 1, playbackIndex + direction));
  renderSelectedScenario();
});

new ResizeObserver(([entry]) => {
  const borderBox = Array.isArray(entry.borderBoxSize) ? entry.borderBoxSize[0] : entry.borderBoxSize;
  const height = playback.hidden ? 0 : (borderBox?.blockSize || playback.offsetHeight);
  document.body.style.setProperty('--demo-playback-h', `${height}px`);
}).observe(playback);

// -- Initial selection (deep-linkable via #scenario-id) ----------------------
const requested = location.hash.slice(1);
select(scenarioById(requested) ? requested : SCENARIOS[0].id);
