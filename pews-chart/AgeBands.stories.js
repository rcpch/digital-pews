/**
 * NPEWS Chart UI - Age Band Stories
 *
 * Demonstrates the chart UI for all four age bands with age-specific thresholds.
 * Each story builds the full DOM structure, loads the required scripts, then
 * calls window.NPEWSChart.init(patient, observations, ageBands) directly.
 */

export default {
  title: 'NPEWS/Age Bands',
  parameters: {
    layout: 'fullscreen',
  },
};

// ---------------------------------------------------------------------------
// Shared HTML structure - mirrors index.html body content exactly
// ---------------------------------------------------------------------------

function createChartHTML() {
  return `
<div class="app-layout">
  <header class="patient-header" role="banner">
    <div class="age-band-banner"></div>
    <div class="patient-header__inner">
      <span class="patient-header__name"></span>
      <div class="patient-header__meta"></div>
    </div>
  </header>

  <div id="escalation-banner" class="escalation-banner" style="display:none;" role="alert" aria-live="polite"></div>

  <div class="toolbar" role="toolbar" aria-label="Chart controls">
    <div class="toolbar__inner">
      <div class="toolbar__group" aria-label="Zoom">
        <span class="toolbar__label">Zoom</span>
        <button class="btn btn--icon" id="btn-zoom-in"  title="Zoom in"  aria-label="Zoom in">+</button>
        <button class="btn btn--icon" id="btn-zoom-out" title="Zoom out" aria-label="Zoom out">-</button>
      </div>
      <div class="toolbar__group" aria-label="Quick date range">
        <span class="toolbar__label">Range</span>
        <button class="btn" id="btn-today"   aria-pressed="false">Today</button>
        <button class="btn" id="btn-week"    aria-pressed="false">This Week</button>
        <button class="btn" id="btn-month"   aria-pressed="false">This Month</button>
        <button class="btn btn--active" id="btn-present" aria-pressed="true">Jump to Present</button>
      </div>
      <div class="toolbar__spacer"></div>
      <div class="toolbar__group layout-toggle-group" aria-label="Layout">
        <span class="toolbar__label">Layout</span>
        <button class="btn btn--icon" id="btn-layout-landscape" title="Landscape" aria-label="Landscape layout" aria-pressed="false">&#9644;</button>
        <button class="btn btn--icon" id="btn-layout-portrait"  title="Portrait"  aria-label="Portrait layout"  aria-pressed="false">&#9645;</button>
        <button class="btn btn--icon" id="btn-layout-mobile"    title="Mobile"    aria-label="Mobile layout"    aria-pressed="false">&#9647;</button>
      </div>
      <label class="cb-toggle" title="Always show exact observation values on chart">
        <input type="checkbox" id="toggle-values" checked />
        Show values
      </label>
      <label class="cb-toggle" title="Colour-blind friendly mode">
        <input type="checkbox" id="toggle-cb" />
        Colour-blind mode
      </label>
    </div>
  </div>

  <main class="main-content" role="main" aria-label="Observation charts">
    <div class="shared-legend" aria-label="Scoring band colours">
      <div class="shared-legend__inner">
        <span class="shared-legend__label">Scoring bands:</span>
        <div class="legend__item"><div class="legend__swatch legend__swatch--white"></div> 0 - Normal</div>
        <div class="legend__item"><div class="legend__swatch legend__swatch--yellow"></div> 1 - Low concern</div>
        <div class="legend__item"><div class="legend__swatch legend__swatch--orange"></div> 2 - Moderate concern</div>
        <div class="legend__item"><div class="legend__swatch legend__swatch--pink"></div> 4 - High concern</div>
      </div>
    </div>
    <div class="charts-layout">
      <div class="chart-grid" id="chart-grid" role="table" aria-label="Observation charts"></div>
    </div>
  </main>

  <footer class="sticky-footer" id="sticky-footer" role="contentinfo" aria-label="Current PEWS score and escalation status"></footer>
</div>
`;
}

// ---------------------------------------------------------------------------
// Script loader - loads scripts sequentially, returns a Promise
// ---------------------------------------------------------------------------

