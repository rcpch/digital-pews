# FHIR PEWS test fixtures

Each fixture is a FHIR R4 Bundle representing one PEWS event.

## Positive fixtures (must pass all structural + semantic gates)

| File | Age band | Intent | Expected pewsTotal |
|---|---|---|---|
| stable-normal-5-12y.json | 5-12y | All vitals normal, no oxygen support | 0 |
| skip-reasons-0-11m.json | 0-11m | RR + resp-distress + BP skipped; SpO2=94, Temp=38.2 | 2 |
| oxygen-modality-transition.json | 5-12y | Two rounds: round 1 O2 in %, round 2 in L/min | 2 then 5 |

## Negative fixtures (must fail the expected gate)

| File | Expected failure gate | Why |
|---|---|---|
| missing-patient.json | structural | No Patient resource in bundle |
| bad-score.json | score-conformance | pewsTotal stored as 5 when recomputed value is 0 |

## Coding systems used

| Purpose | System | Example codes |
|---|---|---|
| Vital sign Observations | http://loinc.org | 9279-1 (RR), 59408-5 (SpO2), 8867-4 (HR), 55284-4 (BP), 8310-5 (Temp), 44963-7 (CRT) |
| PEWS-specific Observations | https://rcpch.github.io/fhir/CodeSystem/pews | pews-resp-distress, pews-o2-device, pews-o2-delivery, pews-avpu, pews-total |
| Age band extension | https://rcpch.github.io/fhir/StructureDefinition/pews-age-band | (valueCode) |
| Skip reason extension | https://rcpch.github.io/fhir/StructureDefinition/pews-skip-reason | (valueCode) |
| Missing data | http://terminology.hl7.org/CodeSystem/data-absent-reason | not-performed, unable-to-perform |
| Units of measure | http://unitsofmeasure.org | /min, %, Cel, s, L/min |
