# FHIR Chart Adapter Specification

Status: Draft v0.1  
Scope: Define the adapter boundary between FHIR payloads and the current PEWS chart model in this repository.

## 1. Purpose

The chart should remain UI-optimized and not depend on raw FHIR resource graphs.

This adapter provides a stable translation layer:

1. FHIR Bundle -> chart model for rendering
2. Chart model -> FHIR Bundle for persistence/exchange

## 2. Non-goals

- Redesigning chart internals to use native FHIR structures.
- Recomputing PEWS scores in the adapter.
- Finalizing national PEWS profile decisions.

## 3. Data flow

1. Load a FHIR R4 Bundle (collection or transaction).
2. Parse and map resources to the chart model.
3. Render via `window.NPEWSChart.init(patient, observations, ageBands)`.
4. On save/export, map chart model back to FHIR Bundle.

## 4. Adapter API contract

```ts
interface ChartModel {
  patient: {
    name: string;
    dob: string;
    age?: string;
    ageBracket?: string;
    ageBand: '0-11m' | '1-4y' | '5-12y' | '13+y';
    nhsNumber?: string;
    ward?: string;
    bed?: string;
    consultant?: string;
    admittedAt?: string;
  };
  observations: ChartObservation[];
}

interface ChartObservation {
  id: string;
  timestamp: string;
  respiratoryRate: number | null;
  respiratoryRate_skipReason?: string;
  respiratoryDistress: string | null;
  respiratoryDistress_skipReason?: string;
  oxygenSaturation: number | null;
  oxygenSaturation_skipReason?: string;
  oxygenDevice: string | null;
  oxygenDevice_skipReason?: string;
  oxygenDelivery: { value: number; unit: '%' | 'L/min' } | null;
  oxygenDelivery_skipReason?: string;
  heartRate: number | null;
  heartRate_skipReason?: string;
  bloodPressureSystolic: number | null;
  bloodPressureSystolic_skipReason?: string;
  bloodPressureDiastolic: number | null;
  bloodPressureDiastolic_skipReason?: string;
  capillaryRefill: number | null;
  capillaryRefill_skipReason?: string;
  avpu: string | null;
  avpu_skipReason?: string;
  temperature: number | null;
  temperature_skipReason?: string;
  pewsTotal: number;
  escalationLevel: 'low' | 'medium' | 'high' | 'emergency' | null;
}

declare function fromFhirBundleToChartModel(bundle: unknown): ChartModel;
declare function fromChartModelToFhirBundle(
  patient: ChartModel['patient'],
  observations: ChartObservation[],
  context?: {
    encounterId?: string;
    practitionerId?: string;
    organizationId?: string;
  },
): unknown;
```

## 5. Required guarantees

1. Preserve observation timestamp ordering exactly.
2. Preserve null + field-level skipReason semantics.
3. Preserve oxygen delivery modality transitions (`%` <-> `L/min`).
4. Preserve source `pewsTotal` and `escalationLevel` when provided.
5. Avoid lossy transforms for chart-required fields.
6. Be pure and deterministic (no side effects, no hidden state).

## 6. FHIR resource model per PEWS event

Minimum expected resources in each event bundle:

- Patient
- Encounter
- Observation resources for physiological measurements
- Derived Observation for PEWS total
- Optional QuestionnaireResponse for carer concern and clinical intuition
- Optional Condition or Flag for sepsis concern
- Provenance

UK Core alignment rule:

- Use UK Core profiles for Patient, Encounter, Observation, Practitioner, Provenance where available.
- Use thin local extensions only for PEWS-specific semantics not covered by UK Core.

## 7. Mapping rules (chart fields -> FHIR)

### 7.1 Context and demographics

- `patient.nhsNumber` -> `Patient.identifier` (NHS number system)
- `patient.name` -> `Patient.name`
- `patient.dob` -> `Patient.birthDate`
- `patient.ward`, `patient.bed` -> `Encounter.location`
- `patient.consultant` -> `Encounter.participant`
- `patient.admittedAt` -> `Encounter.period.start`
- `patient.ageBand` -> local extension (Encounter or derived score Observation)

