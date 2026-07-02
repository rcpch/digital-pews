/**
 * Age-band selection
 *
 * Pure functions that decide which NPEWS chart / scoring band applies to a
 * patient at a given instant, from their date of birth — with calendar
 * exactitude.
 *
 * The canonical age-in-years bounds are the single source of truth in
 * spec/npews-scoring-spec.json (ageBandBounds), generated into
 * npews-scoring-config.js as AGE_BAND_BOUNDS. Each band is a half-open
 * interval [minAgeYears, maxAgeYears); the upper bound is exclusive and
 * null means open-ended.
 *
 * Every boundary (1st, 5th, 13th birthday) falls on an exact birthday, so we
 * select bands by CALENDAR completed-years rather than a 365.25-day
 * approximation — the latter mis-fires at leap-year birthdays (e.g. a child
 * born 2021-01-01 is exactly 4.999 "day-years" old on their 5th birthday).
 */

import { AGE_BAND_BOUNDS } from './npews-scoring-config.js';

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function toDate(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error(`age-band: invalid instant "${value}"`);
  return d;
}

/**
 * Parse the calendar date-of-birth into local Y/M/D parts. Accepts a Date or
 * an ISO string ('YYYY-MM-DD' optionally followed by a time).
 */
function dobParts(dob) {
  if (dob instanceof Date) {
    if (Number.isNaN(dob.getTime())) throw new Error('age-band: invalid date of birth');
    return { y: dob.getFullYear(), m: dob.getMonth(), d: dob.getDate() };
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dob));
  if (!match) throw new Error(`age-band: invalid date of birth "${dob}"`);
  return { y: Number(match[1]), m: Number(match[2]) - 1, d: Number(match[3]) };
}

/**
 * The local-midnight instant of the patient's Nth birthday. JS Date arithmetic
 * normalises an impossible date (29 Feb in a non-leap year) forward to 1 Mar,
 * which matches the completed-years convention below.
 */
function nthBirthday(parts, n) {
  return new Date(parts.y + n, parts.m, parts.d, 0, 0, 0, 0);
}

// ---------------------------------------------------------------------------
// Age in completed (whole) years — calendar exact
// ---------------------------------------------------------------------------

/**
 * Whole years completed between a date of birth and an instant. Returns a
 * negative number if the instant precedes the date of birth.
 * @param {string|Date} dob
 * @param {string|Date} at
 * @returns {number}
 */
export function completedYears(dob, at) {
  const b = dobParts(dob);
  const a = toDate(at);
  let years = a.getFullYear() - b.y;
  const beforeBirthday =
    a.getMonth() < b.m || (a.getMonth() === b.m && a.getDate() < b.d);
  if (beforeBirthday) years -= 1;
  return years;
}

// ---------------------------------------------------------------------------
// Band selection
// ---------------------------------------------------------------------------

/**
 * Map a completed-years value to an age-band id using the canonical bounds.
 * Returns null if no band matches (e.g. a negative age).
 * @param {number} years
 * @returns {string|null}
 */
export function ageBandForCompletedYears(years) {
  for (const [id, bounds] of Object.entries(AGE_BAND_BOUNDS)) {
    const okMin = years >= bounds.minAgeYears;
    const okMax = bounds.maxAgeYears === null || years < bounds.maxAgeYears;
    if (okMin && okMax) return id;
  }
  return null;
}

/**
 * The age band that applies to a patient born on `dob` at instant `at`.
 * @param {string|Date} dob
 * @param {string|Date} at
 * @returns {string|null}
 */
export function ageBandAt(dob, at) {
  return ageBandForCompletedYears(completedYears(dob, at));
}

/**
 * Resolve the age band for a patient at an instant, preferring an exact
 * calculation from `patient.dob` and falling back to a stored `patient.ageBand`
 * when no date of birth is available.
 * @param {{dob?: string|Date, ageBand?: string}} patient
 * @param {string|Date} at
 * @returns {string|null}
 */
export function resolveAgeBand(patient, at) {
  if (patient && patient.dob) {
    const band = ageBandAt(patient.dob, at);
    if (band) return band;
  }
  return (patient && patient.ageBand) || null;
}

// ---------------------------------------------------------------------------
// Boundary crossing
// ---------------------------------------------------------------------------

/**
 * The age-band boundaries (birthday instants) that fall within (startTs, endTs].
 * Each entry marks where the chart transitions from one band to the next.
 * @param {string|Date} dob
 * @param {string|Date} startTs
 * @param {string|Date} endTs
 * @returns {Array<{ ts: Date, fromBand: string|null, toBand: string|null }>}
 */
export function ageBandBoundariesInRange(dob, startTs, endTs) {
  const parts = dobParts(dob);
  const start = toDate(startTs);
  const end = toDate(endTs);
  const out = [];
  // Candidate boundary ages = each band's exclusive upper bound (1, 5, 13, ...).
  for (const bounds of Object.values(AGE_BAND_BOUNDS)) {
    if (bounds.maxAgeYears === null) continue;
    const ts = nthBirthday(parts, bounds.maxAgeYears);
    if (ts > start && ts <= end) {
      out.push({
        ts,
        fromBand: ageBandForCompletedYears(bounds.maxAgeYears - 1),
        toBand: ageBandForCompletedYears(bounds.maxAgeYears),
      });
    }
  }
  out.sort((left, right) => left.ts - right.ts);
  return out;
}

/**
 * Split a time window into contiguous segments of constant age band, breaking
 * at each birthday boundary the patient crosses within the window. Used to draw
 * age-specific scoring-band backgrounds that join seamlessly across a boundary.
 *
 * When the patient has no date of birth, a single segment spanning the whole
 * window is returned using the stored age band.
 *
 * @param {{dob?: string|Date, ageBand?: string}} patient
 * @param {string|Date} startTs
 * @param {string|Date} endTs
 * @returns {Array<{ ageBand: string|null, startTs: Date, endTs: Date }>}
 */
export function ageBandSegments(patient, startTs, endTs) {
  const start = toDate(startTs);
  const end = toDate(endTs);

  if (!patient || !patient.dob) {
    return [{ ageBand: resolveAgeBand(patient, end), startTs: start, endTs: end }];
  }

  const boundaries = ageBandBoundariesInRange(patient.dob, start, end);
  // Band at the start of the window; fall back to the band at the end if the
  // window opens before birth (start age < 0).
  let band = ageBandAt(patient.dob, start) || ageBandAt(patient.dob, end);

  const segments = [];
  let segStart = start;
  for (const boundary of boundaries) {
    segments.push({ ageBand: band, startTs: segStart, endTs: boundary.ts });
    segStart = boundary.ts;
    band = boundary.toBand;
  }
  segments.push({ ageBand: band, startTs: segStart, endTs: end });
  return segments;
}

// Browser global (so a classic <script> consumer can reach these too).
if (typeof window !== 'undefined') {
  window.NPEWSAgeBand = {
    completedYears,
    ageBandForCompletedYears,
    ageBandAt,
    resolveAgeBand,
    ageBandBoundariesInRange,
    ageBandSegments,
  };
}
