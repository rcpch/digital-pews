/**
 * FHIR <-> Chart Model adapter
 *
 * Exports two pure functions:
 *   fromFhirBundleToChartModel(bundle) -> ChartModel
 *   fromChartModelToFhirBundle(patient, observations, context?) -> Bundle
 *
 * Status: Phase 1 skeleton — functions are stubbed.
 * Implement per spec/fhir-chart-adapter.md.
 */

// ---------------------------------------------------------------------------
// Coding system constants
// ---------------------------------------------------------------------------

export const LOINC = 'http://loinc.org';
export const UCUM = 'http://unitsofmeasure.org';
export const PEWS_SYSTEM = 'https://rcpch.github.io/fhir/CodeSystem/pews';
export const PEWS_AGE_BAND_EXT = 'https://rcpch.github.io/fhir/StructureDefinition/pews-age-band';
export const PEWS_SKIP_REASON_EXT = 'https://rcpch.github.io/fhir/StructureDefinition/pews-skip-reason';
export const DATA_ABSENT_SYSTEM = 'http://terminology.hl7.org/CodeSystem/data-absent-reason';

// ---------------------------------------------------------------------------
// Observation code -> chart field mapping
// First coding entry's code is used for lookup.
// ---------------------------------------------------------------------------

export const OBS_CODE_TO_FIELD = {
  '9279-1': 'respiratoryRate',         // LOINC: Respiratory rate
  '59408-5': 'oxygenSaturation',       // LOINC: SpO2
  '8867-4': 'heartRate',               // LOINC: Heart rate
  '55284-4': 'bloodPressure',          // LOINC: BP panel (systolic + diastolic components)
  '8310-5': 'temperature',             // LOINC: Body temperature
  '44963-7': 'capillaryRefill',        // LOINC: Capillary refill time
  'pews-resp-distress': 'respiratoryDistress',
  'pews-o2-device': 'oxygenDevice',
  'pews-o2-delivery': 'oxygenDelivery',
  'pews-avpu': 'avpu',
  'pews-total': null,                  // score field — handled separately
};

const BP_SYSTOLIC_CODE = '8480-6';
const BP_DIASTOLIC_CODE = '8462-4';
const ESCALATION_LEVEL_EXT = 'https://rcpch.github.io/fhir/StructureDefinition/pews-escalation-level';

function assertBundleShape(bundle) {
  if (!bundle || typeof bundle !== 'object' || bundle.resourceType !== 'Bundle') {
    throw new Error('Expected a FHIR Bundle');
  }
  if (!Array.isArray(bundle.entry)) {
    throw new Error('Expected Bundle.entry to be an array');
  }
}

function resourcesOfType(bundle, resourceType) {
  return bundle.entry
    .map((entry) => entry?.resource)
    .filter((resource) => resource?.resourceType === resourceType);
}

function firstCodingCode(resource) {
  return resource?.code?.coding?.[0]?.code ?? null;
}

function valueCode(resource) {
  return resource?.valueCodeableConcept?.coding?.[0]?.code ?? null;
}

function parseSkipReason(resource) {
  return resource?.extension?.find((ext) => ext.url === PEWS_SKIP_REASON_EXT)?.valueCode;
}

function parseEscalationLevel(resource) {
  return resource?.extension?.find((ext) => ext.url === ESCALATION_LEVEL_EXT)?.valueCode ?? null;
}

function patientName(patient) {
  return patient?.name?.[0]?.text ?? patient?.name?.[0]?.given?.join(' ') ?? '';
}

function patientAgeBand(patient) {
  return patient?.extension?.find((ext) => ext.url === PEWS_AGE_BAND_EXT)?.valueCode;
}

function observationTemplate(timestamp) {
  return {
    id: `obs-${timestamp}`,
    timestamp,
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
    pewsTotal: 0,
    escalationLevel: null,
  };
}

function sortObservations(observations) {
  return observations.sort((left, right) => left.timestamp.localeCompare(right.timestamp));
}

function makeCoding(system, code, display) {
  return display ? [{ system, code, display }] : [{ system, code }];
}

function makeObservationBase(id, patientRef, encounterRef, timestamp, code) {
  return {
    resourceType: 'Observation',
    id,
    status: 'final',
    code,
    subject: { reference: patientRef },
    encounter: { reference: encounterRef },
    effectiveDateTime: timestamp,
  };
}

function addSkipReason(resource, skipReason) {
  if (!skipReason) return resource;
  return {
    ...resource,
    extension: [{ url: PEWS_SKIP_REASON_EXT, valueCode: skipReason }],
    dataAbsentReason: {
      coding: makeCoding(
        DATA_ABSENT_SYSTEM,
        skipReason === 'unable' ? 'unable-to-perform' : 'not-performed',
      ),
    },
  };
}

function numericValueObservation(id, patientRef, encounterRef, timestamp, code, value, unit, ucumCode) {
  return {
    ...makeObservationBase(id, patientRef, encounterRef, timestamp, code),
    valueQuantity: {
      value,
      unit,
      system: UCUM,
      code: ucumCode,
    },
  };
}

