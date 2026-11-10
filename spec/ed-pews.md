# Emergency department PEWS

Status: source intake and preliminary assessment, 10 November 2026. No ED profile is implemented or clinically approved. The current digital chart remains based on the existing inpatient references.

## Authoritative sources and scope

The four public NHS England ED charts with GCS are stored alongside the original inpatient PDFs. The [source register](../reference-sources/README.md) records exact URLs, publication labels and SHA-256 hashes. NHS England identifies this GCS/neurological-assessment version as the default ED chart. Other variants are available through SPOT NHS Futures and must not be treated as interchangeable without review.

The new sources meet D16's requirement for evidence of distinct ED semantics, but do not establish that the existing inpatient algorithm can be reused unchanged. This work remains within the [component-only boundary](product-boundary.md): scoring and charting, not triage workflow, observation entry, record storage or operational escalation.

## Preliminary findings

Text was extracted from both pages of all four ED PDFs. Page 1 of the 5-to-12-year chart was also visually inspected. These findings are not a completed threshold-by-threshold comparison or clinical sign-off.

| Source evidence | Implication for the digital component |
| --- | --- |
| Page 1 distinguishes “Triage, assessment and initial observations” from “Ongoing observations”. In the inspected 5-to-12-year chart, initial and ongoing BP presentation differs. | Compare phase-specific scoring and display explicitly. Do not assume one ruleset with different time windows is sufficient. |
| All four charts retain a BP row and explicitly describe non-measurement codes: Not Attempted (No Concern), printed `NCO`, scores 0; Unsuccessful Attempt (No Concern), `U0`, scores 0; Unsuccessful Attempt (Concern), `U4`, scores 4; Not Attempted (Concern) scores 4, with no code printed in that list. | These charts do not simply omit BP. Verify the digital coding and phase applicability before implementing. Do not infer no concern from a missing value or invent a code for the fourth case. |
| Initial carer question asks about change since the decision to attend; the ongoing question asks about change since the previous assessment. | Preserve clinical meaning in host inputs and explanatory labels; do not infer the assessment phase from observation order. |
| Page 1 says “If V or less do GCS”; page 2 includes GCS components/total, pupils, limb movement and other neurological observations. | Define the supported display/data scope and escalation mapping from authoritative rules. Do not invent a GCS-to-PEWS conversion or assume the existing pupil model covers the whole neurological chart. |
| Page 2 includes ED escalation records and team-contact timings. | Trace applicable calculation/presentation rules, while leaving contact, acknowledgement and clinical-record workflows to the host. |

## Implementation sequence and acceptance gates

1. Obtain the current draft digital specification from SPOT NHS Futures through an authorised user. Record its version, date, source and any redistribution restrictions. Obtain additional chart variants only if they are within the agreed implementation scope.
2. Compare all four ED age bands, both assessment phases, scoring bands, oxygen/support rules, BP derogations, concern triggers, escalation thresholds and neurological requirements against the current canonical JSON and source specifications. Record page/section evidence and unresolved conflicts. Separately assess the newly published inpatient PDFs without replacing the existing baseline.
3. Agree an explicit clinical-profile and assessment-phase contract. Prefer shared age-band, plotting and scoring primitives with source-backed profile configuration over a copied ED renderer. Clinical profile selection is not a cosmetic presentation option and must not be inferred from missing BP, an ED location string or a short time window. Existing integrations must preserve inpatient behaviour.
4. Add independent source-derived expected results for every age band and applicable phase, covering threshold edges, all BP derogations, missing versus explicitly not measured values, oxygen devices, non-score triggers and ED-to-inpatient transitions. Missing input must not silently become a zero score.
5. Implement the bounded ED profile with synthetic demonstration scenarios, visible profile/phase identification and visual comparison against the corresponding NHS chart. Verify skip-line breaks, age transitions and inpatient regression behaviour.
6. Update requirements traceability and the safety file, particularly H-001 (incorrect score), H-003 (escalation), H-004 (misleading chart), H-006 (missing data) and H-009 (scope misunderstanding). Clinical review and the existing formal release gates remain required.

R53 remains open: the newly published BP derogations are evidence to resolve the ED policy question, not permission to rescale inpatient scores or silently score unavailable BP as normal. No canonical thresholds, colours, scorer behaviour or public API have changed during source intake.

## Documentation

Use [`docs/index.md`](../docs/index.md) as the reader-facing documentation entry point and `spec/` as the durable design record. Keep the source register in `reference-sources/`; do not duplicate clinical rules in the demo or a future docs site. Roadmap R63-R66 track source intake, specification reconciliation, implementation and the Zensical site.