### 7.2 Vital signs and chart observations

- `respiratoryRate` -> Observation.valueQuantity
- `oxygenSaturation` -> Observation.valueQuantity
- `heartRate` -> Observation.valueQuantity
- `bloodPressureSystolic` and `bloodPressureDiastolic` -> single blood pressure Observation with `component[]`
- `temperature` -> Observation.valueQuantity (method/site optional)
- `capillaryRefill` -> Observation.valueQuantity (seconds)
- `avpu` -> Observation.valueCodeableConcept (local value set permitted)
- `respiratoryDistress` -> Observation.valueCodeableConcept (local value set permitted)
- `oxygenDevice` -> Observation.valueCodeableConcept (or Device reference if implemented)
- `oxygenDelivery` -> Observation.valueQuantity with explicit unit `%` or `L/min`

### 7.3 Missing values and skip reasons

If a measurement is skipped:

1. Set Observation.value[x] absent.
2. Set Observation.dataAbsentReason.
3. Preserve chart skip reason code in extension or note where needed for round-trip.

Recommended extension namespace pattern:

- `https://rcpch.github.io/fhir/StructureDefinition/*`

### 7.4 Scores and escalation

- `pewsTotal` -> derived Observation.valueInteger
- `escalationLevel` -> Observation.interpretation or extension
- score trigger metadata (if present) -> Observation.component or extension

Derived PEWS total Observation should reference source observations via `derivedFrom`.

## 8. Inbound algorithm (FHIR -> chart)

1. Index bundle entries by resourceType and id.
2. Resolve Patient and Encounter context.
3. Group observations by effective timestamp.
4. For each timestamp group, construct one ChartObservation object.
5. Populate per-field values and skip reasons.
6. Attach PEWS total and escalation fields from derived Observation.
7. Sort ascending by timestamp.
8. Return `{ patient, observations }`.

## 9. Outbound algorithm (chart -> FHIR)

1. Emit/resolve Patient and Encounter resources.
2. For each ChartObservation, emit measurement Observations.
3. Emit one derived score Observation for `pewsTotal`.
4. Emit optional contextual resources (QuestionnaireResponse, Condition/Flag).
5. Emit Provenance for author/time/version traceability.
6. Return Bundle containing all resources and references.

## 10. Validation and error handling

Hard failures (throw):

- No Patient in bundle.
- No Observation resources in bundle.
- Unsupported or malformed timestamp.

Soft failures (collect warnings):

- Unknown code values in local value sets.
- Missing optional demographic fields.
- Unsupported extensions.

Adapter should expose structured diagnostics:

```ts
interface AdapterWarning {
  code: string;
  message: string;
  path?: string;
}
```

## 11. Test requirements

Minimum tests for initial implementation:

1. FHIR fixture -> chart model matches expected patient/observation shape.
2. Chart model -> FHIR bundle emits required resources and references.
3. Round-trip chart -> FHIR -> chart preserves all chart-required fields.
4. Oxygen modality transition retains `%` to `L/min` boundary behavior.
5. Skip reasons survive round-trip without conversion loss.

## 12. Implementation boundary in this repo

Primary integration point:

- Chart init call in `pews-chart/chart.js` via `window.NPEWSChart.init(patient, observations, ageBands)`

Recommended adapter location:

- `pews-chart/fhir-adapter.js`

Recommended fixtures location:

- `pews-chart/fixtures/`

## 13. Open decisions (tracked, not blocking)

- Canonical coding system for PEWS total and escalation levels.
- Standardized value set for respiratory distress categories.
- AVPU representation of "Asleep" (coded value vs qualifier).
- Preferred representation for score-bearing skip reasons.
- Final national profile approach for contextual fields.
