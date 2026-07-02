/**
 * FHIR <-> ChartModel round-trip tests
 *
 * Gate: round-trip
 * Status: all tests are .todo until fhir-adapter.js is implemented.
 * See spec/fhir-chart-adapter.md §8-9 for implementation guide.
 */

import { describe, it, expect } from 'vitest';

import {
  fromFhirBundleToChartModel,
  fromChartModelToFhirBundle,
} from '../../pews-chart/fhir-adapter.js';
import stableNormal from './fixtures/stable-normal-5-12y.json';
import skipReasons from './fixtures/skip-reasons-0-11m.json';
import oxygenModality from './fixtures/oxygen-modality-transition.json';

function sampleChartModel() {
  return {
    patient: {
      name: 'Alex Thompson',
      dob: '2017-03-14',
      ageBand: '5-12y',
      nhsNumber: '943 476 5210',
      admittedAt: '2025-01-10T08:00:00',
    },
    observations: [
      {
        id: 'obs-1',
        timestamp: '2025-01-10T08:00:00',
        respiratoryRate: 22,
        respiratoryDistress: 'none',
        oxygenSaturation: 98,
        oxygenDevice: 'air',
        oxygenDelivery: null,
        heartRate: 95,
        bloodPressureSystolic: 100,
        bloodPressureDiastolic: 62,
        capillaryRefill: 2,
        avpu: 'A',
        temperature: 36.9,
        pewsTotal: 0,
        escalationLevel: null,
      },
      {
        id: 'obs-2',
        timestamp: '2025-01-10T10:00:00',
        respiratoryRate: null,
        respiratoryRate_skipReason: 'procedure',
        respiratoryDistress: null,
        respiratoryDistress_skipReason: 'procedure',
        oxygenSaturation: 94,
        oxygenDevice: 'NP',
        oxygenDelivery: { value: 24, unit: '%' },
        heartRate: 130,
        bloodPressureSystolic: null,
        bloodPressureSystolic_skipReason: 'unable',
        bloodPressureDiastolic: null,
        bloodPressureDiastolic_skipReason: 'unable',
        capillaryRefill: 2,
        avpu: 'A',
        temperature: 38.2,
        pewsTotal: 2,
        escalationLevel: 'low',
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// FHIR Bundle -> ChartModel
// ---------------------------------------------------------------------------

describe('fromFhirBundleToChartModel', () => {
  it('maps Patient.name to patient.name', () => {
    expect(fromFhirBundleToChartModel(stableNormal).patient.name).toBe('Alex Thompson');
  });

  it('maps Patient.birthDate to patient.dob', () => {
    expect(fromFhirBundleToChartModel(stableNormal).patient.dob).toBe('2017-03-14');
  });

  it('maps pews-age-band extension to patient.ageBand', () => {
    expect(fromFhirBundleToChartModel(stableNormal).patient.ageBand).toBe('5-12y');
  });

  it('produces one ChartObservation per observation timestamp', () => {
    expect(fromFhirBundleToChartModel(oxygenModality).observations).toHaveLength(2);
  });

  it('observations are sorted ascending by timestamp', () => {
    const timestamps = fromFhirBundleToChartModel(oxygenModality).observations.map((obs) => obs.timestamp);
    expect(timestamps).toEqual(['2026-01-01T10:00:00', '2026-01-01T10:30:00']);
  });

  it('maps core vital and coded fields', () => {
    const observation = fromFhirBundleToChartModel(stableNormal).observations[0];
    expect(observation.respiratoryRate).toBe(22);
    expect(observation.oxygenSaturation).toBe(98);
    expect(observation.heartRate).toBe(95);
    expect(observation.bloodPressureSystolic).toBe(100);
    expect(observation.bloodPressureDiastolic).toBe(62);
    expect(observation.temperature).toBe(36.9);
    expect(observation.capillaryRefill).toBe(2);
    expect(observation.avpu).toBe('A');
    expect(observation.respiratoryDistress).toBe('none');
    expect(observation.oxygenDevice).toBe('air');
    expect(observation.pewsTotal).toBe(0);
  });

  it('maps oxygen delivery quantity to value/unit object', () => {
    const firstObservation = fromFhirBundleToChartModel(oxygenModality).observations[0];
    expect(firstObservation.oxygenDelivery).toEqual({ value: 24, unit: '%' });
  });

  it('sets respiratoryRate to null when dataAbsentReason present', () => {
    const observation = fromFhirBundleToChartModel(skipReasons).observations[0];
    expect(observation.respiratoryRate).toBeNull();
  });

  it('sets respiratoryRate_skipReason from pews-skip-reason extension', () => {
    const observation = fromFhirBundleToChartModel(skipReasons).observations[0];
    expect(observation.respiratoryRate_skipReason).toBe('procedure');
  });

  it('throws when bundle has no Patient', () => {
    expect(() => fromFhirBundleToChartModel({ resourceType: 'Bundle', entry: [] })).toThrow(/No Patient/i);
  });

  it('throws when bundle has no Observations', () => {
    expect(() => fromFhirBundleToChartModel({
      resourceType: 'Bundle',
      entry: [{ resource: { resourceType: 'Patient', name: [{ text: 'Child' }] } }],
    })).toThrow(/No Observation resources/i);
  });
});

// ---------------------------------------------------------------------------
// ChartModel -> FHIR Bundle
// ---------------------------------------------------------------------------

describe('fromChartModelToFhirBundle', () => {
  it('emits a Bundle with core resources and expected references', () => {
    const bundle = fromChartModelToFhirBundle(sampleChartModel().patient, sampleChartModel().observations);
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.entry.some((entry) => entry.resource.resourceType === 'Patient')).toBe(true);
    expect(bundle.entry.some((entry) => entry.resource.resourceType === 'Encounter')).toBe(true);
    expect(bundle.entry.some((entry) => entry.resource.code?.coding?.[0]?.code === 'pews-total')).toBe(true);

    const bpObservation = bundle.entry.find((entry) => entry.resource.code?.coding?.[0]?.code === '55284-4')?.resource;
    expect(bpObservation.component).toHaveLength(2);

    const skippedRespRate = bundle.entry.find((entry) => entry.resource.id === 'obs-2-respiratoryRate')?.resource;
    expect(skippedRespRate.dataAbsentReason?.coding?.[0]?.code).toBe('not-performed');
    expect(skippedRespRate.extension?.[0]?.valueCode).toBe('procedure');

    const percentDelivery = bundle.entry.find((entry) => entry.resource.id === 'obs-2-oxygenDelivery')?.resource;
    expect(percentDelivery.valueQuantity.unit).toBe('%');

    const references = bundle.entry
      .map((entry) => entry.resource)
      .filter((resource) => resource.resourceType === 'Observation');
    expect(references.every((resource) => resource.subject.reference === 'Patient/patient-1')).toBe(true);
    expect(references.every((resource) => resource.encounter.reference === 'Encounter/encounter-1')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Round-trip: Chart -> FHIR -> Chart
// ---------------------------------------------------------------------------

describe('round-trip: chart model -> FHIR -> chart model', () => {
  it('preserves chart-critical fields', () => {
    const chartModel = sampleChartModel();
    const roundTripped = fromFhirBundleToChartModel(
      fromChartModelToFhirBundle(chartModel.patient, chartModel.observations),
    );

    expect(roundTripped.patient.name).toBe(chartModel.patient.name);
    expect(roundTripped.patient.dob).toBe(chartModel.patient.dob);
    expect(roundTripped.patient.ageBand).toBe(chartModel.patient.ageBand);
    expect(roundTripped.observations).toHaveLength(2);
    expect(roundTripped.observations[0].respiratoryRate).toBe(22);
    expect(roundTripped.observations[1].respiratoryRate).toBeNull();
    expect(roundTripped.observations[1].respiratoryRate_skipReason).toBe('procedure');
    expect(roundTripped.observations[1].oxygenDelivery).toEqual({ value: 24, unit: '%' });
    expect(roundTripped.observations[1].pewsTotal).toBe(2);
    expect(roundTripped.observations[1].escalationLevel).toBe('low');
  });
});

// ---------------------------------------------------------------------------
// Round-trip: FHIR -> Chart -> FHIR
// ---------------------------------------------------------------------------

describe('round-trip: FHIR bundle -> chart model -> FHIR bundle', () => {
  it.todo('result bundle contains a Patient resource');
  it.todo('result bundle contains an Encounter resource');
  it.todo('result bundle contains Observations for each vital');
  it.todo('pews-total score Observation is present');
  it.todo('oxygen modality unit transition is preserved across round-trip');
  it.todo('skip reason extension is preserved across round-trip');
});
