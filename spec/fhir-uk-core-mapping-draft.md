# Digital PEWS FHIR UK Core Mapping Draft (v0.1)

Status: Draft for local design and partner discussion.
Scope: Pragmatic mapping from the existing digital-pews UI data shape to a FHIR-first payload model.

## 1) Design approach

This draft uses three layers so we can move quickly without waiting for a perfect national profile set:

1. Canonical PEWS event model (local, implementation-neutral)
2. FHIR exchange model (FHIR R4 resources, UK Core aligned where possible)
3. UI adapter model (current chart format in pews-chart)

The key principle is:
- Chart UI is a read/write view model.
- Canonical PEWS event is the source of truth.
- FHIR Bundle is the interoperability envelope.

## 2) Canonical PEWS event model

One PEWS observation round for one patient at one timestamp:

```json
{
  "eventId": "string",
  "timestamp": "2026-03-18T02:00:00Z",
  "encounterId": "string",
  "patient": {
    "nhsNumber": "string",
    "name": "string",
    "dob": "YYYY-MM-DD",
    "ageBand": "0-11m|1-4y|5-12y|13+y"
  },
  "observations": {
    "respiratoryRate": { "value": 32, "unit": "breaths/min", "skipReason": null },
    "respiratoryDistress": { "value": "none|mild|moderate|severe", "skipReason": null },
    "oxygenSaturation": { "value": 95, "unit": "%", "skipReason": null },
    "oxygenDevice": { "value": "air|NP|FM|HB|NRB|HF|BiP|CP", "skipReason": null },
    "oxygenDelivery": { "value": 2, "unit": "L/min|%", "skipReason": null },
    "heartRate": { "value": 120, "unit": "beats/min", "skipReason": null },
    "bloodPressure": {
      "systolic": { "value": 100, "unit": "mmHg", "skipReason": null },
      "diastolic": { "value": 62, "unit": "mmHg", "skipReason": null }
    },
    "capillaryRefill": { "value": 2, "unit": "s", "skipReason": null },
    "avpu": { "value": "A|V|P|U|Asleep", "skipReason": null },
    "temperature": { "value": 38.2, "unit": "Cel", "site": "axillary|tympanic|skin", "skipReason": null },
    "carerConcern": { "value": "worse|same|better|asleep|unavailable|skip" },
    "clinicalIntuition": { "value": "yes|no|skip" },
    "sepsisConcern": { "value": "none|new-sepsis|new-septic-shock" }
  },
  "scoring": {
    "total": 7,
    "escalationLevel": "low|medium|high|emergency|null",
    "triggerCodes": ["CC", "CI"],
    "alreadyEscalated": false
  },
  "provenance": {
    "recordedBy": "practitioner-id",
    "recordedAt": "2026-03-18T02:01:00Z",
    "version": 1
  }
}
```

Notes:
- Keep skipReason per field, not per event.
- Keep scoring separate from raw measurements.
- Keep ageBand explicit because chart thresholds are age-band specific in this repo.

## 3) FHIR resource package per PEWS event

A PEWS event is represented as a small resource set, typically sent as a Bundle type collection or transaction:

- Patient
- Encounter
- Practitioner (or reference)
- Observation resources for each physiological measure
- Derived Observation for PEWS total
- Optional Condition/Flag for sepsis concern
- Optional QuestionnaireResponse for carer concern and clinical intuition
- Provenance

Recommended transport unit:
- One Bundle per PEWS event.
- For timeline retrieval, search by Encounter + category=vital-signs + effective time range.

## 4) Mapping table (UI model -> FHIR)

## 4.1 Context and demographics

| UI field | FHIR target | Notes |
|---|---|---|
| patient.nhsNumber | Patient.identifier (NHS number system) | Use NHS number as primary business identifier. |
| patient.name | Patient.name | HumanName. |
| patient.dob | Patient.birthDate | Date only. |
| ward/bed/consultant | Encounter.location, Encounter.participant | Prefer Encounter-level placement and responsible clinician. |
| admittedAt | Encounter.period.start | Admission start. |
| ageBand | Encounter.extension or Observation note/extension | Age band is a PEWS operational concept; add extension if needed. |

## 4.2 Observations

| UI field | FHIR target | Notes |
|---|---|---|
| respiratoryRate | Observation (vital-signs) valueQuantity | Standard respiratory rate observation. |
| oxygenSaturation | Observation (vital-signs) valueQuantity | O2 saturation observation. |
| heartRate | Observation (vital-signs) valueQuantity | Heart rate observation. |
| bloodPressureSystolic/Diastolic | Observation BP profile with component[systolic, diastolic] | Model as one BP Observation with components. |
| temperature | Observation (vital-signs) valueQuantity + bodySite/method if available | Keep decimal precision. |
| capillaryRefill | Observation valueQuantity (seconds) | Not always in core vitals panel; still valid Observation. |
| avpu | Observation valueCodeableConcept | Local/NHS value set likely required. |
| respiratoryDistress | Observation valueCodeableConcept | Local value set from SPOT guidance. |
| oxygenDevice | Observation.valueCodeableConcept or Observation.device reference | If tracking physical devices, use Device + reference. |
| oxygenDelivery | Observation valueQuantity | Keep unit as % or L/min and preserve modality changes in sequence. |

