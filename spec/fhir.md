# FHIR adapter and conformance

This file documents the implemented FHIR boundary for Digital PEWS. The adapter maps between the chart's internal patient/observation model and FHIR R4 `Bundle` resources for interoperability; the first integration target is GESH on Oracle via SMART-on-FHIR. It records current code and tests only; draft or unresolved mapping ideas are quarantined in the appendix.

## Adapter contract

Implemented in `pews-chart/fhir-adapter.js`:

- `fromFhirBundleToChartModel(bundle)` parses a FHIR R4 `Bundle` into `{ patient, observations }` for the chart.
- `fromChartModelToFhirBundle(patient, observations, context?)` builds a FHIR R4 `Bundle` from chart data.
- Both functions are pure data transforms. The adapter does **not** compute or recompute PEWS scores. It copies `observation.pewsTotal` to/from the score `Observation`; score recomputation is a separate safety gate in `test/fhir/score-conformance.test.js` using `pews-chart/npews-scorer.js`.

### FHIR -> chart behaviour

`fromFhirBundleToChartModel`:

1. Requires `bundle.resourceType === 'Bundle'` and `Bundle.entry` to be an array.
2. Requires at least one `Patient` and one `Observation`; otherwise it throws `No Patient in bundle` or `No Observation resources in bundle`.
3. Requires each mapped `Observation.effectiveDateTime` to be a parseable string; otherwise it throws `Unsupported or malformed timestamp`.
4. Uses the first `Patient` and first `Encounter` only.
5. Reads patient fields as:
   - `patient.name`: `Patient.name[0].text`, falling back to joined `Patient.name[0].given`.
   - `patient.dob`: `Patient.birthDate`.
   - `patient.ageBand`: `Patient.extension` with `pews-age-band` URL.
   - `patient.nhsNumber`: `Patient.identifier[0].value`.
   - `patient.admittedAt`: first `Encounter.period.start`.
6. Groups observations by exact `effectiveDateTime`; each timestamp becomes one chart observation.
7. Uses only `Observation.code.coding[0].code` for dispatch. Unknown codes are ignored.
8. Sorts returned chart observations ascending by timestamp.
9. Preserves stored `pewsTotal` and `escalationLevel`; it does not validate them.

### Chart -> FHIR behaviour

`fromChartModelToFhirBundle`:

1. Emits a `Bundle` with `type: 'collection'`.
2. Emits one `Patient` with fixed id `patient-1`.
3. Emits one `Encounter` with id `context.encounterId ?? 'encounter-1'`. `context.practitionerId` and `context.organizationId` are accepted by the signature but are not used.
4. Emits per-chart-observation `Observation` resources for numeric vitals, coded PEWS fields, blood pressure, optional oxygen delivery, and one score observation.
5. Sets all emitted observations to `status: 'final'` and references `Patient/patient-1` plus the emitted encounter.
6. Emits a score `Observation` coded `pews-total` with `valueInteger: observation.pewsTotal`; if `observation.escalationLevel` is present it is stored in the `pews-escalation-level` extension.
7. Does not emit UK Core `meta.profile`, `QuestionnaireResponse`, `Condition`, `Flag`, `Provenance`, `Practitioner`, `Organization`, or score `derivedFrom` links.

## Code systems and mappings

Authoritative standards are used where the adapter has a standard code. RCPCH PEWS codes and extensions are repo-local conventions pending national/canonical decisions.

### Resource and identifier systems

