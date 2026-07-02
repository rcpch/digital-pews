# FHIR PEWS Bundle Conformance Testing Specification

Status: Draft v0.1
Owner: digital-pews
Last updated: 2026-04-21

## 1. Purpose

Define a conformance test harness for PEWS FHIR Bundle mapping so we can prove:

1. Bundle payloads are valid FHIR/profile-conformant.
2. Clinical meaning required by the chart is preserved.
3. Score integrity is preserved against local NPEWS scoring rules.
4. Adapter round-trips do not introduce data loss for chart-required fields.

## 2. Scope

In scope:
- `fromFhirBundleToChartModel(bundle)`
- `fromChartModelToFhirBundle(patient, observations, context)`
- PEWS/NPEWS event-level Bundle payloads used by this repository

Out of scope:
- Clinical governance sign-off
- National profile publication decisions
- Runtime API security/performance testing

## 3. Core principles

1. Separate structural conformance from clinical conformance.
2. Fail fast on schema/profile errors.
3. Treat score mismatches as safety-critical failures.
4. Allow controlled metadata drift (ids/meta/provenance version) only when declared.
5. Keep fixtures deterministic and versioned.

## 4. Test harness architecture

Harness layers:

1. Structural checks
2. Profile validation checks
3. Semantic mapping checks
4. Score recomputation checks
5. Round-trip invariants
6. Negative tests

Pipeline order:
- structural -> profile -> semantic -> scoring -> round-trip -> negative suite

## 5. Test data strategy

Fixture categories:

1. `stable-normal`: low-risk observations with no missing values.
2. `deterioration-escalation`: increasing severity with escalation transitions.
3. `skip-reasons`: representative null + skip reason combinations.
4. `oxygen-modality-transition`: `%` and `L/min` changes across rounds.
5. `age-band-boundary`: examples around 1y, 5y, 13y boundaries.
6. `incomplete-reference`: broken references for negative validation.
7. `bad-score`: intentionally incorrect score totals/sub-scores.

Fixture policy:
- At least one positive fixture per category 1-5.
- At least one negative fixture for categories 6-7.
- Every fixture has a short README note with intent and expected result.

## 6. Structural conformance checks

For each input Bundle:

1. JSON parses with no error.
2. `resourceType` is `Bundle`.
3. `entry` exists and is a non-empty array.
4. Every `entry[i].resource.resourceType` is present.
5. `Observation.subject` and `Observation.encounter` references resolve within Bundle or approved external context.
6. Every Observation used in chart mapping has a parseable effective timestamp.

Failure severity:
- Any failure here is a hard test failure.

## 7. Profile conformance checks

Validate Bundle against:

1. FHIR R4 core.
2. UK Core package version pinned in the harness config.
3. Selected NHS Clinical Observations/NPEWS profile package version pinned in config.

Rules:
- Errors fail the build.
- Warnings are recorded and compared against an allow-list.
- New warnings fail unless explicitly accepted in review.

Output artifact:
- Machine-readable validator report committed in CI artifacts.

## 8. Semantic mapping checks (FHIR -> chart)

Assertions:

1. `patient` fields required by chart are populated when present in source.
2. Observation ordering in chart model matches source effective timestamp ordering.
3. Null + `*_skipReason` semantics are preserved.
4. Oxygen delivery modality transitions are preserved exactly (`%` vs `L/min`).
5. Blood pressure systolic/diastolic mapping from `component[]` is stable.
6. Coded values (for example AVPU, respiratory distress) map to expected chart enum values.

Failure severity:
- Any mismatch is a hard failure.

## 9. Score conformance checks

Purpose:
- Detect drift between stored score fields and score computed from observations + age band.

Method:

1. For each mapped chart observation, compute expected score using local scorer logic aligned with [spec/npews-scoring.md](spec/npews-scoring.md).
2. Compare expected total with mapped/stored `pewsTotal`.
3. If sub-score detail is available in source profile, compare per-parameter sub-scores too.

Policy:
- Any score mismatch is a hard failure.
- Reports must include timestamp, ageBand, field-level contributing deltas.

## 10. Round-trip invariants

### 10.1 Chart -> FHIR -> Chart

Given a chart fixture:

1. Convert to Bundle.
2. Convert back to chart model.
3. Assert deep equality for chart-critical fields:
- patient demographics used by chart
- all vital values
- all skip reasons
- oxygen delivery unit and value
- `pewsTotal`
- `escalationLevel`
- timestamp order

Allowed differences:
- Generated ids
- profile metadata fields
- provenance version counters

### 10.2 FHIR -> Chart -> FHIR

Given a Bundle fixture:

1. Convert to chart model.
2. Convert back to Bundle.
3. Assert invariant set:
- required resources still present
- core links remain valid
- chart-critical semantic values preserved

## 11. Negative tests

Must fail for expected reason:

1. Missing Patient resource.
2. Missing Observation set.
3. Invalid timestamp format.
4. Unresolvable references.
5. Wrong oxygen unit representation.
6. Deliberately incorrect score values.

Requirement:
- Each negative case asserts specific error code/message pattern.

## 12. Diagnostics contract

Harness emits structured diagnostics:

```ts
interface ConformanceIssue {
  severity: 'error' | 'warning';
  gate: 'structural' | 'profile' | 'semantic' | 'scoring' | 'roundtrip';
  code: string;
  message: string;
  path?: string;
  fixture?: string;
}
```

## 13. Exit criteria for readiness

Minimum bar for "adapter-ready":

1. 100% pass on all positive fixtures.
2. 100% expected-fail on all negative fixtures.
3. Zero structural/profile errors in positive fixtures.
4. Zero score mismatches.
5. Round-trip invariants passing for all chart-critical fields.

## 14. Proposed repository layout

Proposed paths:

- `pews-chart/fhir-adapter.js`
- `spec/fhir-pews-conformance-testing.md` (this document)
- `test/fhir/fixtures/*.json`
- `test/fhir/fixtures/README.md`
- `test/fhir/conformance-harness.test.js`
- `test/fhir/score-conformance.test.js`
- `test/fhir/roundtrip.test.js`

## 15. Incremental implementation plan

Phase 1:
- Structural checks and semantic mapping checks using local fixtures.

Phase 2:
- Round-trip invariants and negative tests.

Phase 3:
- Score recomputation checks against `npews-scoring` thresholds.

Phase 4:
- Integrate external profile validator into CI with pinned package versions.

## 16. Governance and change control

1. Any adapter mapping change requires fixture diff review.
2. Any scoring rule change requires explicit update to score conformance expectations.
3. Any new warning allow-list entry requires rationale in PR description.

## 17. Open decisions to close before full CI enforcement

1. Exact NHS Clinical Observations package/version to pin.
2. Treatment of draft-profile warnings (fail vs warn).
3. Canonical mapping for escalation labels when source uses profile-specific coding.
4. Whether to require sub-score parity in all fixtures or only where supplied.
