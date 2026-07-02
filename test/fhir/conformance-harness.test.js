/**
 * FHIR PEWS structural conformance harness
 *
 * Gate: structural
 * Status: all tests in this file run immediately against fixture JSON.
 * No adapter dependency.
 */

import { describe, it, expect } from 'vitest';
import stableNormal from './fixtures/stable-normal-5-12y.json';
import skipReasons from './fixtures/skip-reasons-0-11m.json';
import oxygenModality from './fixtures/oxygen-modality-transition.json';
import missingPatient from './fixtures/missing-patient.json';
import badScore from './fixtures/bad-score.json';

const PEWS_SYSTEM = 'https://rcpch.github.io/fhir/CodeSystem/pews';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resources(bundle) {
  return bundle.entry.map((e) => e.resource);
}

function ofType(bundle, type) {
  return resources(bundle).filter((r) => r.resourceType === type);
}

function observations(bundle) {
  return ofType(bundle, 'Observation');
}

function scoreObservation(bundle) {
  return observations(bundle).find(
    (o) => o.code?.coding?.[0]?.code === 'pews-total',
  );
}

// ---------------------------------------------------------------------------
// Positive fixtures
// ---------------------------------------------------------------------------

const positiveFixtures = [
  { bundle: stableNormal, label: 'stable-normal-5-12y' },
  { bundle: skipReasons, label: 'skip-reasons-0-11m' },
  { bundle: oxygenModality, label: 'oxygen-modality-transition' },
];

describe('structural conformance: positive fixtures', () => {
  for (const { bundle, label } of positiveFixtures) {
    describe(label, () => {
      it('resourceType is Bundle', () => {
        expect(bundle.resourceType).toBe('Bundle');
      });

      it('has entry array', () => {
        expect(Array.isArray(bundle.entry)).toBe(true);
      });

      it('entry is non-empty', () => {
        expect(bundle.entry.length).toBeGreaterThan(0);
      });

      it('every entry has resource.resourceType', () => {
        for (const entry of bundle.entry) {
          expect(typeof entry.resource?.resourceType).toBe('string');
        }
      });

      it('has exactly one Patient', () => {
        expect(ofType(bundle, 'Patient')).toHaveLength(1);
      });

      it('has at least one Observation', () => {
        expect(observations(bundle).length).toBeGreaterThan(0);
      });

      it('all Observations have effectiveDateTime', () => {
        for (const obs of observations(bundle)) {
          expect(typeof obs.effectiveDateTime).toBe('string');
          expect(obs.effectiveDateTime).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        }
      });

      it('all Observations have a code with at least one coding', () => {
        for (const obs of observations(bundle)) {
          expect(Array.isArray(obs.code?.coding)).toBe(true);
          expect(obs.code.coding.length).toBeGreaterThan(0);
        }
      });

      it('has a pews-total score Observation', () => {
        expect(scoreObservation(bundle)).toBeTruthy();
      });

      it('pews-total Observation has an integer value', () => {
        const score = scoreObservation(bundle);
        // oxygen-modality-transition has two rounds, accept either
        const allScores = observations(bundle).filter(
          (o) => o.code?.coding?.[0]?.code === 'pews-total',
        );
        for (const s of allScores) {
          expect(typeof s.valueInteger).toBe('number');
          expect(Number.isInteger(s.valueInteger)).toBe(true);
        }
      });
    });
  }
});

// ---------------------------------------------------------------------------
// Skipped / absent observation structural rules
// ---------------------------------------------------------------------------

describe('skip-reasons-0-11m: absent observation shape', () => {
  it('skipped RR has dataAbsentReason', () => {
    const rr = observations(skipReasons).find(
      (o) => o.code?.coding?.[0]?.code === '9279-1',
    );
    expect(rr).toBeTruthy();
    expect(rr.dataAbsentReason).toBeTruthy();
    expect(rr.valueQuantity).toBeUndefined();
  });

  it('skipped RR has pews-skip-reason extension', () => {
    const rr = observations(skipReasons).find(
      (o) => o.code?.coding?.[0]?.code === '9279-1',
    );
    const ext = rr.extension?.find(
      (e) => e.url === 'https://rcpch.github.io/fhir/StructureDefinition/pews-skip-reason',
    );
    expect(ext).toBeTruthy();
    expect(ext.valueCode).toBe('procedure');
  });

  it('skipped BP has dataAbsentReason with unable-to-perform', () => {
    const bp = observations(skipReasons).find(
      (o) => o.code?.coding?.[0]?.code === '55284-4',
    );
    expect(bp?.dataAbsentReason?.coding?.[0]?.code).toBe('unable-to-perform');
  });
});

// ---------------------------------------------------------------------------
// Oxygen modality transition
// ---------------------------------------------------------------------------

describe('oxygen-modality-transition: two rounds with different units', () => {
  it('round 1 O2 delivery is in %', () => {
    const d = observations(oxygenModality).find(
      (o) =>
        o.code?.coding?.[0]?.code === 'pews-o2-delivery' &&
        o.effectiveDateTime === '2026-01-01T10:00:00',
    );
    expect(d?.valueQuantity?.unit).toBe('%');
  });

  it('round 2 O2 delivery is in L/min', () => {
    const d = observations(oxygenModality).find(
      (o) =>
        o.code?.coding?.[0]?.code === 'pews-o2-delivery' &&
        o.effectiveDateTime === '2026-01-01T10:30:00',
    );
    expect(d?.valueQuantity?.unit).toBe('L/min');
  });

  it('round 1 score is 2', () => {
    const s = observations(oxygenModality).find(
      (o) =>
        o.code?.coding?.[0]?.code === 'pews-total' &&
        o.effectiveDateTime === '2026-01-01T10:00:00',
    );
    expect(s?.valueInteger).toBe(2);
  });

  it('round 2 score is 5', () => {
    const s = observations(oxygenModality).find(
      (o) =>
        o.code?.coding?.[0]?.code === 'pews-total' &&
        o.effectiveDateTime === '2026-01-01T10:30:00',
    );
    expect(s?.valueInteger).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Negative fixtures: expected structural failures
// ---------------------------------------------------------------------------

describe('negative fixtures: expected problems', () => {
  it('missing-patient bundle has no Patient resource', () => {
    expect(ofType(missingPatient, 'Patient')).toHaveLength(0);
  });

  it('bad-score bundle has a Patient resource', () => {
    expect(ofType(badScore, 'Patient').length).toBeGreaterThan(0);
  });

  it('bad-score has a pews-total of 5 (deliberately wrong)', () => {
    const score = scoreObservation(badScore);
    expect(score?.valueInteger).toBe(5);
  });
});
