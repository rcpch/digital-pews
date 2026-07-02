# FHIR research notes for digital-pews

Date: 2026-04-21
Status: working notes for local design and adapter planning

## Research question

How confident are we that the current FHIR chart adapter spec is correct, and has PEWS already been modelled in FHIR?

## Sources reviewed

1. NHS England / NHS Digital API catalogue

- <https://digital.nhs.uk/developer/api-catalogue>
- Outcome: no clearly discoverable PEWS-specific production API entry from this route.

1. Simplifier project search

- <https://simplifier.net/search?term=PEWS&scope=UK>
- Outcome: surfaced relevant UK discovery/draft artifacts including Clinical Observations and a separate PEWS logical model page.

1. NHS Digital Clinical Observations IG (R4)

- <https://simplifier.net/clinicalobservations>
- <https://simplifier.net/guide/clinicalobservations>
- Key status text: draft/discovery guidance under active development.

1. Clinical Observations examples page/toc

- <https://simplifier.net/guide/clinicalobservations/home-examples-toc>
- Outcome: includes PEWS and NPEWS1 examples, including bundle examples and score examples.

1. Example pages found in the Clinical Observations guide

- <https://simplifier.net/guide/clinicalobservations/PEWSTotalScoreWithObservationsBundleExample>
- <https://simplifier.net/guide/clinicalobservations/BaselineNPEWS1ObservationExample>
- <https://simplifier.net/guide/clinicalobservations/NPEWS1WithSubScoresObservationExample>
- <https://simplifier.net/guide/clinicalobservations/ScoreChartUsedExample>
- <https://simplifier.net/guide/clinicalobservations/RespiratoryDistressObservationExample>

1. Separate PEWS logical model page (non-NHS formal profile set)

- <https://simplifier.net/ckmfhirlogicalmodel/pews-originalvariables>
- Outcome: appears to be a draft logical model artifact, useful for ideas but not authoritative for implementation.

## Findings

1. PEWS has been modelled in FHIR contexts already.

- There is NHS Digital/NHS England Clinical Observations work in FHIR R4 that explicitly includes early warning score patterns and PEWS examples.
- There are example artifacts for PEWS total score bundles and NPEWS1 observations with sub-scores.

1. The national-state signal is still draft/discovery.

- The Clinical Observations guide indicates active development and draft/discovery state.
- It should be treated as a strong directional reference, not a final stable national conformance target.

1. The existing local adapter spec direction is broadly sound.

- Bundle-oriented event exchange, Observation-centric vitals, and separate score semantics are aligned with the direction of the Clinical Observations content.
- Existing local assumptions about using standard Observation patterns and absent-data handling are compatible with mainstream FHIR design.

1. Important nuance for scoring representation.

- The Clinical Observations examples indicate sub-score representation patterns that should be reviewed against local `triggerCodes` and score decomposition assumptions.
- Local model fields should remain flexible enough to map to component-based score details.

## Confidence rating

- Confidence that PEWS has prior FHIR modelling work: high.
- Confidence that there is a fully stable, nationally fixed PEWS implementation profile set ready for strict conformance: medium-low.
- Confidence that our current adapter design approach is directionally correct: medium-high.

## Implications for this repository

1. Keep the local canonical model and adapter boundary.

- The local chart model remains useful and should not be forced to mirror raw FHIR resources.

1. Treat Clinical Observations as the primary external reference.

- Use it to guide coding systems, score decomposition shape, and example payload design.

1. Preserve local flexibility in unresolved areas.

- Keep extension-friendly handling for PEWS-specific semantics where national guidance remains draft.

1. Add explicit test strategy for score consistency.

- Continue carrying expected scores in test fixtures as assertions.
- Validate that recomputed score totals and sub-scores match expected values for each age band.

## Suggested next steps

1. In `spec/fhir.md` (future-work appendix), keep explicit references to the Clinical Observations IG and caveat text about draft/discovery status.
2. In `spec/fhir.md`, add a short compatibility note on score component mapping from NPEWS1 examples.
3. Add adapter conformance tests that compare chart-model score fields against known PEWS/NPEWS fixture expectations.
4. Keep this file as the running research log until a consolidated `docs/` structure is introduced.

## Future documentation structure (proposed)

When moving to a docs site, consider this information architecture:

- docs/spec/
  - local architecture and adapter contracts
- docs/reference/
  - external standards summaries and links (including FHIR research)
- docs/research/
  - exploratory notes, option analysis, unresolved decisions
- docs/how-to/
  - practical guides for developers and clinical reviewers

This note can migrate to `docs/reference/fhir-research.md` when docs are consolidated.
