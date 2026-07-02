/**
 * Config-vs-spec drift guard
 *
 * Asserts that the numeric scoring bands in pews-chart/npews-scoring-config.js
 * are exactly what the canonical source of truth (spec/npews-scoring-spec.json)
 * generates. There is no second hand-maintained copy of the thresholds: the
 * expected values are built from the JSON via the same pure builder the code
 * generator uses (scripts/scoring-spec.mjs). Any divergence — a hand edit to the
 * generated block in config.js, or a forgotten `npm run generate:scoring` after
 * editing the JSON — fails this test.
 *
 * Temperature and AVPU are intentionally not present in the scoring bands
 * (national SPOT NPEWS conformance — they are escalation triggers, not scored).
 */

import { describe, it, expect } from 'vitest';
import { AGE_BANDS, AGE_BAND_BOUNDS } from '../../pews-chart/npews-scoring-config.js';
import { loadSpec, buildScoringBands, buildAgeBandBounds, PARAM_ORDER } from '../../scripts/scoring-spec.mjs';

const spec = loadSpec();

describe('npews-scoring-config.js matches the canonical scoring spec', () => {
  for (const ageBand of spec.ageBands) {
    describe(ageBand, () => {
      const expected = buildScoringBands(spec, ageBand);

      it('has exactly the expected scoring parameters (no temperature/AVPU)', () => {
        expect(Object.keys(AGE_BANDS[ageBand].scoringBands).sort()).toEqual([...PARAM_ORDER].sort());
      });

      for (const param of PARAM_ORDER) {
        it(`${param} bands match spec`, () => {
          expect(AGE_BANDS[ageBand].scoringBands[param]).toEqual(expected[param]);
        });
      }
    });
  }

  it('temperature is not a scored parameter in any age band', () => {
    for (const ageBand of spec.ageBands) {
      expect(AGE_BANDS[ageBand].scoringBands).not.toHaveProperty('temperature');
    }
  });
});

describe('AGE_BAND_BOUNDS matches the canonical spec', () => {
  const expected = buildAgeBandBounds(spec);

  it('config exposes bounds for exactly the spec age bands', () => {
    expect(Object.keys(AGE_BAND_BOUNDS).sort()).toEqual([...spec.ageBands].sort());
  });

  for (const ageBand of spec.ageBands) {
    it(`${ageBand} bounds match spec`, () => {
      expect(AGE_BAND_BOUNDS[ageBand]).toEqual(expected[ageBand]);
    });
  }

  it('forms a contiguous, gap-free, half-open partition of [0, ∞)', () => {
    let expectedMin = 0;
    for (const ageBand of spec.ageBands) {
      expect(AGE_BAND_BOUNDS[ageBand].minAgeYears).toBe(expectedMin);
      expectedMin = AGE_BAND_BOUNDS[ageBand].maxAgeYears;
    }
    expect(expectedMin).toBeNull();
  });
});
