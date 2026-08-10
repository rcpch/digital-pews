import { describe, expect, it } from 'vitest';
import { scoreObservationsForPatient } from '../../chart/npews-scorer.js';
import { ESCALATION_META } from '../../chart/npews-scoring-config.js';
import { escalationStatusLabel } from '../../chart/escalation-presentation.js';

const patient = { dob: '2018-01-01' };

function score(overrides = {}) {
  return scoreObservationsForPatient(patient, [{
    id: 'round-1',
    timestamp: '2026-01-01T12:00:00Z',
    respiratoryRate: 20,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 90,
    bloodPressureSystolic: 100,
    bloodPressureDiastolic: 60,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37,
    ...overrides,
  }])[0];
}

describe('R10 automatic Specific Concern escalation', () => {
  it.each([
    ['V', 'high', 'avpu-v'],
    ['P', 'emergency', 'avpu-p'],
    ['U', 'emergency', 'avpu-u'],
  ])('maps current AVPU %s to %s', (avpu, level, criterion) => {
    const result = score({ avpu });
    expect(result.pewsTotal).toBe(0);
    expect(result.escalationLevel).toBe(level);
    expect(result.escalationReasons).toContainEqual({ code: 'SC', level, criterion, origin: 'derived' });
  });

  it.each(['A', 'asleep'])('does not escalate AVPU %s', (avpu) => {
    expect(score({ avpu }).escalationLevel).toBeNull();
  });

  it('applies the documented current-value interpretation to repeated AVPU V observations', () => {
    const results = scoreObservationsForPatient(patient, [
      { timestamp: '2026-01-01T12:00:00Z', avpu: 'V' },
      { timestamp: '2026-01-01T13:00:00Z', avpu: 'V' },
    ]);
    expect(results.map(result => result.escalationLevel)).toEqual(['high', 'high']);
  });

  it('maps abnormal pupillary response to Emergency', () => {
    expect(score({ abnormalPupillaryResponse: true }).escalationReasons).toContainEqual({
      code: 'SC',
      level: 'emergency',
      criterion: 'abnormal-pupillary-response',
      origin: 'derived',
    });
  });

  it.each([
    ['sepsis', 'medium', 'new-suspicion-of-sepsis'],
    ['septic-shock', 'high', 'new-suspicion-of-septic-shock'],
  ])('maps new %s suspicion to %s', (newSepsisSuspicion, level, criterion) => {
    expect(score({ newSepsisSuspicion }).escalationReasons).toContainEqual({
      code: 'SC',
      level,
      criterion,
      origin: 'derived',
    });
  });

  it('retains every reason while selecting the highest level', () => {
    const result = score({
      avpu: 'V',
      abnormalPupillaryResponse: true,
      clinicalIntuition: 'yes',
      escalationTriggers: [{ code: 'CI', level: 'medium' }],
    });
    expect(result.escalationLevel).toBe('emergency');
    expect(result.escalationReasons).toHaveLength(3);
    expect(result.escalationDecisions).toHaveLength(3);
  });
});

describe('R10 temperature sepsis warnings', () => {
  it.each([
    [38, 'temperature-at-or-above-38'],
    [35.9, 'temperature-below-36'],
  ])('warns for temperature %s without assigning escalation', (temperature, criterion) => {
    const result = score({ temperature });
    expect(result.pewsTotal).toBe(0);
    expect(result.escalationLevel).toBeNull();
    expect(result.clinicalWarnings).toEqual([
      expect.objectContaining({ code: 'THINK_SEPSIS', criterion }),
    ]);
  });

  it.each([36, 37.9])('does not warn for temperature %s', (temperature) => {
    expect(score({ temperature }).clinicalWarnings).toEqual([]);
  });
});

describe('R10 host-selected concern semantics', () => {
  it('retains an explicit None decision without making it an escalation reason', () => {
    const result = score({
      clinicalIntuition: 'yes',
      escalationTriggers: [{ code: 'CI', level: 'none' }],
    });
    expect(result.escalationLevel).toBeNull();
    expect(result.escalationReasons).toEqual([]);
    expect(result.escalationDecisions).toEqual([
      { code: 'CI', level: 'none', criterion: 'clinical-intuition', origin: 'host-selected' },
    ]);
    expect(result.pendingEscalationResponses).toEqual([]);
  });

  it.each([
    [{ clinicalIntuition: 'yes' }, { code: 'CI', response: 'yes' }],
    [{ carerQuestion: 'W' }, { code: 'CQ', response: 'W' }],
  ])('does not infer a level from a raw concern response', (input, pending) => {
    const result = score(input);
    expect(result.escalationLevel).toBeNull();
    expect(result.pendingEscalationResponses).toEqual([pending]);
  });

  it('rejects a trigger decision that contradicts its raw response', () => {
    expect(() => score({
      clinicalIntuition: 'no',
      escalationTriggers: [{ code: 'CI', level: 'high' }],
    })).toThrow(/requires clinicalIntuition "yes"/);
  });

  it('rejects duplicate host decisions and unsupported values', () => {
    expect(() => score({
      escalationTriggers: [{ code: 'CI', level: 'low' }, { code: 'CI', level: 'high' }],
    })).toThrow(/at most one CI decision/);
    expect(() => score({ newSepsisSuspicion: 'possible' })).toThrow(/newSepsisSuspicion/);
    expect(() => score({ abnormalPupillaryResponse: 'yes' })).toThrow(/boolean or null/);
    expect(() => score({ avpu: 'v' })).toThrow(/unknown avpu value/);
    expect(() => score({ temperature: '38' })).toThrow(/finite number or null/);
    expect(() => score({ temperature: Number.NaN })).toThrow(/finite number or null/);
    expect(() => score({ escalationTriggers: false })).toThrow(/must be an array/);
    expect(() => score({
      escalationTriggers: [{ code: 'SC', level: 'none' }, { code: 'SC', level: 'high' }],
    })).toThrow(/at most one SC decision/);
  });

  it('applies non-score escalation even when no age band can be resolved', () => {
    const [result] = scoreObservationsForPatient({}, [{
      timestamp: '2026-01-01T12:00:00Z',
      avpu: 'P',
    }]);
    expect(result.pewsTotal).toBeNull();
    expect(result.escalationLevel).toBe('emergency');
  });
});

describe('R10 prominent status precedence', () => {
  it.each([
    [{ escalationLevel: 'emergency', pendingEscalationResponses: [{ code: 'CI' }] }, 'Emergency'],
    [{ escalationLevel: null, pendingEscalationResponses: [{ code: 'CI' }] }, 'Level required'],
    [{ escalationLevel: null, clinicalWarnings: [{ code: 'THINK_SEPSIS' }] }, 'Think sepsis'],
    [{ escalationLevel: null }, 'Normal'],
  ])('applies status precedence', (observation, expected) => {
    expect(escalationStatusLabel(observation, ESCALATION_META)).toBe(expected);
  });
});
