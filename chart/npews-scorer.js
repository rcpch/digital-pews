// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

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
 * national standard they are recorded outside the total (temperature produces
 * a sepsis warning; AVPU produces a specific-concern escalation decision).
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
const ESCALATION_LEVEL_RANK = new Map([
  ['none', 0],
  ['low', 1],
  ['medium', 2],
  ['high', 3],
  ['emergency', 4],
]);
const NON_SCORE_TRIGGER_CODES = new Set(['SC', 'CQ', 'CI']);
const CLINICAL_INTUITION_RESPONSES = new Set(['yes', 'no', 'skip']);
const CARER_QUESTION_RESPONSES = new Set(['W', 'S', 'B', 'A', 'U', 'skip']);
const SEPSIS_SUSPICION_VALUES = new Set(['none', 'sepsis', 'septic-shock']);
const AVPU_VALUES = new Set(['A', 'V', 'P', 'U', 'asleep']);

const EXPLICIT_TRIGGER_CRITERIA = {
  SC: 'other-specific-concern',
  CQ: 'carer-question',
  CI: 'clinical-intuition',
};

function validateResponse(value, allowed, field) {
  if (value != null && !allowed.has(value)) {
    throw new TypeError(`unknown ${field} response "${value}"`);
  }
}

function hostTriggerDecisions(observation) {
  const triggers = observation.escalationTriggers ?? [];
  if (!Array.isArray(triggers)) {
    throw new TypeError('escalationTriggers must be an array');
  }

  for (const code of ['CI', 'CQ', 'SC']) {
    if (triggers.filter(trigger => trigger?.code === code).length > 1) {
      throw new TypeError(`escalationTriggers must contain at most one ${code} decision`);
    }
  }

  return triggers.map(trigger => ({
    code: trigger?.code,
    level: trigger?.level,
    criterion: EXPLICIT_TRIGGER_CRITERIA[trigger?.code],
    origin: 'host-selected',
  }));
}

/**
 * Derive automatic non-score escalation decisions and clinical warnings from
 * one observation. Temperature prompts sepsis consideration but does not assign
 * an escalation level.
 *
 * @param {object} observation
 * @returns {{decisions:Array<object>, clinicalWarnings:Array<object>}}
 */
export function deriveNonScoreEscalation(observation) {
  const decisions = [];
  const clinicalWarnings = [];

  if (observation.avpu != null && !AVPU_VALUES.has(observation.avpu)) {
    throw new TypeError(`unknown avpu value "${observation.avpu}"`);
  }
  if (observation.avpu === 'V') {
    decisions.push({ code: 'SC', level: 'high', criterion: 'avpu-v', origin: 'derived' });
  } else if (observation.avpu === 'P' || observation.avpu === 'U') {
    decisions.push({ code: 'SC', level: 'emergency', criterion: `avpu-${observation.avpu.toLowerCase()}`, origin: 'derived' });
  }

  if (observation.abnormalPupillaryResponse === true) {
    decisions.push({ code: 'SC', level: 'emergency', criterion: 'abnormal-pupillary-response', origin: 'derived' });
  } else if (observation.abnormalPupillaryResponse != null && observation.abnormalPupillaryResponse !== false) {
    throw new TypeError('abnormalPupillaryResponse must be a boolean or null');
  }

  const sepsisSuspicion = observation.newSepsisSuspicion;
  if (sepsisSuspicion != null && !SEPSIS_SUSPICION_VALUES.has(sepsisSuspicion)) {
    throw new TypeError(`unknown newSepsisSuspicion value "${sepsisSuspicion}"`);
  }
  if (sepsisSuspicion === 'sepsis') {
    decisions.push({ code: 'SC', level: 'medium', criterion: 'new-suspicion-of-sepsis', origin: 'derived' });
  } else if (sepsisSuspicion === 'septic-shock') {
    decisions.push({ code: 'SC', level: 'high', criterion: 'new-suspicion-of-septic-shock', origin: 'derived' });
  }

  if (observation.temperature != null && (typeof observation.temperature !== 'number' || !Number.isFinite(observation.temperature))) {
    throw new TypeError('temperature must be a finite number or null');
  }
  if (observation.temperature >= 38) {
    clinicalWarnings.push({
      code: 'THINK_SEPSIS',
      criterion: 'temperature-at-or-above-38',
      message: 'Temperature ≥38°C - think sepsis',
    });
  } else if (observation.temperature != null && observation.temperature < 36) {
    clinicalWarnings.push({
      code: 'THINK_SEPSIS',
      criterion: 'temperature-below-36',
      message: 'Temperature <36°C - think sepsis',
    });
  }

  return { decisions, clinicalWarnings };
}

