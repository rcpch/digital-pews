/**
 * NPEWS scorer unit tests + FHIR bundle score conformance tests
 *
 * Two sections:
 *
 * 1. Scorer unit tests — run immediately, no adapter needed.
 *    These test scoreObservation() against known inputs.
 *    They use the values in npews-scoring-config.js (the current chart config).
 *
 * 2. Bundle score conformance tests — .todo until adapter is implemented.
 *    These will recompute scores from FHIR fixtures and compare to stored totals.
 *
 * Conformance: the scorer implements the national SPOT NPEWS numeric algorithm.
 * Temperature and AVPU are NOT numerically scored (escalation triggers only),
 * so they never contribute to the recomputed total below.
 */

import { describe, it, expect } from 'vitest';
import { scoreObservation, escalationLevelFromScore, scoreObservationsForPatient } from '../../pews-chart/npews-scorer.js';
import { fromFhirBundleToChartModel } from '../../pews-chart/fhir-adapter.js';
import stableNormal from './fixtures/stable-normal-5-12y.json';
import skipReasons from './fixtures/skip-reasons-0-11m.json';
import oxygenModality from './fixtures/oxygen-modality-transition.json';
import badScore from './fixtures/bad-score.json';

// ---------------------------------------------------------------------------
// Helper: build a minimal observation for scorer input
// ---------------------------------------------------------------------------

