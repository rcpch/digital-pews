# FHIR PEWS one-pager: how to read a Bundle without losing the will to live

Date: 2026-04-21
Audience: digital-pews contributors who are new to FHIR

## 1) What is a Bundle?

A FHIR Bundle is a container that groups related resources.

For a PEWS event, one Bundle might include:

- Patient
- Encounter
- Several Observation resources (vitals)
- One score Observation (NPEWS total, optionally sub-scores)
- Provenance (who recorded it, when)

Mental model:

- Bundle = envelope
- entry[] = list of documents inside the envelope
- entry[i].resource = the actual document

## 2) Where is the clinical data?

Usually in Observation resources.

The minimum fields to look at first:

1. resourceType (should be Observation)
2. code (what was measured)
3. effectiveDateTime (when measured)
4. value[x] (the result)
5. dataAbsentReason (if skipped/missing)
6. component[] (if there are sub-parts)

Most common result locations:

- valueQuantity.value: numeric result (for example HR 132)
- valueCodeableConcept: coded result (for example AVPU = A)
- component[].valueQuantity or component[].valueCodeableConcept: grouped results

## 3) PEWS vs NPEWS1

- PEWS: generic clinical concept (paediatric early warning score)
- NPEWS1: a specific National PEWS profile/example naming used in NHS Clinical Observations work

In practice:

- PEWS is the umbrella term
- NPEWS1 is one concrete model/profile instance used in examples

## 4) A tiny observation example with annotations

```json
{
  "resourceType": "Observation",
  "status": "final",
  "code": {
    "coding": [
      {
        "system": "http://loinc.org",
        "code": "9279-1",
        "display": "Respiratory rate"
      }
    ]
  },
  "subject": { "reference": "Patient/123" },
  "encounter": { "reference": "Encounter/456" },
  "effectiveDateTime": "2026-03-18T02:00:00Z",
  "valueQuantity": {
    "value": 32,
    "unit": "/min",
    "system": "http://unitsofmeasure.org",
    "code": "/min"
  }
}
```

How to read this in 10 seconds:

- What? respiratory rate
- When? 2026-03-18T02:00:00Z
- Value? 32 per minute
- Who/where? linked by subject and encounter references

## 5) Why the nesting exists

FHIR is verbose because it carries:

- clinical meaning (code systems)
- units and comparability
- provenance and traceability
- references between resources
- safe handling of missing data

That complexity helps interoperability, but it is painful to read at first.

## 6) Fast triage method for any PEWS Bundle

When opening a large Bundle JSON, do this in order:

1. Confirm Bundle.type and count entry[]
2. Find all entry[].resource where resourceType = Observation
3. For each Observation, scan code -> effectiveDateTime -> value[x]
4. Separate vital signs from score observations
5. Check for missing/skipped fields via dataAbsentReason

If you only do those five steps, you can understand most payloads quickly.

## 7) Mapping to this repo's chart model

Chart model fields in this repo are mostly direct equivalents of Observation values:

- respiratoryRate <- Observation(valueQuantity)
- oxygenSaturation <- Observation(valueQuantity)
- heartRate <- Observation(valueQuantity)
- bloodPressureSystolic/Diastolic <- Observation(component[])
- avpu <- Observation(valueCodeableConcept)
- temperature <- Observation(valueQuantity)

Score fields:

- pewsTotal <- score Observation (value or components)
- escalationLevel <- interpretation or extension/profile rule

## 8) Common confusion points

1. "I cannot find the data"

- You are probably looking at Bundle/metadata instead of entry[].resource Observation payloads.

1. "Everything is ids and profiles"

- Ignore identifiers and meta first; read code/effective/value first.

1. "Why are there multiple observations with similar timestamps?"

- One timestamped round often emits many Observation resources, one per parameter.

## 9) Practical next step

Take one real PEWS example and produce a compact extraction table:

- time
- parameter code/display
- value
- unit
- skip reason

That table is the easiest bridge between FHIR payloads and UI chart rows.