## 4.3 Skip reasons and missing values

When an observation is skipped:

- Set Observation.status = final (or entered-in-error if corrected later)
- Do not set value[x]
- Set Observation.dataAbsentReason
- Add Observation.note with local reason text if needed
- If skip reasons are score-bearing (for example unsuccessful with concern), record a PEWS-specific extension or companion Observation to retain scoring traceability

Suggested local extension URL pattern:
- https://rcpch.github.io/fhir/StructureDefinition/pews-skip-scoring-impact

## 4.4 PEWS score and escalation

| UI field | FHIR target | Notes |
|---|---|---|
| pewsTotal | Observation (derived score) valueInteger | Derived observation at same effective time. |
| escalationLevel | Observation.interpretation or extension | Interpretation is possible; extension may be clearer for low/medium/high/emergency labels. |
| triggerCodes | Observation.component or extension | Keep short codes to support audit and UI replay. |
| alreadyEscalated | Observation.extension | Needed to suppress duplicate alert semantics. |

For PEWS score Observation:
- derivedFrom references should include the measurement Observations in that round.

## 4.5 Carer concern, clinical intuition, sepsis concern

These are not all pure physiological vitals and are often better represented as structured assessments:

Option A (recommended for fast delivery):
- QuestionnaireResponse for carer concern + clinical intuition + context fields.
- Condition or Flag for sepsis suspicion/escalation concerns.

Option B:
- Individual Observation resources with valueCodeableConcept.

## 5) FHIR UK Core alignment strategy

Because there is not yet a nationally fixed PEWS profile set, use this approach:

1. Reuse UK Core profiles for generic resources first (Patient, Encounter, Observation, Practitioner, Provenance).
2. Constrain with local RCPCH profiles only where PEWS semantics are missing.
3. Keep local profiles thin and migration-friendly.
4. Keep value sets externalized so national updates can be applied without schema rewrites.

## 6) Value set strategy

Split value sets into:
- National standard sets (where available)
- PEWS national guidance sets (SPOT)
- RCPCH local interim sets

Minimum interim value sets needed now:
- respiratoryDistress levels
- AVPU (+ Asleep)
- oxygenDevice short codes
- skipReason codes
- escalation level labels
- trigger criteria short codes

## 7) Bundle shape (example skeleton)

```json
{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    { "resource": { "resourceType": "Patient" } },
    { "resource": { "resourceType": "Encounter" } },
    { "resource": { "resourceType": "Observation", "category": [{ "coding": [{ "code": "vital-signs" }] }] } },
    { "resource": { "resourceType": "Observation" } },
    { "resource": { "resourceType": "QuestionnaireResponse" } },
    { "resource": { "resourceType": "Provenance" } }
  ]
}
```

## 8) Wiring to current digital-pews UI

Current chart engine expects:
- patient object shape like PATIENT in pews-chart/demo-data.js
- observations array shape like OBSERVATIONS in pews-chart/demo-data.js

Define a thin adapter with two pure functions:

- fromFhirBundleToChartModel(bundle) -> { patient, observations }
- fromChartModelToFhirBundle(patient, observations, context) -> bundle

### 8.1 Required adapter guarantees

- Preserve exact timestamp ordering.
- Preserve null + skipReason semantics.
- Preserve oxygen modality transitions (% <-> L/min).
- Preserve calculated PEWS total and escalationLevel if provided by source.
- Do not recompute scores in adapter by default.

### 8.2 Where to hook in this repo

Integration point is chart init in pews-chart/chart.js:
- window.NPEWSChart.init(patient, observations, ageBands)

So the wiring pattern is:

1. Load FHIR Bundle JSON from API or fixture.
2. Run fromFhirBundleToChartModel.
3. Call window.NPEWSChart.init(mapped.patient, mapped.observations, window.AGE_BANDS).

This allows immediate UI use without changing chart internals.

## 9) Proposed implementation slices

Slice 1 (1-2 days)
- Freeze canonical model fields for current chart-required data.
- Add adapter interface file and unit tests using existing demo-data fixtures.

Slice 2 (2-4 days)
- Implement Observation mapping for core vitals and score.
- Implement skipReason and oxygen modality handling.

Slice 3 (2-3 days)
- Add QuestionnaireResponse mapping for carer concern and clinical intuition.
- Add sepsis concern mapping (Condition/Flag).

Slice 4 (1-2 days)
- Add round-trip tests: chart model -> FHIR -> chart model, asserting no data loss for core fields.

## 10) Open decisions to confirm nationally or regionally

- Canonical code system for PEWS total and escalation level.
- Canonical code/value set for respiratory distress categories.
- Whether AVPU should include Asleep as a coded value or separate qualifier.
- Preferred representation of score-bearing skip reasons.
- Whether event-level composition should use QuestionnaireResponse, Observation-only, or mixed approach.

## 11) Practical recommendation for now

Proceed with mixed model:
- Observation for vitals + PEWS total.
- QuestionnaireResponse for contextual clinical judgement fields.
- Thin local extensions for PEWS-specific semantics.

This keeps interoperability credible now, while minimizing migration pain when a fuller national PEWS profile set is published.
