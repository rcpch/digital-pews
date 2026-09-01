// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

/* ============================================================
   NPEWS Chart shell markup - chart-shell.js
   ES module. No build step.

   The chart engine (chart.js) is a pure visualisation device: given a patient
   and a list of observations it renders into a fixed set of DOM hooks (the
   patient header, escalation banner, toolbar, #chart-grid and the sticky
   footer). This module owns that DOM scaffold so it lives in exactly one place
   and can be mounted into any host element - the standalone page (index.html)
   and the demo harness (demo.html) both use it, which keeps them from drifting.

   The patient header is intentionally left EMPTY here; chart.js populates the
   name and metadata from the patient object at render time. Nothing about a
   specific patient is baked into the markup.
   ============================================================ */

export const CHART_SHELL_HTML = /* html */ `
<div class="app-layout">

  <!-- Patient identity and current escalation remain visible while reviewing the chart. -->
  <div class="chart-status">
    <header class="patient-header" role="banner">
      <div class="patient-header__inner">
        <span class="patient-header__name"></span>
        <div class="patient-header__meta"></div>
      </div>
    </header>

    <!-- Escalation banner (rendered by chart.js) -->
    <div id="escalation-banner" class="escalation-banner" style="display:none;" role="alert" aria-live="polite"></div>
  </div>

  <!-- Toolbar -->
  <div class="toolbar" aria-label="Chart time window">
    <div class="toolbar__inner">

      <nav class="toolbar__group" aria-label="Visible time window">
        <span class="toolbar__label">View</span>
        <a class="toolbar__range-link" href="#" data-window-hours="168">1w</a>
        <a class="toolbar__range-link" href="#" data-window-hours="72">3d</a>
        <a class="toolbar__range-link toolbar__range-link--active" href="#" data-window-hours="24" aria-current="true">24h</a>
        <a class="toolbar__range-link" href="#" data-window-hours="12">12h</a>
        <a class="toolbar__range-link" href="#" data-window-hours="8">8h</a>
        <a class="toolbar__range-link" href="#" data-window-hours="4">4h</a>
        <a class="toolbar__range-link" href="#" data-window-hours="2">2h</a>
        <a class="toolbar__range-link" href="#" data-window-hours="1">1h</a>
      </nav>

      <div class="toolbar__spacer"></div>

      <span class="toolbar__chart-identifier" aria-label="Chart age band"></span>

    </div>
  </div>

  <!-- Main chart area -->
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

  <!-- Sticky footer (rendered by chart.js) -->
  <footer class="sticky-footer" id="sticky-footer" role="contentinfo" aria-label="Current PEWS score and escalation status"></footer>

</div><!-- /.app-layout -->
`;

/**
 * Inject the chart shell markup into a host element.
 * @param {HTMLElement} rootEl - the element to mount the chart shell into.
 * @returns {HTMLElement} rootEl (for chaining)
 */
export function mountChartShell(rootEl) {
  if (!rootEl) throw new Error('mountChartShell: no host element provided');
  rootEl.innerHTML = CHART_SHELL_HTML;
  return rootEl;
}