function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Avoid double-loading the same script
    if (document.querySelector(`script[data-story-src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.setAttribute('data-story-src', src);
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function loadChartScripts() {
  await loadScript('/npews-scoring-config.js');
  await loadScript('/chart.js');
}

// ---------------------------------------------------------------------------
// Story factory - builds the container, loads scripts, calls init
// ---------------------------------------------------------------------------

function createStory(patient, observations) {
  return () => {
    const container = document.createElement('div');
    container.innerHTML = createChartHTML();
    // Storybook appends the returned element to the DOM synchronously after
    // render() returns, so by the time the setTimeout callback fires the
    // container is already live in the document - which chart.js requires.
    setTimeout(async () => {
      await loadChartScripts();
      window.NPEWSChart.init(patient, observations, window.AGE_BANDS);
    }, 0);
    return container;
  };
}

// ---------------------------------------------------------------------------
// Patient + observation data for each age band
// Values chosen to be clearly within the normal (white) scoring band for
// their respective age group, with a few mild elevations to show scoring.
// ---------------------------------------------------------------------------

// -- 5-12 years (primary demo data, mirrors demo-data.js) ------------------

const PATIENT_5_12 = {
  name: 'Alex Thompson',
  dob: '2017-03-14',
  age: '7 years',
  ageBracket: '5-12',
  ageBand: '5-12y',
  nhsNumber: '943 476 5210',
  ward: 'Paediatric Ward B',
  bed: '12',
  consultant: 'Dr S. Patel',
  admittedAt: '2025-01-10T08:00:00',
};

// Abbreviated version of the full demo data - 8 stable + 10 deterioration/recovery
const OBSERVATIONS_5_12 = [
  { id: 'obs-n1', timestamp: '2025-01-10T00:00:00', respiratoryRate: 20, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 88, bloodPressureSystolic: 98, bloodPressureDiastolic: 62, capillaryRefill: 2, avpu: 'A', temperature: 36.8, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-n2', timestamp: '2025-01-10T02:00:00', respiratoryRate: 20, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 84, bloodPressureSystolic: 97, bloodPressureDiastolic: 61, capillaryRefill: 2, avpu: 'A', temperature: 36.8, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-n3', timestamp: '2025-01-10T04:00:00', respiratoryRate: 20, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 85, bloodPressureSystolic: 97, bloodPressureDiastolic: 61, capillaryRefill: 2, avpu: 'A', temperature: 36.8, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-n4', timestamp: '2025-01-10T06:00:00', respiratoryRate: 22, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 90, bloodPressureSystolic: 100, bloodPressureDiastolic: 64, capillaryRefill: 2, avpu: 'A', temperature: 37.0, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-1',  timestamp: '2025-01-10T08:00:00', respiratoryRate: 22, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 95, bloodPressureSystolic: 100, bloodPressureDiastolic: 65, capillaryRefill: 2, avpu: 'A', temperature: 37.1, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-2',  timestamp: '2025-01-10T09:00:00', respiratoryRate: 25, respiratoryDistress: 'none', oxygenSaturation: 96, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 105, bloodPressureSystolic: 102, bloodPressureDiastolic: 68, capillaryRefill: 2, avpu: 'A', temperature: 37.8, pewsTotal: 1, escalationLevel: null },
  { id: 'obs-3',  timestamp: '2025-01-10T10:00:00', respiratoryRate: 30, respiratoryDistress: 'mild', oxygenSaturation: 94, oxygenDevice: 'NP', oxygenDelivery: { value: 24, unit: '%' }, heartRate: 118, bloodPressureSystolic: null, bloodPressureSystolic_skipReason: 'unable', bloodPressureDiastolic: null, capillaryRefill: 2, avpu: 'A', temperature: 38.2, pewsTotal: 4, escalationLevel: null },
  { id: 'obs-4',  timestamp: '2025-01-10T11:00:00', respiratoryRate: 35, respiratoryDistress: 'moderate', oxygenSaturation: 93, oxygenDevice: 'NP', oxygenDelivery: { value: 35, unit: '%' }, heartRate: 128, bloodPressureSystolic: 96, bloodPressureDiastolic: 62, capillaryRefill: 3, avpu: 'A', temperature: 38.6, pewsTotal: 7, escalationLevel: 'medium' },
  { id: 'obs-5',  timestamp: '2025-01-10T11:30:00', respiratoryRate: 40, respiratoryDistress: 'moderate', oxygenSaturation: 91, oxygenDevice: 'FM', oxygenDelivery: { value: 6, unit: 'L/min' }, heartRate: 138, bloodPressureSystolic: 92, bloodPressureDiastolic: 58, capillaryRefill: 3, avpu: 'A', temperature: 39.0, pewsTotal: 9, escalationLevel: 'high' },
  { id: 'obs-6',  timestamp: '2025-01-10T12:00:00', respiratoryRate: 42, respiratoryDistress: 'severe', oxygenSaturation: 89, oxygenDevice: 'HF', oxygenDelivery: { value: 10, unit: 'L/min' }, heartRate: 148, bloodPressureSystolic: 85, bloodPressureDiastolic: 52, capillaryRefill: 4, avpu: 'V', temperature: 39.4, pewsTotal: 13, escalationLevel: 'emergency' },
  { id: 'obs-7',  timestamp: '2025-01-10T12:30:00', respiratoryRate: 38, respiratoryDistress: 'moderate', oxygenSaturation: 92, oxygenDevice: 'HF', oxygenDelivery: { value: 8, unit: 'L/min' }, heartRate: 140, bloodPressureSystolic: 88, bloodPressureDiastolic: 55, capillaryRefill: 3, avpu: 'A', temperature: 38.9, pewsTotal: 10, escalationLevel: 'high' },
  { id: 'obs-8',  timestamp: '2025-01-10T14:00:00', respiratoryRate: 32, respiratoryDistress: 'mild', oxygenSaturation: 95, oxygenDevice: 'NP', oxygenDelivery: { value: 4, unit: 'L/min' }, heartRate: 122, bloodPressureSystolic: 97, bloodPressureDiastolic: 61, capillaryRefill: 2, avpu: 'A', temperature: 38.3, pewsTotal: 5, escalationLevel: 'medium' },
  { id: 'obs-9',  timestamp: '2025-01-10T16:00:00', respiratoryRate: 26, respiratoryDistress: 'none', oxygenSaturation: 97, oxygenDevice: 'NP', oxygenDelivery: { value: 1, unit: 'L/min' }, heartRate: 108, bloodPressureSystolic: 101, bloodPressureDiastolic: 64, capillaryRefill: 2, avpu: 'A', temperature: 37.8, pewsTotal: 2, escalationLevel: 'low' },
  { id: 'obs-10', timestamp: '2025-01-10T18:00:00', respiratoryRate: 22, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 98, bloodPressureSystolic: 103, bloodPressureDiastolic: 66, capillaryRefill: 2, avpu: 'A', temperature: 37.4, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-11', timestamp: '2025-01-10T20:00:00', respiratoryRate: 21, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 93, bloodPressureSystolic: 101, bloodPressureDiastolic: 64, capillaryRefill: 2, avpu: 'A', temperature: 37.2, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-12', timestamp: '2025-01-10T22:00:00', respiratoryRate: 20, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 89, bloodPressureSystolic: 99, bloodPressureDiastolic: 62, capillaryRefill: 2, avpu: 'A', temperature: 37.0, pewsTotal: 0, escalationLevel: null },
];

// -- 0-11 months -----------------------------------------------------------
// Normal RR: 25-60, HR: 110-160, BP sys: 70-89

const PATIENT_0_11M = {
  name: 'Baby Rivera',
  dob: '2025-06-01',
  age: '6 months',
  ageBracket: '0-11m',
  ageBand: '0-11m',
  nhsNumber: '502 184 7391',
  ward: 'Paediatric Ward A',
  bed: '4',
  consultant: 'Dr A. Okafor',
  admittedAt: '2025-12-10T06:00:00',
};

const OBSERVATIONS_0_11M = [
  { id: 'obs-n1', timestamp: '2025-12-10T00:00:00', respiratoryRate: 38, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 130, bloodPressureSystolic: 78, bloodPressureDiastolic: 50, capillaryRefill: 2, avpu: 'A', temperature: 36.8, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-n2', timestamp: '2025-12-10T02:00:00', respiratoryRate: 36, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 128, bloodPressureSystolic: 77, bloodPressureDiastolic: 49, capillaryRefill: 2, avpu: 'A', temperature: 36.8, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-n3', timestamp: '2025-12-10T04:00:00', respiratoryRate: 38, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 132, bloodPressureSystolic: 79, bloodPressureDiastolic: 51, capillaryRefill: 2, avpu: 'A', temperature: 36.9, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-1',  timestamp: '2025-12-10T06:00:00', respiratoryRate: 40, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 135, bloodPressureSystolic: 80, bloodPressureDiastolic: 52, capillaryRefill: 2, avpu: 'A', temperature: 37.0, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-2',  timestamp: '2025-12-10T07:00:00', respiratoryRate: 44, respiratoryDistress: 'none', oxygenSaturation: 97, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 140, bloodPressureSystolic: 82, bloodPressureDiastolic: 54, capillaryRefill: 2, avpu: 'A', temperature: 37.5, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-3',  timestamp: '2025-12-10T08:00:00', respiratoryRate: 50, respiratoryDistress: 'mild', oxygenSaturation: 95, oxygenDevice: 'NP', oxygenDelivery: { value: 20, unit: '%' }, heartRate: 148, bloodPressureSystolic: 84, bloodPressureDiastolic: 55, capillaryRefill: 2, avpu: 'A', temperature: 38.0, pewsTotal: 2, escalationLevel: 'low' },
  { id: 'obs-4',  timestamp: '2025-12-10T09:00:00', respiratoryRate: 55, respiratoryDistress: 'moderate', oxygenSaturation: 93, oxygenDevice: 'NP', oxygenDelivery: { value: 35, unit: '%' }, heartRate: 158, bloodPressureSystolic: 85, bloodPressureDiastolic: 56, capillaryRefill: 3, avpu: 'A', temperature: 38.5, pewsTotal: 5, escalationLevel: 'medium' },
  { id: 'obs-5',  timestamp: '2025-12-10T09:30:00', respiratoryRate: 60, respiratoryDistress: 'severe', oxygenSaturation: 90, oxygenDevice: 'FM', oxygenDelivery: { value: 8, unit: 'L/min' }, heartRate: 165, bloodPressureSystolic: 88, bloodPressureDiastolic: 58, capillaryRefill: 3, avpu: 'A', temperature: 39.0, pewsTotal: 9, escalationLevel: 'high' },
  { id: 'obs-6',  timestamp: '2025-12-10T11:00:00', respiratoryRate: 48, respiratoryDistress: 'mild', oxygenSaturation: 95, oxygenDevice: 'NP', oxygenDelivery: { value: 3, unit: 'L/min' }, heartRate: 150, bloodPressureSystolic: 82, bloodPressureDiastolic: 53, capillaryRefill: 2, avpu: 'A', temperature: 38.2, pewsTotal: 3, escalationLevel: 'low' },
  { id: 'obs-7',  timestamp: '2025-12-10T13:00:00', respiratoryRate: 42, respiratoryDistress: 'none', oxygenSaturation: 97, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 138, bloodPressureSystolic: 80, bloodPressureDiastolic: 51, capillaryRefill: 2, avpu: 'A', temperature: 37.8, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-8',  timestamp: '2025-12-10T16:00:00', respiratoryRate: 38, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 132, bloodPressureSystolic: 78, bloodPressureDiastolic: 50, capillaryRefill: 2, avpu: 'A', temperature: 37.2, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-9',  timestamp: '2025-12-10T20:00:00', respiratoryRate: 36, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 128, bloodPressureSystolic: 76, bloodPressureDiastolic: 48, capillaryRefill: 2, avpu: 'A', temperature: 36.9, pewsTotal: 0, escalationLevel: null },
];

// -- 1-4 years -------------------------------------------------------------
// Normal RR: 20-39, HR: 100-140, BP sys: 80-99

const PATIENT_1_4Y = {
  name: 'Jamie Osei',
  dob: '2022-09-22',
  age: '2 years',
  ageBracket: '1-4y',
  ageBand: '1-4y',
  nhsNumber: '748 203 6185',
  ward: 'Paediatric Ward C',
  bed: '7',
  consultant: 'Dr M. Eriksson',
  admittedAt: '2025-02-15T10:00:00',
};

const OBSERVATIONS_1_4Y = [
  { id: 'obs-n1', timestamp: '2025-02-15T00:00:00', respiratoryRate: 26, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 110, bloodPressureSystolic: 88, bloodPressureDiastolic: 56, capillaryRefill: 2, avpu: 'A', temperature: 36.9, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-n2', timestamp: '2025-02-15T02:00:00', respiratoryRate: 24, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 108, bloodPressureSystolic: 86, bloodPressureDiastolic: 54, capillaryRefill: 2, avpu: 'A', temperature: 36.8, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-n3', timestamp: '2025-02-15T04:00:00', respiratoryRate: 25, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 112, bloodPressureSystolic: 87, bloodPressureDiastolic: 55, capillaryRefill: 2, avpu: 'A', temperature: 36.9, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-1',  timestamp: '2025-02-15T06:00:00', respiratoryRate: 26, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 115, bloodPressureSystolic: 90, bloodPressureDiastolic: 58, capillaryRefill: 2, avpu: 'A', temperature: 37.1, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-2',  timestamp: '2025-02-15T08:00:00', respiratoryRate: 30, respiratoryDistress: 'none', oxygenSaturation: 96, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 122, bloodPressureSystolic: 93, bloodPressureDiastolic: 61, capillaryRefill: 2, avpu: 'A', temperature: 37.9, pewsTotal: 1, escalationLevel: null },
  { id: 'obs-3',  timestamp: '2025-02-15T09:00:00', respiratoryRate: 36, respiratoryDistress: 'mild', oxygenSaturation: 94, oxygenDevice: 'NP', oxygenDelivery: { value: 24, unit: '%' }, heartRate: 132, bloodPressureSystolic: 95, bloodPressureDiastolic: 63, capillaryRefill: 2, avpu: 'A', temperature: 38.4, pewsTotal: 3, escalationLevel: 'low' },
  { id: 'obs-4',  timestamp: '2025-02-15T10:00:00', respiratoryRate: 40, respiratoryDistress: 'moderate', oxygenSaturation: 92, oxygenDevice: 'NP', oxygenDelivery: { value: 40, unit: '%' }, heartRate: 142, bloodPressureSystolic: 97, bloodPressureDiastolic: 65, capillaryRefill: 3, avpu: 'A', temperature: 38.9, pewsTotal: 6, escalationLevel: 'medium' },
  { id: 'obs-5',  timestamp: '2025-02-15T10:30:00', respiratoryRate: 42, respiratoryDistress: 'severe', oxygenSaturation: 89, oxygenDevice: 'HF', oxygenDelivery: { value: 8, unit: 'L/min' }, heartRate: 155, bloodPressureSystolic: 99, bloodPressureDiastolic: 67, capillaryRefill: 3, avpu: 'V', temperature: 39.2, pewsTotal: 11, escalationLevel: 'high' },
  { id: 'obs-6',  timestamp: '2025-02-15T12:00:00', respiratoryRate: 38, respiratoryDistress: 'mild', oxygenSaturation: 93, oxygenDevice: 'NP', oxygenDelivery: { value: 4, unit: 'L/min' }, heartRate: 140, bloodPressureSystolic: 94, bloodPressureDiastolic: 62, capillaryRefill: 2, avpu: 'A', temperature: 38.6, pewsTotal: 5, escalationLevel: 'medium' },
  { id: 'obs-7',  timestamp: '2025-02-15T14:00:00', respiratoryRate: 30, respiratoryDistress: 'none', oxygenSaturation: 97, oxygenDevice: 'NP', oxygenDelivery: { value: 1, unit: 'L/min' }, heartRate: 125, bloodPressureSystolic: 91, bloodPressureDiastolic: 60, capillaryRefill: 2, avpu: 'A', temperature: 38.1, pewsTotal: 1, escalationLevel: null },
  { id: 'obs-8',  timestamp: '2025-02-15T16:00:00', respiratoryRate: 26, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 114, bloodPressureSystolic: 89, bloodPressureDiastolic: 57, capillaryRefill: 2, avpu: 'A', temperature: 37.6, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-9',  timestamp: '2025-02-15T20:00:00', respiratoryRate: 24, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 108, bloodPressureSystolic: 86, bloodPressureDiastolic: 54, capillaryRefill: 2, avpu: 'A', temperature: 37.1, pewsTotal: 0, escalationLevel: null },
];

// -- 13+ years -------------------------------------------------------------
// Normal RR: 12-20, HR: 70-110, BP sys: 100-119

const PATIENT_13_PLUS = {
  name: 'Morgan Clarke',
  dob: '2010-11-05',
  age: '15 years',
  ageBracket: '13+y',
  ageBand: '13+y',
  nhsNumber: '371 920 8456',
  ward: 'Adolescent Ward',
  bed: '3',
  consultant: 'Dr P. Nguyen',
  admittedAt: '2025-03-05T14:00:00',
};

const OBSERVATIONS_13_PLUS = [
  { id: 'obs-n1', timestamp: '2025-03-05T00:00:00', respiratoryRate: 14, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 72, bloodPressureSystolic: 108, bloodPressureDiastolic: 68, capillaryRefill: 2, avpu: 'A', temperature: 36.8, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-n2', timestamp: '2025-03-05T02:00:00', respiratoryRate: 13, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 70, bloodPressureSystolic: 106, bloodPressureDiastolic: 66, capillaryRefill: 2, avpu: 'A', temperature: 36.7, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-n3', timestamp: '2025-03-05T04:00:00', respiratoryRate: 14, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 71, bloodPressureSystolic: 107, bloodPressureDiastolic: 67, capillaryRefill: 2, avpu: 'A', temperature: 36.8, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-1',  timestamp: '2025-03-05T06:00:00', respiratoryRate: 15, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 74, bloodPressureSystolic: 110, bloodPressureDiastolic: 70, capillaryRefill: 2, avpu: 'A', temperature: 37.0, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-2',  timestamp: '2025-03-05T08:00:00', respiratoryRate: 18, respiratoryDistress: 'none', oxygenSaturation: 97, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 82, bloodPressureSystolic: 114, bloodPressureDiastolic: 74, capillaryRefill: 2, avpu: 'A', temperature: 37.6, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-3',  timestamp: '2025-03-05T09:00:00', respiratoryRate: 22, respiratoryDistress: 'mild', oxygenSaturation: 95, oxygenDevice: 'NP', oxygenDelivery: { value: 24, unit: '%' }, heartRate: 95, bloodPressureSystolic: 116, bloodPressureDiastolic: 76, capillaryRefill: 2, avpu: 'A', temperature: 38.1, pewsTotal: 2, escalationLevel: 'low' },
  { id: 'obs-4',  timestamp: '2025-03-05T10:00:00', respiratoryRate: 26, respiratoryDistress: 'moderate', oxygenSaturation: 93, oxygenDevice: 'NP', oxygenDelivery: { value: 40, unit: '%' }, heartRate: 108, bloodPressureSystolic: 118, bloodPressureDiastolic: 78, capillaryRefill: 3, avpu: 'A', temperature: 38.7, pewsTotal: 5, escalationLevel: 'medium' },
  { id: 'obs-5',  timestamp: '2025-03-05T10:30:00', respiratoryRate: 28, respiratoryDistress: 'severe', oxygenSaturation: 90, oxygenDevice: 'FM', oxygenDelivery: { value: 8, unit: 'L/min' }, heartRate: 126, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, capillaryRefill: 3, avpu: 'V', temperature: 39.1, pewsTotal: 10, escalationLevel: 'high' },
  { id: 'obs-6',  timestamp: '2025-03-05T12:00:00', respiratoryRate: 24, respiratoryDistress: 'mild', oxygenSaturation: 94, oxygenDevice: 'NP', oxygenDelivery: { value: 4, unit: 'L/min' }, heartRate: 115, bloodPressureSystolic: 117, bloodPressureDiastolic: 77, capillaryRefill: 2, avpu: 'A', temperature: 38.8, pewsTotal: 4, escalationLevel: 'low' },
  { id: 'obs-7',  timestamp: '2025-03-05T14:00:00', respiratoryRate: 20, respiratoryDistress: 'none', oxygenSaturation: 96, oxygenDevice: 'NP', oxygenDelivery: { value: 1, unit: 'L/min' }, heartRate: 98, bloodPressureSystolic: 113, bloodPressureDiastolic: 73, capillaryRefill: 2, avpu: 'A', temperature: 38.2, pewsTotal: 1, escalationLevel: null },
  { id: 'obs-8',  timestamp: '2025-03-05T16:00:00', respiratoryRate: 16, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 82, bloodPressureSystolic: 110, bloodPressureDiastolic: 70, capillaryRefill: 2, avpu: 'A', temperature: 37.5, pewsTotal: 0, escalationLevel: null },
  { id: 'obs-9',  timestamp: '2025-03-05T20:00:00', respiratoryRate: 14, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 74, bloodPressureSystolic: 108, bloodPressureDiastolic: 68, capillaryRefill: 2, avpu: 'A', temperature: 36.9, pewsTotal: 0, escalationLevel: null },
];

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const AgeBand_5_12_Years = {
  render: createStory(PATIENT_5_12, OBSERVATIONS_5_12),
};

export const AgeBand_0_11_Months = {
  render: createStory(PATIENT_0_11M, OBSERVATIONS_0_11M),
};

export const AgeBand_1_4_Years = {
  render: createStory(PATIENT_1_4Y, OBSERVATIONS_1_4Y),
};

export const AgeBand_13_Plus_Years = {
  render: createStory(PATIENT_13_PLUS, OBSERVATIONS_13_PLUS),
};
