# Product and compliance boundary

Status: accepted 2026-08-06 (roadmap R7).

## Decision

Digital PEWS is a reusable NPEWS scoring and observation-chart component intended for integration into a wider clinical system. It is not an EPR, observation-entry workflow, clinical record store, alerting platform, reporting service, or complete SPOT/NPEWS solution.

The component implements and provides evidence for an explicitly traced subset of the national specifications. This repository must not independently be described as “National PEWS compliant” or as satisfying every SPOT/NPEWS Must requirement. A deployed, integrated solution may make its own compliance assessment only across all of its components, host-system behaviour, deployment controls, supplier obligations, and local requirements.

## Rationale

The national specifications define “the solution” as the complete set of integrated systems supplied to a Trust. Their scope includes clinical observation entry, EPR integration, longitudinal records, audit, reporting, training, support, commercial terms, security, regulatory status, disaster recovery, and service availability in addition to scoring and charting.

Attempting to deliver that whole scope in this repository would make the component less composable, duplicate EPR capabilities, and impede incremental delivery of a well-tested open implementation. The project therefore takes responsibility for a small clinical calculation and presentation surface with clear interfaces. Integrators remain responsible for the surrounding clinical workflow and operational system.

## Component responsibilities

The component is responsible for:

- Accepting a defined `Patient` and `Observation` data contract without owning the source record.
- Deriving the applicable age band deterministically from date of birth and observation time. Date of birth is required for assured clinical scoring; the existing `patient.ageBand` behaviour when DOB is absent is an unassured compatibility/display fallback, not a clinical override.
- Calculating NPEWS component scores and totals from the canonical national thresholds.
- Calculating the component-supported escalation result from supplied observations and trigger data, with unsupported trigger behaviour identified explicitly.
- Rendering the observation chart, scoring bands, values, trends, skips, modality changes, age-band boundaries, PEWS totals, and escalation presentation.
- Providing framework-neutral integration and data-conversion interfaces, including the FHIR adapter, without persisting or transmitting clinical records itself.
- Providing conformance, interaction, accessibility, and visual evidence for the requirements allocated to the component.

## Explicitly out of scope

This repository will not implement:

- Observation-entry forms or EPR clinical workflows.
- Patient registration, form creation, admission management, or clinical-record ownership.
- Authentication, authorisation, user identity, or clinician-session management.
- Persistence, autosave, amendment, deletion, audit history, retention, or subject-access functions.
- EPR write-back, messaging, paging, emergency-call dispatch, or acknowledgement tracking.
- Cross-organisation record transfer, statutory reporting, PDF legal-record export, or analytics submissions.
- Supplier training, helpdesk, commercial commitments, hosting, service availability, disaster recovery, or deployment accreditation.
- A claim that the repository alone is a complete or nationally compliant SPOT/NPEWS solution.

An embedding EPR may provide these capabilities. That does not move them into the component unless a later, explicit boundary decision demonstrates that a small reusable interface is required.

## Responsibility allocation

This is a capability-level boundary matrix, not the requirement-by-requirement traceability evidence planned under R9.

