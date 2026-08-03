#!/usr/bin/env node

/* ============================================================
   generate-smart-seed.mjs
   ============================================================
   Generates smart/fhir-sandbox/seed/generated-pews.json - a FHIR
   transaction bundle - from the demo scenario catalogue in
   demo/scenarios.js using the project's own FHIR adapter.

   This is a generated artifact. Do not hand-edit. Run:

     node scripts/generate-smart-seed.mjs

   The generated bundle seeds one patient per demo scenario into the
   local HAPI R4 FHIR server. Each patient gets their own Patient,
   Encounter, and Observation resources with stable ids derived from
   the scenario id so re-seeding is idempotent (PUT by id).

   The hand-authored seed/pews.json (Alex Thompson only, ~10k lines)
   remains available as a fallback. To use the generated seed instead,
   change the --data flag in docker-compose.smart.yml or set
   SEED_FILE=/seed/generated-pews.json in .env and update the seed
   container command.
   ============================================================ */

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { fromChartModelToFhirBundle } from '../chart/fhir-adapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_PATH = join(ROOT, 'smart/fhir-sandbox/seed/generated-pews.json');

// Import scenarios. demo-data.js uses global scope (not ESM exports),
// so we need to handle that. scenarios.js imports from demo-data.js
// which sets globals. We replicate the data by evaluating the files.
// Since demo-data.js uses `const PATIENT = ...` at module scope without
// export, we need a different approach. Let's use a dynamic import
// with a shim that captures the globals.

// Actually, let's check if scenarios.js exports SCENARIOS:
// It does: `export const SCENARIOS = [...]`
// But it imports from demo-data.js which doesn't use ESM exports.
// So we need to read demo-data.js and eval it to get the globals,
// then import scenarios.js.

// Simpler approach: read both files, eval demo-data.js to get globals,
// then eval scenarios.js with those globals in scope.

import { readFileSync } from 'node:fs';

const demoDataSrc = readFileSync(join(ROOT, 'demo/demo-data.js'), 'utf8');
const scenariosSrc = readFileSync(join(ROOT, 'demo/scenarios.js'), 'utf8');

// demo-data.js declares globals like `const PATIENT = {...}` and has an
// `export { ... }` block at the end, plus a `if (typeof window !== 'undefined')`
// block for browser globals. We eval it in a function scope, stripping the
// export and window blocks, and return the variables we need.
const demoDataCleaned = demoDataSrc
  .replace(/\bexport\s*\{[\s\S]*?\};?/g, '')
  .replace(/if\s*\(\s*typeof\s+window\s*!==?\s*'undefined'\s*\)\s*\{[\s\S]*?\n\}/g, '');
const demoDataFn = new Function(`
  ${demoDataCleaned}
  return { PATIENT, OBSERVATIONS, PATIENT_FEBRILE_CONVULSION, OBSERVATIONS_FEBRILE_CONVULSION };
`);
const demoData = demoDataFn();

// scenarios.js is an ES module that imports from demo-data.js.
// We need to transform it: replace the import with our injected globals
// and capture the SCENARIOS export.
const scenariosTransformed = scenariosSrc
  .replace(/^import\s+\{[\s\S]*?\}\s+from\s+.*$/m, '')
  .replace(/\bexport\s+(const|function|let|var)\b/g, '$1');

const scenariosFn = new Function(`
  const { PATIENT, OBSERVATIONS, PATIENT_FEBRILE_CONVULSION, OBSERVATIONS_FEBRILE_CONVULSION } = arguments[0];
  ${scenariosTransformed}
  return SCENARIOS;
`);
const scenarios = scenariosFn(demoData);

console.log(`Loaded ${scenarios.length} scenarios from demo/scenarios.js`);

// Build a single FHIR transaction bundle with all scenarios as patients.
const allEntries = [];
let patientCounter = 0;

for (const scenario of scenarios) {
  patientCounter++;
  const patientId = `patient-${scenario.id}`;
  const encounterId = `encounter-${scenario.id}`;

  // Use the FHIR adapter to convert chart model -> FHIR bundle
  const bundle = fromChartModelToFhirBundle(
    scenario.patient,
    scenario.observations,
    {
      encounterId,
      patientId,
    }
  );

  // The adapter returns a Bundle with entries of { resource } (no request/fullUrl).
  // We need to add those for a transaction bundle, and rewrite ids/references
  // to use our scenario-based ids to avoid collisions across patients.
  for (const entry of bundle.entry) {
    const res = entry.resource;

    // Rewrite Patient id and references
    if (res.resourceType === 'Patient') {
      res.id = patientId;
      entry.request = { method: 'PUT', url: `Patient/${patientId}` };
      entry.fullUrl = `urn:uuid:${patientId}`;
    }

    // Rewrite Encounter id and references
    else if (res.resourceType === 'Encounter') {
      res.id = encounterId;
      res.subject.reference = `Patient/${patientId}`;
      entry.request = { method: 'PUT', url: `Encounter/${encounterId}` };
      entry.fullUrl = `urn:uuid:${encounterId}`;
    }

    // Rewrite Observation references and ids
    else if (res.resourceType === 'Observation') {
      res.subject.reference = `Patient/${patientId}`;
      if (res.encounter) {
        res.encounter.reference = `Encounter/${encounterId}`;
      }
      // Prefix the id with the scenario id to avoid collisions across patients
      const originalId = res.id;
      res.id = `${scenario.id}-${originalId}`;
      entry.request = { method: 'PUT', url: `Observation/${scenario.id}-${originalId}` };
      entry.fullUrl = `urn:uuid:${scenario.id}-${originalId}`;
    }

    allEntries.push(entry);
  }
}

const transactionBundle = {
  resourceType: 'Bundle',
  id: 'pews-generated-seed',
  type: 'transaction',
  meta: {
    generatedBy: 'scripts/generate-smart-seed.mjs',
    generatedAt: new Date().toISOString(),
    scenarioCount: scenarios.length,
    scenarioIds: scenarios.map(s => s.id),
  },
  entry: allEntries,
};

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, JSON.stringify(transactionBundle, null, 2) + '\n');

const totalResources = allEntries.length;
const patientCount = allEntries.filter(e => e.resource.resourceType === 'Patient').length;
const encounterCount = allEntries.filter(e => e.resource.resourceType === 'Encounter').length;
const observationCount = allEntries.filter(e => e.resource.resourceType === 'Observation').length;

console.log(`Generated ${OUTPUT_PATH}`);
console.log(`  ${totalResources} total resources: ${patientCount} patients, ${encounterCount} encounters, ${observationCount} observations`);
console.log(`  Scenarios: ${scenarios.map(s => `${s.id} (${s.ageBand})`).join(', ')}`);
console.log(`  File size: ${(Buffer.byteLength(JSON.stringify(transactionBundle)) / 1024).toFixed(0)} KB`);