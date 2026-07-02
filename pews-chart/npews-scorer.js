/**
 * NPEWS scorer
 *
 * Pure functions for computing PEWS scores from ChartObservation fields.
 * Uses the scoring bands defined in npews-scoring-config.js (which are generated
 * from the canonical source of truth, spec/npews-scoring-spec.json).
 *
 * Conformance: this implements the national SPOT NPEWS numeric algorithm. The
 * scored parameters are respiratory rate, respiratory distress, SpO2, oxygen
 * support (device + level), heart rate, systolic blood pressure and capillary
 * refill time.
 *
 * Temperature and AVPU are deliberately NOT part of the numeric total — per the
 * national standard they are recorded and drive escalation only (temperature =
 * sepsis / escalation trigger; AVPU = specific-concern escalation trigger).
 * Their escalation handling is separate from this numeric score.
 */

import { AGE_BANDS } from './npews-scoring-config.js';
import { resolveAgeBand } from './age-band.js';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Score a numeric value against a sorted array of inclusive [min, max] bands.
 * Returns 0 if no band matches.
 * @param {number} value
 * @param {Array<{min: number, max: number, score: number}>} bands
 * @returns {number}
 */
function scoreFromBands(value, bands) {
  for (const band of bands) {
    if (value >= band.min && value <= band.max) return band.score;
  }
  return 0;
}

// Devices that override with score 4 regardless of delivery level.
const HIGH_FLOW_DEVICES = new Set(['HF', 'BiP', 'CP']);
// Devices where the delivery-level score applies.
const LEVEL_DEVICES = new Set(['NP', 'FM', 'HB', 'NRB']);

/**
 * Score oxygen: device overrides take precedence over delivery level.
 * @param {string|null} device
 * @param {{ value: number, unit: '%' | 'L/min' } | null} delivery
 * @param {object} ageBandConfig
 * @returns {number}
 */
function scoreOxygen(device, delivery, ageBandConfig) {
  if (!device || device === 'air') return 0;
  if (HIGH_FLOW_DEVICES.has(device)) return 4;
  if (LEVEL_DEVICES.has(device) && delivery) {
    const bands = delivery.unit === 'L/min'
      ? ageBandConfig.scoringBands.oxygenDeliveryLpm
      : ageBandConfig.scoringBands.oxygenDeliveryPercent;
    return scoreFromBands(delivery.value, bands);
  }
  return 0;
}

/**
 * Score respiratory distress.
 * @param {string|null} value - 'none'|'mild'|'moderate'|'severe'
 * @returns {number}
 */
function scoreRespDistress(value) {
  if (!value || value === 'none') return 0;
  if (value === 'mild') return 1;
  if (value === 'moderate') return 2;
  if (value === 'severe') return 4;
  return 0;
}

/**
 * Score capillary refill time (seconds).
 * @param {number|null} value
 * @returns {number}
 */
function scoreCrt(value) {
  if (value === null || value === undefined) return 0;
  return value >= 3 ? 2 : 0;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute the NPEWS total score and per-field breakdown for one observation
 * round. Null/undefined field values score 0 (observation not taken).
 *
 * @param {string} ageBand - '0-11m' | '1-4y' | '5-12y' | '13+y'
 * @param {object} obs - ChartObservation-shaped object
 * @returns {{ total: number, fields: object }}
 */
export function scoreObservation(ageBand, obs) {
  const config = AGE_BANDS[ageBand];
  if (!config) throw new Error(`scoreObservation: unknown ageBand "${ageBand}"`);

  const b = config.scoringBands;

  const fields = {
    respiratoryRate:     obs.respiratoryRate    != null ? scoreFromBands(obs.respiratoryRate, b.respiratoryRate)           : 0,
    respiratoryDistress: scoreRespDistress(obs.respiratoryDistress),
    oxygenSaturation:    obs.oxygenSaturation   != null ? scoreFromBands(obs.oxygenSaturation, b.oxygenSaturation)         : 0,
    oxygen:              scoreOxygen(obs.oxygenDevice, obs.oxygenDelivery, config),
    heartRate:           obs.heartRate          != null ? scoreFromBands(obs.heartRate, b.heartRate)                       : 0,
    bloodPressure:       obs.bloodPressureSystolic != null ? scoreFromBands(obs.bloodPressureSystolic, b.bloodPressureSystolic) : 0,
    capillaryRefill:     scoreCrt(obs.capillaryRefill),
    // NOTE: temperature and AVPU are intentionally excluded from the numeric
    // total (national SPOT NPEWS conformance) — they are escalation triggers.
  };

  const total = Object.values(fields).reduce((sum, v) => sum + v, 0);
  return { total, fields };
}

/**
 * Derive escalation level from a PEWS total.
 * @param {number} total
 * @returns {'low' | 'medium' | 'high' | 'emergency' | null}
 */
export function escalationLevelFromScore(total) {
  if (total >= 13) return 'emergency';
  if (total >= 9)  return 'high';
  if (total >= 5)  return 'medium';
  if (total >= 1)  return 'low';
  return null;
}

/**
 * Decorate a patient's observations with their computed PEWS score, escalation
 * level and the age band that applied at each observation's timestamp.
 *
 * The age band is resolved per observation from the patient's date of birth, so
 * a child charted across a birthday is scored against the correct band on each
 * side of the boundary. Any pre-existing pewsTotal / escalationLevel on the
 * input (e.g. carried in from FHIR) is overridden: the algorithm is the single
 * source of truth.
 *
 * @param {{dob?: string, ageBand?: string}} patient
 * @param {Array<object>} observations - ChartObservation-shaped objects
 * @returns {Array<object>} new objects with ageBand, pewsTotal, escalationLevel,
 *   scoreBreakdown added (scores are null when no age band can be resolved)
 */
export function scoreObservationsForPatient(patient, observations) {
  return observations.map((observation) => {
    const ageBand = resolveAgeBand(patient, observation.timestamp);
    if (!ageBand || !AGE_BANDS[ageBand]) {
      return { ...observation, ageBand: null, pewsTotal: null, escalationLevel: null, scoreBreakdown: null };
    }
    const { total, fields } = scoreObservation(ageBand, observation);
    return {
      ...observation,
      ageBand,
      pewsTotal: total,
      escalationLevel: escalationLevelFromScore(total),
      scoreBreakdown: fields,
    };
  });
}