function codeableValueObservation(id, patientRef, encounterRef, timestamp, code, value) {
  return {
    ...makeObservationBase(id, patientRef, encounterRef, timestamp, code),
    valueCodeableConcept: {
      coding: makeCoding(PEWS_SYSTEM, value),
    },
  };
}

function buildPatientResource(patient, patientId) {
  const resource = {
    resourceType: 'Patient',
    id: patientId,
    name: [{ text: patient.name }],
  };

  if (patient.dob) {
    resource.birthDate = patient.dob;
  }
  if (patient.nhsNumber) {
    resource.identifier = [{ system: 'https://fhir.nhs.uk/Id/nhs-number', value: patient.nhsNumber }];
  }
  if (patient.ageBand) {
    resource.extension = [{ url: PEWS_AGE_BAND_EXT, valueCode: patient.ageBand }];
  }

  return resource;
}

function buildEncounterResource(patientId, encounterId, admittedAt) {
  const resource = {
    resourceType: 'Encounter',
    id: encounterId,
    status: 'in-progress',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'IMP',
    },
    subject: { reference: `Patient/${patientId}` },
  };

  if (admittedAt) {
    resource.period = { start: admittedAt };
  }

  return resource;
}

function buildBloodPressureObservation(id, patientRef, encounterRef, timestamp, observation) {
  const base = makeObservationBase(id, patientRef, encounterRef, timestamp, {
    coding: makeCoding(LOINC, '55284-4', 'Blood pressure systolic and diastolic'),
  });

  if (observation.bloodPressureSystolic == null && observation.bloodPressureDiastolic == null) {
    return addSkipReason(base, observation.bloodPressureSystolic_skipReason || observation.bloodPressureDiastolic_skipReason);
  }

  return {
    ...base,
    component: [
      {
        code: { coding: makeCoding(LOINC, BP_SYSTOLIC_CODE, 'Systolic blood pressure') },
        valueQuantity: {
          value: observation.bloodPressureSystolic,
          unit: 'mm[Hg]',
          system: UCUM,
          code: 'mm[Hg]',
        },
      },
      {
        code: { coding: makeCoding(LOINC, BP_DIASTOLIC_CODE, 'Diastolic blood pressure') },
        valueQuantity: {
          value: observation.bloodPressureDiastolic,
          unit: 'mm[Hg]',
          system: UCUM,
          code: 'mm[Hg]',
        },
      },
    ],
  };
}

function pushObservationResource(resources, resource) {
  resources.push({ resource });
}

// ---------------------------------------------------------------------------
// Inbound: FHIR Bundle -> ChartModel
// ---------------------------------------------------------------------------

/**
 * @param {unknown} bundle - FHIR R4 Bundle
 * @returns {{ patient: object, observations: object[] }}
 */
export function fromFhirBundleToChartModel(bundle) {
  assertBundleShape(bundle);

  const patients = resourcesOfType(bundle, 'Patient');
  const observations = resourcesOfType(bundle, 'Observation');

  if (patients.length === 0) {
    throw new Error('No Patient in bundle');
  }
  if (observations.length === 0) {
    throw new Error('No Observation resources in bundle');
  }

  const patient = patients[0];
  const grouped = new Map();

  for (const resource of observations) {
    const timestamp = resource.effectiveDateTime;
    if (typeof timestamp !== 'string' || Number.isNaN(Date.parse(timestamp))) {
      throw new Error('Unsupported or malformed timestamp');
    }

    if (!grouped.has(timestamp)) {
      grouped.set(timestamp, observationTemplate(timestamp));
    }

    const chartObservation = grouped.get(timestamp);
    const code = firstCodingCode(resource);
    const field = OBS_CODE_TO_FIELD[code];
    const skipReason = parseSkipReason(resource);

    if (code === 'pews-total') {
      chartObservation.pewsTotal = resource.valueInteger ?? 0;
      chartObservation.escalationLevel = parseEscalationLevel(resource);
      continue;
    }

    if (code === '55284-4') {
      chartObservation.bloodPressureSystolic = resource.component?.find(
        (component) => component.code?.coding?.[0]?.code === BP_SYSTOLIC_CODE,
      )?.valueQuantity?.value ?? null;
      chartObservation.bloodPressureDiastolic = resource.component?.find(
        (component) => component.code?.coding?.[0]?.code === BP_DIASTOLIC_CODE,
      )?.valueQuantity?.value ?? null;
      if (resource.dataAbsentReason || skipReason) {
        chartObservation.bloodPressureSystolic = null;
        chartObservation.bloodPressureDiastolic = null;
        if (skipReason) {
          chartObservation.bloodPressureSystolic_skipReason = skipReason;
          chartObservation.bloodPressureDiastolic_skipReason = skipReason;
        }
      }
      continue;
    }

    if (!field) {
      continue;
    }

    if (resource.dataAbsentReason) {
      chartObservation[field] = null;
      if (skipReason) {
        chartObservation[`${field}_skipReason`] = skipReason;
      }
      continue;
    }

    if (field === 'oxygenDelivery') {
      chartObservation.oxygenDelivery = resource.valueQuantity
        ? {
            value: resource.valueQuantity.value,
            unit: resource.valueQuantity.unit,
          }
        : null;
      continue;
    }

    if (field === 'avpu' || field === 'respiratoryDistress' || field === 'oxygenDevice') {
      chartObservation[field] = valueCode(resource);
      continue;
    }

    chartObservation[field] = resource.valueQuantity?.value ?? null;
  }

  return {
    patient: {
      name: patientName(patient),
      dob: patient.birthDate,
      ageBand: patientAgeBand(patient),
      nhsNumber: patient.identifier?.[0]?.value,
      admittedAt: resourcesOfType(bundle, 'Encounter')[0]?.period?.start,
    },
    observations: sortObservations([...grouped.values()]),
  };
}

