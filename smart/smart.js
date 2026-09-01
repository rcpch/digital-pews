// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

/* ============================================================
   SMART-on-FHIR shell — boot the NPEWS chart from EHR data.

   Flow:
     1. FHIR.oauth2.ready() resolves the SMART client (OAuth done).
     2. Read the launch patient.
     3. Fetch the patient's Observation resources, filtered to the
        LOINC + RCPCH PEWS codes the chart understands. Falls back to
        an unfiltered query if the EHR rejects the code filter.
     4. Build a synthetic Bundle { Patient, Observations[] } and run it
        through fromFhirBundleToChartModel() — the same adapter the
        conformance tests exercise. Scores are computed by the chart,
        never stored.
     5. Set <npews-chart>.data = { patient, observations }.

   fhirclient.js (loaded via <script> in index.html) publishes a
   global `FHIR` object. We use it directly — no bundler, no build
   step, in keeping with the project's framework-neutral rule.
   ============================================================ */

import { fromFhirBundleToChartModel } from './chart/fhir-adapter.js';

const chartEl = document.getElementById('chart');
const statusEl = document.getElementById('chart-status');

// --- LOINC + RCPCH PEWS codes the chart consumes -----------------------------
// Source of truth: spec/fhir.md "LOINC vital-sign mappings" + "Local PEWS
// observation mappings". PEWS totals are NOT fetched — they are computed
// on the fly by the chart's scorer.
const LOINC = 'http://loinc.org';
const PEWS_SYSTEM = 'https://rcpch.github.io/fhir/CodeSystem/pews';
const CHART_CODES = [
  `${LOINC}|9279-1`,        // Respiratory rate
  `${LOINC}|59408-5`,       // Oxygen saturation
  `${LOINC}|8867-4`,        // Heart rate
  `${LOINC}|55284-4`,       // Blood pressure panel
  `${LOINC}|8310-5`,        // Body temperature
  `${LOINC}|44963-7`,       // Capillary refill time
  `${PEWS_SYSTEM}|pews-resp-distress`,
  `${PEWS_SYSTEM}|pews-o2-device`,
  `${PEWS_SYSTEM}|pews-o2-delivery`,
  `${PEWS_SYSTEM}|pews-avpu`,
];

// --- Status helpers ---------------------------------------------------------

function setStatus(message, kind = 'loading') {
  statusEl.textContent = message;
  statusEl.className = `chart-status chart-status--${kind}`;
}
function hideStatus() {
  statusEl.className = 'chart-status chart-status--hidden';
}

// --- FHIR fetch helpers -----------------------------------------------------

/**
 * Fetch all of the patient's Observations matching the given `code` token
 * list, paging through Bundle.link.next as needed.
 *
 * @param {fhirclient.Client} client
 * @param {string} patientId
 * @param {string|null} codeToken  comma-separated system|code list, or null
 * @returns {Promise<fhir.Observation[]>}
 */
async function fetchObservations(client, patientId, codeToken) {
  const params = new URLSearchParams();
  params.set('patient', patientId);
  params.set('_sort', 'date');
  params.set('_count', '1000');
  if (codeToken) params.set('code', codeToken);

  const observations = [];
  let bundle = await client.request(`Observation?${params.toString()}`);

  while (bundle) {
    if (Array.isArray(bundle.entry)) {
      for (const e of bundle.entry) {
        if (e?.resource?.resourceType === 'Observation') observations.push(e.resource);
      }
    }
    const next = bundle.link && bundle.link.find(l => l.relation === 'next');
    bundle = next ? await client.request(next.url) : null;
  }
  return observations;
}

/**
 * Fetch observations with the code filter. If that returns nothing AND the
 * EHR may have rejected the unknown RCPCH PEWS code system, retry once
 * without the code filter and let the adapter filter client-side.
 *
 * @param {fhirclient.Client} client
 * @param {string} patientId
 * @returns {Promise<fhir.Observation[]>}
 */
async function fetchChartObservations(client, patientId) {
  const codeToken = CHART_CODES.join(',');
  const filtered = await fetchObservations(client, patientId, codeToken);
  if (filtered.length > 0) return filtered;

  // Fallback: some EHRs reject `code=` queries that reference code systems
  // they don't know (the RCPCH PEWS system is repo-local). Retry unfiltered
  // and let fromFhirBundleToChartModel drop unknown codes.
  return fetchObservations(client, patientId, null);
}

// --- Boot -------------------------------------------------------------------

FHIR.oauth2.ready()
  .then(async client => {
    const patientId = client.patient.id;
    if (!patientId) {
      setStatus('No launch patient in the SMART context. Open this app from an EHR patient launch.', 'error');
      return;
    }

    setStatus(`Loading patient ${patientId}…`);

    // 1. Patient
    const patient = await client.patient.read();

    // 2. Observations (code-filtered, with unfiltered fallback)
    setStatus('Loading observations…');
    const observations = await fetchChartObservations(client, patientId);

    if (observations.length === 0) {
      setStatus('No observations found for this patient.', 'empty');
      return;
    }

    // 3. Build a synthetic Bundle and run it through the adapter. The
    //    adapter groups by effectiveDateTime, dispatches on code, handles
    //    BP components, skip reasons, oxygen delivery units, etc. Unknown
    //    codes are dropped silently.
    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: [
        { resource: patient },
        ...observations.map(resource => ({ resource })),
      ],
    };

    let chartModel;
    try {
      chartModel = fromFhirBundleToChartModel(bundle);
    } catch (err) {
      console.error('FHIR -> chart model mapping failed:', err);
      setStatus(`Failed to map observations: ${err.message}`, 'error');
      return;
    }

    if (chartModel.observations.length === 0) {
      setStatus('No PEWS-relevant observations found for this patient.', 'empty');
      return;
    }

    // 4. Feed the chart. Scores are computed by the chart from DOB + vitals.
    chartEl.data = {
      patient: chartModel.patient,
      observations: chartModel.observations,
    };
    hideStatus();
  })
  .catch(err => {
    console.error('SMART on FHIR boot failed:', err);
    const msg = (err && err.message) ? err.message : 'Unknown error initialising the SMART session.';
    setStatus(`Failed to initialise: ${msg}`, 'error');
  });