| Capability | Representative requirements | Allocation |
| --- | --- | --- |
| Numeric banding and scoring | `C1.2-C1.4`, `C5-C12`, `C17.1`, `C17.11` | Component. Canonical configuration, scorer, and independent test vectors provide the evidence. |
| Age-band determination and chart transition | `C2.2-C2.4` | Component uses deterministic calendar age and an explicit boundary. The alternate-form part of `C2.2` is deliberately excluded below. Form creation and workflow prompts belong to the host. |
| Observation-chart rendering | `U3.1-U3.14`, `C3.1-C3.5` | Component for supplied data and supported view windows. The host is responsible for retrieving the complete longitudinal record. |
| Exact values and clinical measure presentation | `U5-U15`, `C5-C15` | Shared. Component scores and renders supplied values; host captures, validates, identifies, and persists them. |
| Skipped observations | `U3.9-U3.10`, measure-specific UI requirements, `C3.17-C3.22` | Shared. Component shows skips, reasons supplied to it, and line breaks. Host captures coded/free-text reasons, persists them, applies workflow rules, and reports them. |
| Non-score triggers and escalation calculation | `U13-U17`, `C13-C17` | Shared. Component may calculate and display the highest indicated level with provenance under R10. Host captures clinician/carer input, permits explicit clinical action, records overrides and responses, and executes escalation workflows. |
| Clinical guidance | `U17.6-U17.9`, `U20.1`, `C20` | Component may present centrally governed guidance associated with its result. Host owns workflow placement, acknowledgement, action, and update governance. |
| Observation entry and form lifecycle | `U5-U17` input requirements, `C2.1`, `C3.6-C3.11` | Host/EPR. The component has no data-entry or persistence workflow. |
| Corrections, deletion, provenance, and audit | `C3.10`, `C4`, `C17.7-C17.9` | Host/EPR. The component renders the data and provenance it is supplied but does not author the clinical record. |
| EPR and cross-organisational interoperability | `C1.1`, `T6` | Host/integration layer. The component provides a bounded data contract and adapter, not an integration engine or record-transfer service. |
| Accessibility and responsive presentation | `U1.1`, `T4.11-T4.12` | Component for its own rendered surface; host for the complete workflow surrounding it. |
| Security, privacy, retention, hosting, and resilience | `T2`, `T3`, `T5`, `T7` | Deployment organisation and supplier. Component security remains in scope where its code or interfaces can create risk. |
| Training, support, updates, and commercial obligations | `T1`, `T4.1-T4.10` | Deployment organisation and supplier, not the component. |
| Medical-device and clinical-safety obligations | `T5.8` and applicable law/governance | Assessed for each intended deployment and supplier role. This repository does not claim that publishing the component satisfies them. |

## Deliberate non-conformance: alternate age-band selection (`C2.2`)

`C2.2` requires a complete solution to allow a clinician to select an adjacent age-band form when a patient is “on the border” between age brackets. This component will not provide that override.

Calendar age at an observation timestamp is deterministic, so there is no computational ambiguity for the component to resolve. Allowing manual band selection could make identical physiology produce a different PEWS score and escalation solely because a different form was chosen. It could also turn an age-band override into an opaque proxy for clinical intuition or organisational pressure.

Clinical concern should instead be recorded honestly and visibly through the clinical-intuition or specific-concern pathway, with trigger provenance and the highest resulting escalation level preserved. This is more auditable than changing the scoring frame to obtain a preferred total.

The component therefore:

- Selects the age band from exact calendar age for every observation.
- Changes band at the exact 1st, 5th, and 13th birthday boundaries.
- Shows an explicit boundary when a chart window spans a transition.
- Does not accept a host or clinician override of the scoring age band.
- Does not treat the DOB-absent `patient.ageBand` compatibility fallback as suitable for assured clinical use.
- Treats scientific policy at or near a boundary as an open clinical research and governance question under R46, without making the score manipulable in the meantime.

This is a deliberate non-conformance with one Must requirement of the complete-solution specification. It must appear in future traceability and procurement responses, and it is another reason this repository cannot claim complete National PEWS compliance.

## Permitted claims

Acceptable descriptions include:

- “An open-source NPEWS scoring and observation-chart component.”
- “Implements the traced NPEWS scoring and chart-rendering requirements listed in this repository.”
- “Intended for integration into a wider clinical system.”

Do not describe this repository by itself as:

- “A complete SPOT/NPEWS solution.”
- “National PEWS compliant.”
- “An EPR-integrated observation and escalation workflow.”

## Change control

Boundary changes require an explicit decision in `decisions.md`. Features must not be added merely because they appear as a Must in the complete-solution specification. R9 will allocate individual requirements to the component, host, deployment, supplier, deliberate exclusion, or a documented gap.