function pendingConcernResponses(observation, decisions) {
  validateResponse(observation.clinicalIntuition, CLINICAL_INTUITION_RESPONSES, 'clinicalIntuition');
  validateResponse(observation.carerQuestion, CARER_QUESTION_RESPONSES, 'carerQuestion');

  const ciDecision = decisions.find(decision => decision.code === 'CI');
  const cqDecision = decisions.find(decision => decision.code === 'CQ');
  if (ciDecision && observation.clinicalIntuition && observation.clinicalIntuition !== 'yes') {
    throw new TypeError('CI escalation decision requires clinicalIntuition "yes" or an omitted raw response');
  }
  if (cqDecision && observation.carerQuestion && observation.carerQuestion !== 'W') {
    throw new TypeError('CQ escalation decision requires carerQuestion "W" or an omitted raw response');
  }

  const pending = [];
  if (observation.clinicalIntuition === 'yes' && !ciDecision) {
    pending.push({ code: 'CI', response: 'yes' });
  }
  if (observation.carerQuestion === 'W' && !cqDecision) {
    pending.push({ code: 'CQ', response: 'W' });
  }
  return pending;
}

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
 * Validate non-score escalation triggers supplied by the host and select the
 * highest level across the numeric PEWS result and every trigger.
 *
 * @param {'low'|'medium'|'high'|'emergency'|null} scoreLevel
 * @param {Array<{code:'SC'|'CQ'|'CI', level:'none'|'low'|'medium'|'high'|'emergency', criterion?:string, origin?:string}>} triggers
 * @returns {{level:'low'|'medium'|'high'|'emergency'|null, reasons:Array<object>, decisions:Array<object>}}
 */
export function escalationFromScoreAndTriggers(scoreLevel, triggers = []) {
  if (!Array.isArray(triggers)) {
    throw new TypeError('escalationTriggers must be an array');
  }

  const decisions = [];
  for (const trigger of triggers) {
    if (!trigger || !NON_SCORE_TRIGGER_CODES.has(trigger.code)) {
      throw new TypeError(`unknown escalation trigger code "${trigger?.code}"`);
    }
    if (!ESCALATION_LEVEL_RANK.has(trigger.level)) {
      throw new TypeError(`unknown escalation level "${trigger.level}"`);
    }
    decisions.push({
      code: trigger.code,
      level: trigger.level,
      criterion: trigger.criterion || EXPLICIT_TRIGGER_CRITERIA[trigger.code],
      origin: trigger.origin || 'host-selected',
    });
  }

  const reasons = scoreLevel ? [{ code: 'P', level: scoreLevel, criterion: 'pews', origin: 'derived' }] : [];
  reasons.push(...decisions.filter(decision => decision.level !== 'none'));

  const level = reasons.reduce((highest, reason) => {
    return (ESCALATION_LEVEL_RANK.get(reason.level) || 0) > (ESCALATION_LEVEL_RANK.get(highest) || 0)
      ? reason.level
      : highest;
  }, null);

  return { level, reasons, decisions };
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
 * @returns {Array<object>} new objects with scores, escalation level, active
 *   reasons, all non-score decisions, pending responses and clinical warnings
 *   added (numeric scores are null when no age band can be resolved)
 */
export function scoreObservationsForPatient(patient, observations) {
  return observations.map((observation) => {
    const ageBand = resolveAgeBand(patient, observation.timestamp);
    const hostDecisions = hostTriggerDecisions(observation);
    const derived = deriveNonScoreEscalation(observation);
    const decisions = [...hostDecisions, ...derived.decisions];
    const pendingEscalationResponses = pendingConcernResponses(observation, hostDecisions);
    const hasAgeBand = ageBand && AGE_BANDS[ageBand];
    const scored = hasAgeBand ? scoreObservation(ageBand, observation) : { total: null, fields: null };
    const scoreEscalationLevel = scored.total == null ? null : escalationLevelFromScore(scored.total);
    const escalation = escalationFromScoreAndTriggers(scoreEscalationLevel, decisions);
    return {
      ...observation,
      ageBand: hasAgeBand ? ageBand : null,
      pewsTotal: scored.total,
      scoreEscalationLevel,
      escalationLevel: escalation.level,
      escalationReasons: escalation.reasons,
      escalationDecisions: escalation.decisions,
      pendingEscalationResponses,
      clinicalWarnings: derived.clinicalWarnings,
      scoreBreakdown: scored.fields,
    };
  });
}