| Use | System / URL | Code or value | Status | Implemented behaviour |
|---|---|---|---|---|
| LOINC | `http://loinc.org` | see vital-sign table below | Authoritative standard | Used for physiological observation codes and BP component codes. |
| UCUM | `http://unitsofmeasure.org` | `/min`, `%`, `s`, `Cel`, `mm[Hg]`; oxygen delivery preserves the chart/FHIR unit literally | Authoritative system; literal units are adapter conventions | Used in emitted `valueQuantity.system`; `unit` and `code` are written as listed. |
| Local PEWS code system | `https://rcpch.github.io/fhir/CodeSystem/pews` | see local-code table below | Repo-local convention | Used for PEWS-specific observation codes and their coded values. |
| NHS number identifier | `https://fhir.nhs.uk/Id/nhs-number` | `patient.nhsNumber` | NHS/UK convention | Written on `Patient.identifier`; inbound currently reads `Patient.identifier[0].value` without checking the system. |
| Missing data | `http://terminology.hl7.org/CodeSystem/data-absent-reason` | `not-performed`, `unable-to-perform` | Authoritative HL7 terminology | Outbound maps local skip reason `unable` to `unable-to-perform`; any other skip reason to `not-performed`. |
| Encounter class | `http://terminology.hl7.org/CodeSystem/v3-ActCode` | `IMP` | Authoritative HL7 terminology | Outbound `Encounter.class`; status is `in-progress`. |
| Age band extension | `https://rcpch.github.io/fhir/StructureDefinition/pews-age-band` | copied `Patient.extension[].valueCode` | Repo-local convention | Written/read on `Patient.extension`; adapter does not derive age band. |
| Skip reason extension | `https://rcpch.github.io/fhir/StructureDefinition/pews-skip-reason` | copied local `valueCode` | Repo-local convention | Preserves field-level chart skip reasons when `dataAbsentReason` is present. |
| Escalation extension | `https://rcpch.github.io/fhir/StructureDefinition/pews-escalation-level` | copied score `valueCode` | Repo-local convention | Stored only on the score observation when present. |

### LOINC vital-sign mappings

| Chart field | Observation code system | Observation code | Display used outbound | Value |
|---|---|---|---|---|
| `respiratoryRate` | `http://loinc.org` | `9279-1` | `Respiratory rate` | `valueQuantity`, UCUM `/min` |
| `oxygenSaturation` | `http://loinc.org` | `59408-5` | `Oxygen saturation` | `valueQuantity`, UCUM `%` |
| `heartRate` | `http://loinc.org` | `8867-4` | `Heart rate` | `valueQuantity`, UCUM `/min` |
| `bloodPressureSystolic` / `bloodPressureDiastolic` | `http://loinc.org` | `55284-4` | `Blood pressure systolic and diastolic` | single BP `Observation` with components |
| `temperature` | `http://loinc.org` | `8310-5` | `Body temperature` | `valueQuantity`, UCUM `Cel` |
| `capillaryRefill` | `http://loinc.org` | `44963-7` | `Capillary refill time` | `valueQuantity`, UCUM `s` |

BP components inside the `55284-4` observation:

| Component | Code system | Code | Display used outbound | Unit |
|---|---|---|---|---|
| Systolic BP | `http://loinc.org` | `8480-6` | `Systolic blood pressure` | UCUM `mm[Hg]` |
| Diastolic BP | `http://loinc.org` | `8462-4` | `Diastolic blood pressure` | UCUM `mm[Hg]` |

### Local PEWS observation mappings

| Chart field | Observation code system | Observation code | FHIR value |
|---|---|---|---|
| `respiratoryDistress` | `https://rcpch.github.io/fhir/CodeSystem/pews` | `pews-resp-distress` | `valueCodeableConcept.coding[0].code` |
| `oxygenDevice` | `https://rcpch.github.io/fhir/CodeSystem/pews` | `pews-o2-device` | `valueCodeableConcept.coding[0].code` |
| `oxygenDelivery` | `https://rcpch.github.io/fhir/CodeSystem/pews` | `pews-o2-delivery` | `valueQuantity.value`, with unit/code copied from chart unit |
| `avpu` | `https://rcpch.github.io/fhir/CodeSystem/pews` | `pews-avpu` | `valueCodeableConcept.coding[0].code` |
| `pewsTotal` | `https://rcpch.github.io/fhir/CodeSystem/pews` | `pews-total` | `valueInteger` |

The adapter does not validate local value sets. Coded field values are passed through from/to the first coding code.

## Special handling

### Blood pressure

- Blood pressure is one `Observation` coded `55284-4`, not two separate observations.
- Systolic and diastolic are stored as `component[]` entries with LOINC `8480-6` and `8462-4`.
- Inbound: if the BP observation has `dataAbsentReason` or a skip extension, both chart BP fields are set to `null`; when the skip extension exists the same skip reason is copied to both BP fields.
- Outbound: if both BP values are `null`, the adapter emits a BP observation without components and adds `dataAbsentReason` only when a BP skip reason is present. The current builder treats BP as skipped only when both values are null.

### Oxygen delivery modality

