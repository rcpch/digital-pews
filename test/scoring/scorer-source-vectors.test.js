/**
 * R11 — source-derived scorer vectors.
 *
 * These tests exercise chart/npews-scorer.js against test vectors derived
 * directly from the canonical specification (spec/npews-scoring-spec.json),
 * NOT against the generated runtime config. That distinction is the point of
 * this suite: config-matches-spec.test.js proves the generator faithfully
 * copies the spec, and this suite proves the scorer actually *behaves* as the
 * spec requires at every band boundary in every age band.
 *
 * Vectors are enumerated from the raw `[min, max, score]` triples so that a
 * threshold change in the canonical JSON is automatically exercised here.
 */

import { describe, it, expect } from 'vitest';
import { loadSpec } from '../../scripts/scoring-spec.mjs';
import {
  scoreObservation,
  escalationLevelFromScore,
} from '../../chart/npews-scorer.js';

const spec = loadSpec();

/**
 * Numeric parameters, mapping the canonical spec parameter name to the
 * observation input key and the scoreBreakdown field it must contribute to.
 * `source` says where the triples live: per-age `vitals` or cross-age `shared`.
 */
const NUMERIC_PARAMS = [
  { param: 'respiratoryRate', obsKey: 'respiratoryRate', field: 'respiratoryRate', source: 'vitals' },
  { param: 'heartRate', obsKey: 'heartRate', field: 'heartRate', source: 'vitals' },
  { param: 'bloodPressureSystolic', obsKey: 'bloodPressureSystolic', field: 'bloodPressure', source: 'vitals' },
  { param: 'oxygenSaturation', obsKey: 'oxygenSaturation', field: 'oxygenSaturation', source: 'shared' },
];

/** Triples for one parameter in one age band, straight from the canonical spec. */
function triplesFor({ param, source }, ageBand) {
  return source === 'shared' ? spec.shared[param] : spec.vitals[ageBand][param];
}

/**
 * Values falling strictly between two declared bands.
 *
 * The canonical bands use `.99`-style upper bounds (e.g. `[0, 9.99, 4]` then
 * `[10, 19.99, 2]`), so they are NOT contiguous: `(9.99, 10)` belongs to no
 * band. `scoreFromBands` has no match for such a value and falls through to its
 * `return 0` default. These slivers are unreachable for integer-valued vitals,
 * but they are reachable for any parameter a device may report with more than
 * two decimal places.
 */
function gapValuesFor(triples) {
  const gaps = [];
  for (let i = 0; i < triples.length - 1; i += 1) {
    const prevMax = triples[i][1];
    const nextMin = triples[i + 1][0];
    if (nextMin > prevMax) {
      const mid = prevMax + (nextMin - prevMax) / 2;
      if (mid > prevMax && mid < nextMin) gaps.push({ mid, prevMax, nextMin });
    }
  }
  return gaps;
}

/** An observation with every scored field absent, so one field can be isolated. */
function blankObservation() {
  return {
    respiratoryRate: null,
    respiratoryDistress: null,
    oxygenSaturation: null,
    oxygenDevice: null,
    oxygenDelivery: null,
    heartRate: null,
    bloodPressureSystolic: null,
    capillaryRefill: null,
  };
}

function scoreOne(ageBand, obsKey, value) {
  return scoreObservation(ageBand, { ...blankObservation(), [obsKey]: value });
}

