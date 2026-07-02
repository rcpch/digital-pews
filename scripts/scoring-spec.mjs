/**
 * Pure builders / renderers for the canonical NPEWS scoring spec.
 *
 * Single source of truth: spec/npews-scoring-spec.json
 *
 * These functions are imported by:
 *   - scripts/generate-scoring.mjs  (writes the runtime config + unified markdown)
 *   - test/scoring/config-matches-spec.test.js  (drift guard)
 *
 * They are pure (no side effects) apart from loadSpec(), which reads the JSON.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const SPEC_PATH = join(__dirname, '..', 'spec', 'npews-scoring-spec.json');
export const CONFIG_PATH = join(__dirname, '..', 'pews-chart', 'npews-scoring-config.js');
export const TABLES_MD_PATH = join(__dirname, '..', 'spec', 'npews-scoring-tables.generated.md');

export const GEN_START = '// <<< GENERATED SCORING BANDS START — do not edit by hand; run `npm run generate:scoring` >>>';
export const GEN_END = '// <<< GENERATED SCORING BANDS END >>>';

// Order in which scoring parameters are emitted into each age band.
export const PARAM_ORDER = [
  'respiratoryRate',
  'heartRate',
  'bloodPressureSystolic',
  'oxygenSaturation',
  'oxygenDeliveryPercent',
  'oxygenDeliveryLpm',
];

export const PARAM_LABELS = {
  respiratoryRate: 'Respiratory Rate (breaths/min)',
  heartRate: 'Heart Rate (bpm)',
  bloodPressureSystolic: 'Blood Pressure — systolic (mmHg)',
  oxygenSaturation: 'Oxygen Saturation (SpO\u2082 %)',
  oxygenDeliveryPercent: 'Oxygen Support Level (FiO\u2082 %)',
  oxygenDeliveryLpm: 'Oxygen Support Level (L/min)',
};

export function loadSpec(path = SPEC_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function scoreToColor(spec, score) {
  const color = spec.scoreColors[String(score)];
  if (!color) throw new Error(`scoring-spec: no colour mapped for score ${score}`);
  return color;
}

/**
 * Expand a [min, max, score] triple into the runtime band object.
 */
function tripleToBand(spec, [min, max, score]) {
  return { min, max, score, color: scoreToColor(spec, score) };
}

/**
 * Build the scoringBands object for one age band, merging the shared
 * SpO2 / oxygen-delivery bands with that band's per-age vitals.
 */
export function buildScoringBands(spec, ageBand) {
  const vitals = spec.vitals[ageBand];
  if (!vitals) throw new Error(`scoring-spec: unknown ageBand "${ageBand}"`);
  const out = {};
  out.respiratoryRate = vitals.respiratoryRate.map((t) => tripleToBand(spec, t));
  out.heartRate = vitals.heartRate.map((t) => tripleToBand(spec, t));
  out.bloodPressureSystolic = vitals.bloodPressureSystolic.map((t) => tripleToBand(spec, t));
  out.oxygenSaturation = spec.shared.oxygenSaturation.map((t) => tripleToBand(spec, t));
  out.oxygenDeliveryPercent = spec.shared.oxygenDeliveryPercent.map((t) => tripleToBand(spec, t));
  out.oxygenDeliveryLpm = spec.shared.oxygenDeliveryLpm.map((t) => tripleToBand(spec, t));
  return out;
}

export function buildScoringBandsByAge(spec) {
  const out = {};
  for (const ageBand of spec.ageBands) out[ageBand] = buildScoringBands(spec, ageBand);
  return out;
}

/**
 * Return the canonical age-in-years bounds map ({ minAgeYears, maxAgeYears })
 * keyed by age band, validating that the bands form a contiguous, gap-free,
 * half-open partition of [0, ∞).
 */
export function buildAgeBandBounds(spec) {
  const bounds = spec.ageBandBounds;
  if (!bounds) throw new Error('scoring-spec: spec.ageBandBounds is missing');
  let expectedMin = 0;
  for (const ageBand of spec.ageBands) {
    const b = bounds[ageBand];
    if (!b) throw new Error(`scoring-spec: no ageBandBounds for "${ageBand}"`);
    if (b.minAgeYears !== expectedMin) {
      throw new Error(
        `scoring-spec: ageBandBounds for "${ageBand}" start at ${b.minAgeYears}, expected ${expectedMin} (bands must be contiguous)`,
      );
    }
    if (b.maxAgeYears !== null && b.maxAgeYears <= b.minAgeYears) {
      throw new Error(`scoring-spec: ageBandBounds for "${ageBand}" has maxAgeYears <= minAgeYears`);
    }
    expectedMin = b.maxAgeYears;
  }
  if (expectedMin !== null) {
    throw new Error('scoring-spec: the final age band must be open-ended (maxAgeYears: null)');
  }
  return bounds;
}

// ---------------------------------------------------------------------------
// JS code generation (for npews-scoring-config.js)
// ---------------------------------------------------------------------------

function fmtBandLine(band) {
  return `      { min: ${band.min}, max: ${band.max}, score: ${band.score}, color: '${band.color}' },`;
}

function fmtParamArray(name, bands) {
  const lines = bands.map(fmtBandLine).join('\n');
  return `    ${name}: [\n${lines}\n    ],`;
}

/**
 * Render `const SCORING_BANDS_BY_AGE = { ... };` followed by
 * `const AGE_BAND_BOUNDS = { ... };` exactly as they should appear between the
 * generation markers in npews-scoring-config.js.
 */