// ---------------------------------------------------------------------------
// Outbound: ChartModel -> FHIR Bundle
// ---------------------------------------------------------------------------

/**
 * @param {object} patient - ChartModel patient
 * @param {object[]} observations - ChartObservation array
 * @param {{ encounterId?: string, practitionerId?: string, organizationId?: string }} [context]
 * @returns {unknown} FHIR R4 Bundle
 */
export function fromChartModelToFhirBundle(patient, observations, context = {}) {
  const patientId = 'patient-1';
  const encounterId = context.encounterId ?? 'encounter-1';
  const patientRef = `Patient/${patientId}`;
  const encounterRef = `Encounter/${encounterId}`;
  const entry = [];

  pushObservationResource(entry, buildPatientResource(patient, patientId));
  pushObservationResource(entry, buildEncounterResource(patientId, encounterId, patient.admittedAt));

  observations.forEach((observation, index) => {
    const prefix = `obs-${index + 1}`;
    const timestamp = observation.timestamp;

    const numericFields = [
      ['respiratoryRate', '9279-1', 'Respiratory rate', '/min', '/min'],
      ['oxygenSaturation', '59408-5', 'Oxygen saturation', '%', '%'],
      ['heartRate', '8867-4', 'Heart rate', '/min', '/min'],
      ['capillaryRefill', '44963-7', 'Capillary refill time', 's', 's'],
      ['temperature', '8310-5', 'Body temperature', 'Cel', 'Cel'],
    ];

    for (const [field, code, display, unit, ucumCode] of numericFields) {
      const skipReason = observation[`${field}_skipReason`];
      const value = observation[field];
      const id = `${prefix}-${field}`;
      const base = numericValueObservation(
        id,
        patientRef,
        encounterRef,
        timestamp,
        { coding: makeCoding(LOINC, code, display) },
        value,
        unit,
        ucumCode,
      );
      pushObservationResource(entry, value == null ? addSkipReason({ ...base, valueQuantity: undefined }, skipReason) : base);
    }

    const codedFields = [
      ['respiratoryDistress', 'pews-resp-distress'],
      ['oxygenDevice', 'pews-o2-device'],
      ['avpu', 'pews-avpu'],
    ];

    for (const [field, code] of codedFields) {
      const skipReason = observation[`${field}_skipReason`];
      const value = observation[field];
      const id = `${prefix}-${field}`;
      const base = codeableValueObservation(
        id,
        patientRef,
        encounterRef,
        timestamp,
        { coding: makeCoding(PEWS_SYSTEM, code) },
        value,
      );
      pushObservationResource(entry, value == null ? addSkipReason({ ...base, valueCodeableConcept: undefined }, skipReason) : base);
    }

    if (observation.oxygenDelivery !== null || observation.oxygenDelivery_skipReason) {
      const value = observation.oxygenDelivery;
      const base = value
        ? numericValueObservation(
            `${prefix}-oxygenDelivery`,
            patientRef,
            encounterRef,
            timestamp,
            { coding: makeCoding(PEWS_SYSTEM, 'pews-o2-delivery') },
            value.value,
            value.unit,
            value.unit,
          )
        : makeObservationBase(`${prefix}-oxygenDelivery`, patientRef, encounterRef, timestamp, {
            coding: makeCoding(PEWS_SYSTEM, 'pews-o2-delivery'),
          });
      pushObservationResource(entry, value == null ? addSkipReason(base, observation.oxygenDelivery_skipReason) : base);
    }

    pushObservationResource(
      entry,
      buildBloodPressureObservation(`${prefix}-bloodPressure`, patientRef, encounterRef, timestamp, observation),
    );

    const scoreObservation = {
      ...makeObservationBase(`${prefix}-pewsTotal`, patientRef, encounterRef, timestamp, {
        coding: makeCoding(PEWS_SYSTEM, 'pews-total', 'PEWS total score'),
      }),
      valueInteger: observation.pewsTotal,
    };
    if (observation.escalationLevel) {
      scoreObservation.extension = [{ url: ESCALATION_LEVEL_EXT, valueCode: observation.escalationLevel }];
    }
    pushObservationResource(entry, scoreObservation);
  });

  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry,
  };
}