function obs(overrides = {}) {
  return {
    respiratoryRate: null,
    respiratoryDistress: null,
    oxygenSaturation: null,
    oxygenDevice: null,
    oxygenDelivery: null,
    heartRate: null,
    bloodPressureSystolic: null,
    bloodPressureDiastolic: null,
    capillaryRefill: null,
    avpu: null,
    temperature: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// 1a. Scorer: 5-12y band (most complete spec alignment)
// ---------------------------------------------------------------------------

describe('scoreObservation: 5-12y', () => {
  it('all nulls scores 0', () => {
    expect(scoreObservation('5-12y', obs()).total).toBe(0);
  });

  it('normal vitals all score 0', () => {
    const { total } = scoreObservation('5-12y', obs({
      respiratoryRate: 22,
      respiratoryDistress: 'none',
      oxygenSaturation: 98,
      oxygenDevice: 'air',
      heartRate: 95,
      bloodPressureSystolic: 100,
      capillaryRefill: 2,
      avpu: 'A',
      temperature: 36.9,
    }));
    expect(total).toBe(0);
  });

  describe('respiratory rate (5-12y)', () => {
    it('RR 22 → 0', () => expect(scoreObservation('5-12y', obs({ respiratoryRate: 22 })).fields.respiratoryRate).toBe(0));
    it('RR 17 → 1', () => expect(scoreObservation('5-12y', obs({ respiratoryRate: 17 })).fields.respiratoryRate).toBe(1));
    it('RR 12 → 2', () => expect(scoreObservation('5-12y', obs({ respiratoryRate: 12 })).fields.respiratoryRate).toBe(2));
    it('RR 5  → 4', () => expect(scoreObservation('5-12y', obs({ respiratoryRate: 5 })).fields.respiratoryRate).toBe(4));
    it('RR 30 → 1', () => expect(scoreObservation('5-12y', obs({ respiratoryRate: 30 })).fields.respiratoryRate).toBe(1));
    it('RR 45 → 2', () => expect(scoreObservation('5-12y', obs({ respiratoryRate: 45 })).fields.respiratoryRate).toBe(2));
    it('RR 55 → 4', () => expect(scoreObservation('5-12y', obs({ respiratoryRate: 55 })).fields.respiratoryRate).toBe(4));
  });

  describe('heart rate (5-12y)', () => {
    it('HR 95  → 0', () => expect(scoreObservation('5-12y', obs({ heartRate: 95 })).fields.heartRate).toBe(0));
    it('HR 125 → 1', () => expect(scoreObservation('5-12y', obs({ heartRate: 125 })).fields.heartRate).toBe(1));
    it('HR 145 → 2', () => expect(scoreObservation('5-12y', obs({ heartRate: 145 })).fields.heartRate).toBe(2));
    it('HR 170 → 4', () => expect(scoreObservation('5-12y', obs({ heartRate: 170 })).fields.heartRate).toBe(4));
    it('HR 65  → 2', () => expect(scoreObservation('5-12y', obs({ heartRate: 65 })).fields.heartRate).toBe(2));
    it('HR 30  → 4', () => expect(scoreObservation('5-12y', obs({ heartRate: 30 })).fields.heartRate).toBe(4));
  });

  describe('oxygen saturation (5-12y)', () => {
    it('SpO2 98 → 0', () => expect(scoreObservation('5-12y', obs({ oxygenSaturation: 98 })).fields.oxygenSaturation).toBe(0));
    it('SpO2 93 → 1', () => expect(scoreObservation('5-12y', obs({ oxygenSaturation: 93 })).fields.oxygenSaturation).toBe(1));
    it('SpO2 88 → 4', () => expect(scoreObservation('5-12y', obs({ oxygenSaturation: 88 })).fields.oxygenSaturation).toBe(4));
  });

  describe('oxygen device and delivery (5-12y)', () => {
    it('HF device → 4 regardless of delivery', () => {
      expect(scoreObservation('5-12y', obs({ oxygenDevice: 'HF' })).fields.oxygen).toBe(4);
    });
    it('BiP device → 4', () => {
      expect(scoreObservation('5-12y', obs({ oxygenDevice: 'BiP' })).fields.oxygen).toBe(4);
    });
    it('NP + 24% → 1', () => {
      expect(scoreObservation('5-12y', obs({
        oxygenDevice: 'NP',
        oxygenDelivery: { value: 24, unit: '%' },
      })).fields.oxygen).toBe(1);
    });
    it('FM + 6 L/min → 4', () => {
      expect(scoreObservation('5-12y', obs({
        oxygenDevice: 'FM',
        oxygenDelivery: { value: 6, unit: 'L/min' },
      })).fields.oxygen).toBe(4);
    });
    it('FM + 2 L/min → 2', () => {
      expect(scoreObservation('5-12y', obs({
        oxygenDevice: 'FM',
        oxygenDelivery: { value: 2, unit: 'L/min' },
      })).fields.oxygen).toBe(2);
    });
    it('air device → 0', () => {
      expect(scoreObservation('5-12y', obs({ oxygenDevice: 'air' })).fields.oxygen).toBe(0);
    });
  });

  describe('AVPU is NOT numerically scored (conformant — escalation trigger only)', () => {
    it('A contributes 0 to total', () => expect(scoreObservation('5-12y', obs({ avpu: 'A' })).total).toBe(0));
    it('V contributes 0 to total', () => expect(scoreObservation('5-12y', obs({ avpu: 'V' })).total).toBe(0));
    it('P contributes 0 to total', () => expect(scoreObservation('5-12y', obs({ avpu: 'P' })).total).toBe(0));
    it('U contributes 0 to total', () => expect(scoreObservation('5-12y', obs({ avpu: 'U' })).total).toBe(0));
    it('is absent from the score breakdown', () => expect(scoreObservation('5-12y', obs({ avpu: 'U' })).fields).not.toHaveProperty('avpu'));
  });

  describe('capillary refill (all bands same)', () => {
    it('CRT 2 → 0', () => expect(scoreObservation('5-12y', obs({ capillaryRefill: 2 })).fields.capillaryRefill).toBe(0));
    it('CRT 3 → 2', () => expect(scoreObservation('5-12y', obs({ capillaryRefill: 3 })).fields.capillaryRefill).toBe(2));
  });

  describe('temperature is NOT numerically scored (conformant — sepsis/escalation trigger only)', () => {
    it('36.9 contributes 0 to total', () => expect(scoreObservation('5-12y', obs({ temperature: 36.9 })).total).toBe(0));
    it('38.2 contributes 0 to total', () => expect(scoreObservation('5-12y', obs({ temperature: 38.2 })).total).toBe(0));
    it('40.1 contributes 0 to total', () => expect(scoreObservation('5-12y', obs({ temperature: 40.1 })).total).toBe(0));
    it('is absent from the score breakdown', () => expect(scoreObservation('5-12y', obs({ temperature: 40.1 })).fields).not.toHaveProperty('temperature'));
  });

  describe('respiratory distress (all bands same)', () => {
    it('none → 0', () => expect(scoreObservation('5-12y', obs({ respiratoryDistress: 'none' })).fields.respiratoryDistress).toBe(0));
    it('mild → 1', () => expect(scoreObservation('5-12y', obs({ respiratoryDistress: 'mild' })).fields.respiratoryDistress).toBe(1));
    it('moderate → 2', () => expect(scoreObservation('5-12y', obs({ respiratoryDistress: 'moderate' })).fields.respiratoryDistress).toBe(2));
    it('severe → 4', () => expect(scoreObservation('5-12y', obs({ respiratoryDistress: 'severe' })).fields.respiratoryDistress).toBe(4));
  });

  it('stable-normal-5-12y fixture values score 0 total', () => {
    const { total } = scoreObservation('5-12y', obs({
      respiratoryRate: 22,
      respiratoryDistress: 'none',
      oxygenSaturation: 98,
      oxygenDevice: 'air',
      heartRate: 95,
      bloodPressureSystolic: 100,
      capillaryRefill: 2,
      avpu: 'A',
      temperature: 36.9,
    }));
    expect(total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 1b. Scorer: 0-11m band — now aligned to spec/npews-scoring.md
// ---------------------------------------------------------------------------

describe('scoreObservation: 0-11m', () => {
  // skip-reasons fixture: SpO2=94 (1) only. Temp=38.2 and AVPU=A are NOT scored
  // (conformant). HR 130 = 0 (white 110-149.99).
  it('skip-reasons-0-11m fixture values (non-null) score 1 total', () => {
    const { total } = scoreObservation('0-11m', obs({
      respiratoryRate: null,          // skipped
      respiratoryDistress: null,      // skipped
      oxygenSaturation: 94,           // 1
      oxygenDevice: 'NP',
      oxygenDelivery: null,           // NP but no delivery = 0
      heartRate: 130,                 // white (110-149.99) = 0
      bloodPressureSystolic: null,    // skipped
      capillaryRefill: 2,             // 0
      avpu: 'A',                      // not scored (escalation trigger only)
      temperature: 38.2,              // not scored (sepsis/escalation trigger only)
    }));
    expect(total).toBe(1);
  });

  // Spec: 0-11m RR 20-29.99 = Yellow (1)
  it('0-11m RR=22 → 1 (Yellow)', () => {
    expect(scoreObservation('0-11m', obs({ respiratoryRate: 22 })).fields.respiratoryRate).toBe(1);
  });

  // Spec: 0-11m RR 70+ = Pink (4)
  it('0-11m RR=72 → 4 (Pink)', () => {
    expect(scoreObservation('0-11m', obs({ respiratoryRate: 72 })).fields.respiratoryRate).toBe(4);
  });

  // Spec: 0-11m HR 80-89.99 = Orange (2)
  it('0-11m HR=85 → 2 (Orange)', () => {
    expect(scoreObservation('0-11m', obs({ heartRate: 85 })).fields.heartRate).toBe(2);
  });

  // Spec: 0-11m HR 150-169.99 = Yellow (1)
  it('0-11m HR=155 → 1 (Yellow)', () => {
    expect(scoreObservation('0-11m', obs({ heartRate: 155 })).fields.heartRate).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// 1c. Escalation level mapping
// ---------------------------------------------------------------------------

describe('escalationLevelFromScore', () => {
  it('0 → null', () => expect(escalationLevelFromScore(0)).toBeNull());
  it('1 → low', () => expect(escalationLevelFromScore(1)).toBe('low'));
  it('4 → low', () => expect(escalationLevelFromScore(4)).toBe('low'));
  it('5 → medium', () => expect(escalationLevelFromScore(5)).toBe('medium'));
  it('8 → medium', () => expect(escalationLevelFromScore(8)).toBe('medium'));
  it('9 → high', () => expect(escalationLevelFromScore(9)).toBe('high'));
  it('12 → high', () => expect(escalationLevelFromScore(12)).toBe('high'));
  it('13 → emergency', () => expect(escalationLevelFromScore(13)).toBe('emergency'));
  it('20 → emergency', () => expect(escalationLevelFromScore(20)).toBe('emergency'));
});

// ---------------------------------------------------------------------------
// 1d. Unknown age band
// ---------------------------------------------------------------------------

describe('scoreObservation: invalid ageBand', () => {
  it('throws for unknown ageBand', () => {
    expect(() => scoreObservation('99-999y', obs())).toThrow(/unknown ageBand/i);
  });
});

// ---------------------------------------------------------------------------
// 1e. Per-patient scoring + seamless age-band boundary crossing
// ---------------------------------------------------------------------------

describe('scoreObservationsForPatient: age band resolved per observation from DOB', () => {
  // Child turns 5 on 2024-03-14. HR 85 scores 1 in 1-4y (70-89.99) but 0 in
  // 5-12y (80-119.99) — so the same vital scores differently either side of the
  // birthday, proving the band switches at the boundary.
  const patient = { dob: '2019-03-14' };
  const observations = [
    { id: 'before', timestamp: '2024-03-13T23:00:00', heartRate: 85, pewsTotal: 99, escalationLevel: 'emergency' },
    { id: 'after',  timestamp: '2024-03-14T01:00:00', heartRate: 85 },
  ];
  const scored = scoreObservationsForPatient(patient, observations);

  it('scores the pre-birthday observation against 1-4y', () => {
    expect(scored[0].ageBand).toBe('1-4y');
    expect(scored[0].pewsTotal).toBe(1);
  });

  it('scores the post-birthday observation against 5-12y', () => {
    expect(scored[1].ageBand).toBe('5-12y');
    expect(scored[1].pewsTotal).toBe(0);
  });

  it('overrides any stored pewsTotal / escalationLevel (algorithm is source of truth)', () => {
    expect(scored[0].pewsTotal).not.toBe(99);
    expect(scored[0].escalationLevel).toBe('low'); // total 1
  });

  it('preserves the original vital fields', () => {
    expect(scored[0].heartRate).toBe(85);
    expect(scored[1].id).toBe('after');
  });

  it('returns null scores when no age band can be resolved', () => {
    const [obsNoBand] = scoreObservationsForPatient({}, [{ timestamp: '2024-01-01T00:00:00', heartRate: 85 }]);
    expect(obsNoBand.ageBand).toBeNull();
    expect(obsNoBand.pewsTotal).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. Bundle score conformance (requires adapter — all .todo)
// ---------------------------------------------------------------------------

describe('bundle score conformance: stored vs recomputed', () => {
  it('stable-normal-5-12y: recomputed total matches stored 0', () => {
    const chartModel = fromFhirBundleToChartModel(stableNormal);
    const [observation] = chartModel.observations;
    expect(scoreObservation(chartModel.patient.ageBand, observation).total).toBe(observation.pewsTotal);
  });

  it('skip-reasons-0-11m: recomputed total matches stored 1', () => {
    const chartModel = fromFhirBundleToChartModel(skipReasons);
    const [observation] = chartModel.observations;
    expect(scoreObservation(chartModel.patient.ageBand, observation).total).toBe(observation.pewsTotal);
  });

  it('oxygen-modality-transition round 1: recomputed total matches stored 2', () => {
    const chartModel = fromFhirBundleToChartModel(oxygenModality);
    expect(scoreObservation(chartModel.patient.ageBand, chartModel.observations[0]).total).toBe(chartModel.observations[0].pewsTotal);
  });

  it('oxygen-modality-transition round 2: recomputed total matches stored 5', () => {
    const chartModel = fromFhirBundleToChartModel(oxygenModality);
    expect(scoreObservation(chartModel.patient.ageBand, chartModel.observations[1]).total).toBe(chartModel.observations[1].pewsTotal);
  });

  it('bad-score fixture: recomputed total (0) does not match stored (5) — expected failure shape', () => {
    const chartModel = fromFhirBundleToChartModel(badScore);
    const [observation] = chartModel.observations;
    expect(scoreObservation(chartModel.patient.ageBand, observation).total).not.toBe(observation.pewsTotal);
    expect(observation.pewsTotal).toBe(5);
  });
});
