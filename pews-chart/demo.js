/* ============================================================
   NPEWS demo harness - demo.js
   ES module. No build step.

   Drives the demonstration page: renders the scenario picker in the sidebar and,
   when a scenario is chosen, feeds it to a single <npews-chart> Web Component as a
   JSON object. The harness is now a plain *consumer* of the element - it owns the
   scenario data and knows nothing about how the chart renders; the two meet only
   through `chartEl.data = { patient, observations }`.
   ============================================================ */

import './npews-chart.js';
import { SCENARIOS, scenarioById } from './scenarios.js';

const host = document.getElementById('chart-host');
const list = document.getElementById('scenario-list');

// One chart element for the whole harness; selecting a scenario re-feeds its data.
const chartEl = document.createElement('npews-chart');
host.appendChild(chartEl);

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