- Oxygen delivery is represented by the local observation code `pews-o2-delivery` with `valueQuantity`.
- The adapter preserves the FHIR/chart unit literally. Current tests exercise `%` and `L/min`.
- Outbound sets `valueQuantity.unit` and `valueQuantity.code` to the same chart unit, using UCUM as the system.
- The adapter itself only preserves the unit. The rendered chart line-break behaviour is in `pews-chart/chart.js`: oxygen-delivery points are split into separate trend-line segments when a value is skipped/null or when adjacent non-null `oxygenDelivery.unit` values differ. `L/min` values are scaled for display on the shared axis; the break marks that `%` and `L/min` are not a continuous modality.

### Skipped observations and absent data

- Chart fields use `null` plus optional `field_skipReason`.
- Inbound: `Observation.dataAbsentReason` makes the mapped chart field `null`; the `pews-skip-reason` extension, when present, fills `field_skipReason`.
- Outbound: a null field with a skip reason emits no `value[x]`, adds `dataAbsentReason`, and adds the `pews-skip-reason` extension.
- Skip reason `unable` becomes `dataAbsentReason` code `unable-to-perform`; all other skip reasons become `not-performed` while the original local reason remains in the extension.
- A bare null without a skip reason may be emitted without `dataAbsentReason`; oxygen delivery is omitted entirely when null and not skipped.

### Age band

- The adapter reads and writes the age band only through `Patient.extension` URL `https://rcpch.github.io/fhir/StructureDefinition/pews-age-band`.
- It does not calculate age band from date of birth and timestamp. Age-band derivation belongs to scorer/chart logic, not this adapter.

## Conformance testing

Current fixtures live in `test/fhir/fixtures/`:

| Fixture | Role currently implemented |
|---|---|
| `stable-normal-5-12y.json` | Positive normal observations, stored score `0`. |
| `skip-reasons-0-11m.json` | Positive absent-data and skip-reason preservation, stored score `1`. |
| `oxygen-modality-transition.json` | Positive two-round `%` then `L/min` oxygen delivery, stored scores `2` then `5`. |
| `missing-patient.json` | Negative structural shape: no `Patient`. |
| `bad-score.json` | Negative score-conformance shape: stored score `5` while recomputed score is `0`. |

Current gates:

| Gate | Implemented by | What it proves today |
|---|---|---|
| Structural | `test/fhir/conformance-harness.test.js` | Positive bundles are `Bundle`s with non-empty entries, one `Patient`, observations with `effectiveDateTime`, codes, and integer `pews-total`; negative fixtures expose expected bad shapes. |
| Profile/coding, lightweight only | `test/fhir/conformance-harness.test.js`, fixture JSON | Checks local coding presence and selected clinical coding details: skip extension URL/value, `dataAbsentReason` codes, oxygen units, score observations. Strict UK Core/profile validation is not implemented. |
| Semantic mapping | `test/fhir/roundtrip.test.js` plus selected conformance-harness checks | FHIR -> chart maps patient fields, vitals, coded fields, BP components, oxygen delivery `{ value, unit }`, skip reasons, sorting, and hard errors for missing Patient/Observations. Chart -> FHIR emits the expected envelope, references, BP components, skip data, oxygen unit, and score observation. |
| Score conformance | `test/fhir/score-conformance.test.js` | Recomputes scores from adapter output with `npews-scorer.js`; stored `pewsTotal` must match for positive fixtures and mismatch for `bad-score`. This is the safety gate that keeps scoring outside the adapter. |
| Round-trip purity | `test/fhir/roundtrip.test.js` | Chart -> FHIR -> chart preserves chart-critical fields, including skip reason, oxygen delivery unit/value, stored score, and escalation level. FHIR -> chart -> FHIR assertions remain `todo` in the test file. |

## Appendix: future work / unresolved mappings

These items are draft or aspirational. They are **not** implemented by `pews-chart/fhir-adapter.js` unless stated above.

- Strict FHIR R4 and UK Core profile validation with pinned package versions, validator reports, and warning allow-lists.
- National/canonical code decisions for PEWS total, escalation labels, respiratory distress values, oxygen device values, AVPU including `Asleep`, trigger codes, and skip-reason scoring impact. The current RCPCH PEWS CodeSystem and extensions are interim repo-local conventions.
- `QuestionnaireResponse` representation for carer concern and clinical intuition.
- `Condition` or `Flag` representation for sepsis/specific concern.
- `Provenance`, `Practitioner`, and `Organization` emission; the adapter currently ignores practitioner/organisation context.
- Score observation `derivedFrom`, sub-score components, trigger metadata, and already-escalated flags.
- Additional fixture categories from the draft conformance plan, such as deterioration-escalation and age-band-boundary bundles.