export function renderConfigBandsBlock(spec) {
  const byAge = buildScoringBandsByAge(spec);
  const bandsForAge = (ageBand) =>
    PARAM_ORDER.map((p) => fmtParamArray(p, byAge[ageBand][p])).join('\n');

  const ageEntries = spec.ageBands
    .map((ageBand) => `  '${ageBand}': {\n${bandsForAge(ageBand)}\n  },`)
    .join('\n');

  const bounds = buildAgeBandBounds(spec);
  const fmtMax = (max) => (max === null ? 'null' : String(max));
  const boundsEntries = spec.ageBands
    .map((ageBand) => {
      const b = bounds[ageBand];
      return `  '${ageBand}': { minAgeYears: ${b.minAgeYears}, maxAgeYears: ${fmtMax(b.maxAgeYears)} },`;
    })
    .join('\n');

  return [
    `const SCORING_BANDS_BY_AGE = {\n${ageEntries}\n};`,
    '',
    '// Canonical age-in-years bounds per band (half-open [minAgeYears, maxAgeYears);',
    '// maxAgeYears null = open-ended). Used by pews-chart/age-band.js to select the',
    '// applicable band from a patient date of birth with calendar exactitude.',
    `const AGE_BAND_BOUNDS = {\n${boundsEntries}\n};`,
  ].join('\n');
}

/**
 * Splice the generated bands block between the markers in an existing
 * config.js source string. Returns the new file contents.
 */
export function spliceConfig(configSource, spec) {
  const block = renderConfigBandsBlock(spec);
  const startIdx = configSource.indexOf(GEN_START);
  const endIdx = configSource.indexOf(GEN_END);
  if (startIdx === -1 || endIdx === -1) {
    throw new Error('scoring-spec: generation markers not found in config source');
  }
  const before = configSource.slice(0, startIdx + GEN_START.length);
  const after = configSource.slice(endIdx);
  return `${before}\n${block}\n${after}`;
}

// ---------------------------------------------------------------------------
// Markdown generation (unified params x age-bands table)
// ---------------------------------------------------------------------------

function fmtRange(spec, band) {
  const { min, max, score } = band;
  const colour = scoreToColor(spec, score);
  const cap = colour.charAt(0).toUpperCase() + colour.slice(1);
  let range;
  if (max === spec.sentinels.rate) range = `${min}+`;
  else range = `${min}\u2013${max}`;
  return `${range} \u2192 ${score} (${cap})`;
}

export function renderUnifiedMarkdown(spec) {
  const byAge = buildScoringBandsByAge(spec);
  const bands = spec.ageBands;
  const header = `| ${bands.map((b) => spec.ageBandDisplay[b].label).join(' | ')} |`;
  const divider = `| ${bands.map(() => '---').join(' | ')} |`;

  const sections = PARAM_ORDER.map((param) => {
    const cells = bands.map((ageBand) =>
      byAge[ageBand][param].map((band) => fmtRange(spec, band)).join('<br>'),
    );
    return `### ${PARAM_LABELS[param]}\n\n${header}\n${divider}\n| ${cells.join(' | ')} |\n`;
  }).join('\n');

  const rd = spec.categorical.respiratoryDistress;
  const rdRows = Object.entries(rd)
    .map(([k, v]) => `| ${k} | ${v} (${k === 'none' ? 'White' : scoreToColor(spec, v).replace(/^./, (c) => c.toUpperCase())}) |`)
    .join('\n');

  const oxy = spec.categorical.oxygen;

  return `<!-- GENERATED FILE — do not edit by hand.
     Source of truth: spec/npews-scoring-spec.json
     Regenerate with: npm run generate:scoring -->

# NPEWS Scoring — Unified Reference Table

> ${spec.meta.source}
>
> ${spec.meta.verified}
>
> Colours: **White (0)**, **Yellow (1)**, **Orange (2)**, **Pink (4)**. Each cell lists every
> band as \`range \u2192 score (Colour)\`; bands are inclusive and meet at \`x.99\` boundaries.
>
> **Conformance:** ${spec.meta.conformance}

## Numerically scored vital signs

${sections}
## Categorical parameters (all age bands)

### Respiratory Distress

| Severity | Score |
| --- | --- |
${rdRows}

### Capillary Refill Time

| Range | Score |
| --- | --- |
| \u2264 2 seconds | 0 (White) |
| \u2265 ${spec.categorical.capillaryRefill.thresholdSeconds} seconds | ${spec.categorical.capillaryRefill.score} (Orange) |

> ${spec.categorical.capillaryRefill.note}

### Oxygen Support Device

- **Score ${oxy.highFlowScore} (Pink), overrides delivery level:** ${oxy.highFlowDevices.join(', ')} (High Flow, BiPAP, CPAP)
- **Scored per delivery level:** ${oxy.levelDevices.join(', ')} (Nasal prongs, Face mask, Head box, Non-rebreather)

## Not numerically scored

These are recorded and drive escalation only — they do **not** add to the PEWS total
(national SPOT NPEWS conformance).

- **Temperature** — ${spec.nonScoring.temperature.role}: high ${spec.nonScoring.temperature.triggers.high}, low ${spec.nonScoring.temperature.triggers.low}.
- **AVPU** — ${spec.nonScoring.avpu.role}: V \u2192 ${spec.nonScoring.avpu.triggers.V}; P/U \u2192 ${spec.nonScoring.avpu.triggers.P}.

## Escalation (PEWS total \u2192 level)

| Level | PEWS total |
| --- | --- |
${spec.escalation.levels.map((l) => `| ${l.label} | ${l.max === null ? `${l.min}+` : `${l.min}\u2013${l.max}`} |`).join('\n')}
`;
}