describe('R11 source-derived scorer vectors', () => {
  it('covers every age band declared in the canonical spec', () => {
    expect(spec.ageBands).toEqual(['0-11m', '1-4y', '5-12y', '13+y']);
  });

  // An unresolvable age band must fail loudly rather than score against a
  // default band. scoreObservationsForPatient relies on this to leave pewsTotal
  // null when the DOB cannot place the observation.
  it('refuses to score against an unknown age band', () => {
    expect(() => scoreObservation('7-9y', blankObservation())).toThrow(/unknown ageBand/);
  });

  describe.each(spec.ageBands)('age band %s', (ageBand) => {
    describe.each(NUMERIC_PARAMS)('$param', (paramDef) => {
      const triples = triplesFor(paramDef, ageBand);

      it('scores the exact lower bound of every band', () => {
        for (const [min, , expected] of triples) {
          const { fields } = scoreOne(ageBand, paramDef.obsKey, min);
          expect(fields[paramDef.field], `${paramDef.param}=${min} in ${ageBand}`).toBe(expected);
        }
      });

      it('scores the exact upper bound of every band', () => {
        for (const [, max, expected] of triples) {
          const { fields } = scoreOne(ageBand, paramDef.obsKey, max);
          expect(fields[paramDef.field], `${paramDef.param}=${max} in ${ageBand}`).toBe(expected);
        }
      });

      it('scores a value inside every band', () => {
        for (const [min, max, expected] of triples) {
          const mid = min + (max - min) / 2;
          const { fields } = scoreOne(ageBand, paramDef.obsKey, mid);
          expect(fields[paramDef.field], `${paramDef.param}=${mid} in ${ageBand}`).toBe(expected);
        }
      });

      // NOTE: this asserts the declared edge on each side of a transition. It
      // deliberately does NOT claim the bands are contiguous — see the
      // undeclared-gap characterisation test below, which shows they are not.
      it('scores each declared band edge on the correct side of every transition', () => {
        for (let i = 0; i < triples.length - 1; i += 1) {
          const [, prevMax, prevScore] = triples[i];
          const [nextMin, , nextScore] = triples[i + 1];
          const below = scoreOne(ageBand, paramDef.obsKey, prevMax).fields[paramDef.field];
          const above = scoreOne(ageBand, paramDef.obsKey, nextMin).fields[paramDef.field];
          expect(below, `${paramDef.param} at ${prevMax} (${ageBand})`).toBe(prevScore);
          expect(above, `${paramDef.param} at ${nextMin} (${ageBand})`).toBe(nextScore);
        }
      });

      // CHARACTERISATION, NOT ENDORSEMENT (bug log B-01).
      // A value in the undeclared interval between two bands matches no band
      // and falls through to the `return 0` default in `scoreFromBands` — i.e.
      // it is scored "normal" even when both neighbouring bands score above 0.
      // Pinned so that any future change is deliberate and visible.
      it('scores a value between two declared bands as 0', () => {
        for (const { mid, prevMax, nextMin } of gapValuesFor(triples)) {
          const { fields } = scoreOne(ageBand, paramDef.obsKey, mid);
          expect(
            fields[paramDef.field],
            `${paramDef.param}=${mid} lies in undeclared gap (${prevMax}, ${nextMin}) in ${ageBand}`,
          ).toBe(0);
        }
      });

      // CHARACTERISATION, NOT ENDORSEMENT (bug log B-02).
      // A value beyond the outermost declared bounds also returns 0, so an
      // implausible or mis-united reading scores as "normal" rather than as the
      // most abnormal band or an explicit error.
      it('scores a value outside the declared range as 0', () => {
        const lowest = triples[0][0];
        const highest = triples[triples.length - 1][1];
        for (const value of [lowest - 1, highest + 1]) {
          const { fields } = scoreOne(ageBand, paramDef.obsKey, value);
          expect(
            fields[paramDef.field],
            `${paramDef.param}=${value} lies outside [${lowest}, ${highest}] in ${ageBand}`,
          ).toBe(0);
        }
      });

      // CHARACTERISATION, NOT ENDORSEMENT (bug log B-03).
      // NaN fails every >= / <= comparison, so a non-finite reading is
      // indistinguishable from a genuine 0. `scoreObservation` performs no
      // numeric validation, unlike `deriveNonScoreEscalation`.
      it('scores a non-finite value as 0 without raising', () => {
        for (const value of [Number.NaN, Number.POSITIVE_INFINITY]) {
          const { fields } = scoreOne(ageBand, paramDef.obsKey, value);
          expect(fields[paramDef.field], `${paramDef.param}=${value} in ${ageBand}`).toBe(0);
        }
      });

      it('contributes only to its own breakdown field', () => {
        const [min, , expected] = triples.find(([, , score]) => score > 0) ?? triples[0];
        const { total, fields } = scoreOne(ageBand, paramDef.obsKey, min);
        expect(total).toBe(expected);
        for (const [name, value] of Object.entries(fields)) {
          if (name !== paramDef.field) {
            expect(value, `${name} must stay 0 when only ${paramDef.param} is set`).toBe(0);
          }
        }
      });

      it('scores an absent value as zero', () => {
        const { fields } = scoreOne(ageBand, paramDef.obsKey, null);
        expect(fields[paramDef.field]).toBe(0);
      });
    });

    it('scores every respiratory-distress category as the spec defines', () => {
      for (const [category, expected] of Object.entries(spec.categorical.respiratoryDistress)) {
        const { fields } = scoreObservation(ageBand, {
          ...blankObservation(),
          respiratoryDistress: category,
        });
        expect(fields.respiratoryDistress, `respiratoryDistress=${category}`).toBe(expected);
      }
    });

    it('scores capillary refill at and above the spec threshold', () => {
      const { thresholdSeconds, score } = spec.categorical.capillaryRefill;
      const at = scoreObservation(ageBand, { ...blankObservation(), capillaryRefill: thresholdSeconds });
      const above = scoreObservation(ageBand, { ...blankObservation(), capillaryRefill: thresholdSeconds + 1 });
      const below = scoreObservation(ageBand, { ...blankObservation(), capillaryRefill: 2 });
      expect(at.fields.capillaryRefill).toBe(score);
      expect(above.fields.capillaryRefill).toBe(score);
      expect(below.fields.capillaryRefill).toBe(0);
    });

    // CHARACTERISATION, NOT ENDORSEMENT (bug log B-04).
    // The canonical spec notes that 2.01-2.99s has no defined score. `scoreCrt`
    // resolves that hole downwards to 0. Pinned so the choice is explicit rather
    // than incidental.
    it('scores the specification-undefined capillary refill range as 0', () => {
      const { thresholdSeconds } = spec.categorical.capillaryRefill;
      for (const value of [2.01, 2.5, 2.99]) {
        expect(value).toBeLessThan(thresholdSeconds);
        const { fields } = scoreObservation(ageBand, { ...blankObservation(), capillaryRefill: value });
        expect(fields.capillaryRefill, `capillaryRefill=${value}s is undefined in the spec`).toBe(0);
      }
    });

    it('applies the high-flow device override regardless of delivery level', () => {
      const { highFlowDevices, highFlowScore } = spec.categorical.oxygen;
      for (const device of highFlowDevices) {
        for (const delivery of [null, { value: 0, unit: '%' }, { value: 100, unit: '%' }]) {
          const { fields } = scoreObservation(ageBand, {
            ...blankObservation(),
            oxygenDevice: device,
            oxygenDelivery: delivery,
          });
          expect(fields.oxygen, `${device} with delivery ${JSON.stringify(delivery)}`).toBe(highFlowScore);
        }
      }
    });

    it('scores level devices from the shared delivery bands in both units', () => {
      const { levelDevices } = spec.categorical.oxygen;
      const unitBands = [
        { unit: '%', triples: spec.shared.oxygenDeliveryPercent },
        { unit: 'L/min', triples: spec.shared.oxygenDeliveryLpm },
      ];
      for (const device of levelDevices) {
        for (const { unit, triples } of unitBands) {
          for (const [min, max, expected] of triples) {
            for (const value of [min, max]) {
              const { fields } = scoreObservation(ageBand, {
                ...blankObservation(),
                oxygenDevice: device,
                oxygenDelivery: { value, unit },
              });
              expect(fields.oxygen, `${device} ${value}${unit}`).toBe(expected);
            }
          }
        }
      }
    });

    it('scores breathing air as zero oxygen support', () => {
      for (const device of [null, 'air']) {
        const { fields } = scoreObservation(ageBand, { ...blankObservation(), oxygenDevice: device });
        expect(fields.oxygen).toBe(0);
      }
    });

    // CHARACTERISATION, NOT ENDORSEMENT (bug log B-05).
    // `scoreOxygen` requires `LEVEL_DEVICES.has(device) && delivery`. A patient
    // demonstrably on a level device whose flow was not recorded therefore
    // scores identically to a patient breathing air.
    it('scores a level device with no recorded delivery as 0', () => {
      const { levelDevices } = spec.categorical.oxygen;
      for (const device of levelDevices) {
        const { fields } = scoreObservation(ageBand, {
          ...blankObservation(),
          oxygenDevice: device,
          oxygenDelivery: null,
        });
        expect(fields.oxygen, `${device} with no recorded delivery`).toBe(0);
      }
    });

    // CHARACTERISATION, NOT ENDORSEMENT (bug log B-06).
    // An unrecognised device code returns 0 silently. This is inconsistent with
    // `deriveNonScoreEscalation`, which throws on an unknown avpu or sepsis value.
    it('scores an unrecognised oxygen device as 0 without raising', () => {
      const { highFlowDevices, levelDevices } = spec.categorical.oxygen;
      const known = new Set([...highFlowDevices, ...levelDevices, 'air']);
      expect(known.has('NOT_A_DEVICE')).toBe(false);
      const { fields } = scoreObservation(ageBand, {
        ...blankObservation(),
        oxygenDevice: 'NOT_A_DEVICE',
        oxygenDelivery: { value: 10, unit: 'L/min' },
      });
      expect(fields.oxygen).toBe(0);
    });

    it('totals the breakdown fields exactly', () => {
      const worstOf = (paramDef) => {
        const triples = triplesFor(paramDef, ageBand);
        const worst = triples.reduce((a, b) => (b[2] > a[2] ? b : a));
        return worst;
      };
      const obs = { ...blankObservation(), respiratoryDistress: 'severe', capillaryRefill: 5 };
      for (const paramDef of NUMERIC_PARAMS) {
        obs[paramDef.obsKey] = worstOf(paramDef)[0];
      }
      const { total, fields } = scoreObservation(ageBand, obs);
      const sum = Object.values(fields).reduce((a, b) => a + b, 0);
      expect(total).toBe(sum);
      expect(total).toBeGreaterThan(0);
    });

    it('excludes temperature and AVPU from the numeric total', () => {
      const { total } = scoreObservation(ageBand, {
        ...blankObservation(),
        temperature: 41,
        avpu: 'U',
      });
      expect(total).toBe(0);
    });
  });

  describe('escalation thresholds derived from the spec', () => {
    it('maps every declared level band to its canonical level', () => {
      for (const level of spec.escalation.levels) {
        const expected = level.level;
        expect(escalationLevelFromScore(level.min), `PEWS ${level.min}`).toBe(expected);
        if (level.max !== null) {
          expect(escalationLevelFromScore(level.max), `PEWS ${level.max}`).toBe(expected);
        }
      }
    });

    it('returns no escalation below the lowest declared threshold', () => {
      const lowest = spec.escalation.levels.reduce((a, b) => (b.min < a.min ? b : a));
      expect(escalationLevelFromScore(lowest.min - 1)).toBeNull();
    });
  });
});
