# Clinical Safety - Digital PEWS

> Status: draft, initial hazard identification. This file supports clinical safety work but is not evidence that the component is approved, compliant, or safe for clinical deployment.

## Summary

| Field | Value |
| --- | --- |
| Product | Digital PEWS NPEWS scoring and observation-chart component |
| Repository | <https://github.com/rcpch/digital-pews> |
| Configuration item | Current source on the default branch; no clinically approved release has been designated |
| Intended use | Calculate NPEWS scores from supplied patient and observation data and render the corresponding observation chart for integration into a governed clinical system |
| Excluded use | Observation entry, EPR records, persistence, audit, operational alerting, reporting, autonomous diagnosis, or use as a complete SPOT/NPEWS solution |
| Intended users | Clinical-system integrators and suppliers; clinicians may view the component only within a locally governed deployment |
| Use environment | Embedded within an EPR or other governed clinical application on supported desktop or mobile browsers |
| Safety documentation owner | RCPCH Digital PEWS project maintainers, <pews@rcpch.ac.uk> |
| Clinical Safety Officer | Not yet appointed or recorded for this component; required before clinical deployment |
| Safety status | Prototype evidence under development; not approved for direct clinical use |
| Last reviewed | Not yet clinically reviewed; initial draft created 2026-08-06 |

## Product boundary

The authoritative [product and compliance boundary](spec/product-boundary.md) limits this repository to a composable scoring and charting component. The host clinical system owns data entry, patient identity, validation, persistence, provenance, audit, user access, alerts, acknowledgement, reporting, and operational clinical workflow.

This repository does not independently claim complete National PEWS compliance. A deployer must assess the integrated system, transferred controls, local workflow, and residual risks. The public demonstration uses synthetic data and is not a clinical service.

## Current safety position

The component has automated evidence for canonical scoring-configuration freshness, selected source-derived scoring behaviour, exact calendar age-band transitions, and FHIR score conformance. Important safety evidence remains incomplete:

- Non-score escalation triggers are documented but not fully implemented in the scorer.
- Browser interaction and deterministic Canvas visual-regression tests have not been established.
- Component lifecycle limitations can leave controls or renderer state unreliable after data reassignment, reconnection, or multiple instances.
- Missing or malformed required data is not yet covered by a complete validation and failure-presentation contract.
- The `patient.ageBand` fallback used without DOB is not suitable for assured clinical scoring.
- The FHIR adapter uses interim repository-local codes where national canonical codes remain unresolved.
- No formal hazard workshop, agreed risk-scoring method, residual-risk acceptance, DCB0129 safety case, or regulatory assessment has been completed.

There is therefore no approved clinical release. The component must not be used for direct patient care without supplier and deployer clinical-safety assessment, completion of applicable controls, and explicit release approval.

## Safety roles

| Role | Applies? | Organisation/person | Evidence and notes |
| --- | ---: | --- | --- |
| Component maintainer | Yes | RCPCH Digital PEWS project maintainers | Own source, tests, documentation, issue triage, and communication of known limitations through this repository |
| Safety documentation owner | Yes | RCPCH Digital PEWS project maintainers, <pews@rcpch.ac.uk> | Maintains this file pending formal governance arrangements |
| Clinical Safety Officer | Required before clinical deployment | Not yet appointed or recorded | Must review the intended purpose, hazard analysis, controls, residual risks, and release evidence |
| Manufacturer / supplier | Deployment-specific | Not determined by this repository | Must determine its role, applicable DCB0129 and medical-device obligations, and provide deployment evidence |
| Deployer / healthcare organisation | Deployment-specific | Integrating Trust or care organisation | Owns DCB0160 activities, local workflow, transferred controls, training, deployment, monitoring, and incident response |
| Operator | Outside component scope | Host clinical service | Uses the integrated clinical system, not this source repository directly |
| Relevant IT provider | Deployment-specific | Host EPR and infrastructure providers | Must be identified and assessed by the supplier and deployer |

## Applicable assurance domains

| Domain | Standard or source | Current position | Evidence / owner |
| --- | --- | --- | --- |
| National NPEWS requirements | NHS SPOT/NPEWS UI and clinical/technical specifications | Selected scoring and charting requirements apply; complete-solution compliance is expressly not claimed | [`spec/product-boundary.md`](spec/product-boundary.md); individual traceability planned under R9 |
| Clinical risk management during manufacture | DCB0129 | Applicability and accountable manufacturer require formal determination before clinical release; no safety case has been approved | Future appointed CSO and manufacturer/supplier |
| Clinical risk management during deployment | DCB0160 | Applies to each integrating healthcare organisation and cannot be discharged by this repository | Deployer CSO and local safety case |
| Medical-device regulation | UK MDR and current applicable guidance | Intended-purpose and classification assessment not completed | Supplier regulatory owner with clinical-safety input |
| Accessibility | WCAG 2.2 AA and NPEWS colour-blindness requirements | Partial; formal browser evidence and an evidenced colour-blindness approach remain open | R14-R18 and [`spec/visual-regression-testing-plan.md`](spec/visual-regression-testing-plan.md) |
| Information security | Secure development and deployment controls | Repository vulnerability reporting exists; deployment security is outside the component | [`SECURITY.md`](SECURITY.md), supplier, and deployer |
| Data protection and records management | UK GDPR, DPA 2018, local information governance | Component does not persist records; host handling of patient data requires local assessment | [`spec/product-boundary.md`](spec/product-boundary.md) and deployer evidence |

## Assumptions and transferred controls

The component safety argument depends on the integrating system satisfying these controls:

| ID | Required host/deployer control | Responsible party | Verification required before use |
| --- | --- | --- | --- |
| TC-001 | Supply the correct patient, date of birth, observation timestamps, units, values, coded categories, skip reasons, and trigger data with validated provenance | Host/EPR integrator | Contract tests and local end-to-end clinical validation |
| TC-002 | Use DOB for assured age-band scoring and do not expose `patient.ageBand` as a clinician-selectable scoring override | Host/EPR integrator | Integration configuration and boundary tests |
| TC-003 | Preserve source observations and component results in the clinical record with author, timestamps, amendments, and audit history | Host/EPR and deployer | Local record and audit testing |
| TC-004 | Implement clinical-intuition, carer-concern, specific-concern, sepsis, AVPU, and other escalation workflows not supplied by the component, including acknowledgement and action | Host/EPR and deployer | Local workflow simulation and clinical sign-off |
| TC-005 | Treat component output as decision support, preserve clinician ability to escalate independently, and never use a low score to prevent escalation | Deployer clinical governance | Training, workflow design, and usability testing |
| TC-006 | Provide authentication, authorisation, availability, downtime procedures, monitoring, support, and incident response | Supplier and deployer | Operational readiness and DCB0160 evidence |
| TC-007 | Validate the integrated display on supported browsers, devices, zoom levels, fonts, themes, and EPR chrome without altering mandated clinical semantics | Supplier and deployer | Approved visual and accessibility test evidence |
| TC-008 | Review component updates, known limitations, changed clinical behaviour, and residual risks before promoting a new version | Supplier and deployer | Controlled release and configuration records |

## Initial hazard log

Risk ratings are deliberately not assigned yet. Severity, likelihood, acceptability criteria, and residual-risk approval require an agreed method and review by a competent Clinical Safety Officer. `Open` means further controls or evidence are required; `Controlled, unreviewed` means controls exist but have not received formal CSO effectiveness review.

| ID | Hazardous condition | Foreseeable causes | Potential clinical harm | Existing and planned controls | Owner | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| H-001 | The component displays an incorrect PEWS component score or total | Incorrect threshold, stale generated configuration, scoring defect, unsupported input, or unit mismatch | Inappropriate escalation level, delayed review, unnecessary escalation, or loss of trust in the chart | Canonical JSON source; generated artifacts; freshness and scoring tests; source-derived vectors to expand under R11; host input control `TC-001` | Component maintainer | Controlled, unreviewed | [`spec/npews-scoring-spec.json`](spec/npews-scoring-spec.json), [`test/scoring/generated-artifacts-current.test.js`](test/scoring/generated-artifacts-current.test.js), [`test/fhir/score-conformance.test.js`](test/fhir/score-conformance.test.js) |
| H-002 | An observation is scored against the wrong age band | Incorrect/missing DOB, timestamp error, use of the unassured `patient.ageBand` fallback, boundary arithmetic defect, or discretionary band override in the host | PEWS under- or over-scoring near age thresholds and inappropriate escalation | Exact calendar arithmetic; birthday-boundary tests; no clinician band override; explicit chart boundary; `TC-001` and `TC-002`; open boundary-policy work under R46 | Component maintainer and integrator | Controlled, unreviewed | [`chart/age-band.js`](chart/age-band.js), [`test/scoring/age-band.test.js`](test/scoring/age-band.test.js), [`spec/product-boundary.md`](spec/product-boundary.md) |
| H-003 | The displayed escalation level is lower than the clinically indicated level | Scorer currently uses numeric total without fully applying carer concern, clinical intuition, specific concern, AVPU change, temperature, or sepsis triggers | Delayed senior review, treatment, or emergency response | Known limitation displayed in this safety status; R10 to implement or exclude triggers with provenance and highest-level selection; host controls `TC-004` and `TC-005` | Component maintainer and integrator | Open | [`spec/escalation.md`](spec/escalation.md), [`chart/npews-scorer.js`](chart/npews-scorer.js), roadmap R10 |
| H-004 | The chart visually implies a false trend or misrepresents a value | Line drawn over a skipped observation, line joining incompatible oxygen modalities, inaccurate Canvas geometry, overlapping UI, incorrect colour, or responsive-layout defect | Clinician misinterprets deterioration, recovery, or severity | Skip and modality line breaks in renderer; exact plotted positions; mandated tokens; manual visual checks; browser and visual regression controls planned under R15-R19 | Component maintainer | Open | [`chart/chart.js`](chart/chart.js), [`spec/implementation-notes.md`](spec/implementation-notes.md), [`spec/visual-regression-testing-plan.md`](spec/visual-regression-testing-plan.md) |
| H-005 | The chart presents stale or internally inconsistent patient state | Zoom affects latest status, data reassignment does not rebind controls, reconnect retains stale listeners/state, or multiple components share global DOM/state | Clinician acts on old observations or mismatched score, chart, and patient identity | Latest-score invariant implemented; one-instance warning; lifecycle and browser work planned under R13, R15, and R25-R27; `TC-007` | Component maintainer and integrator | Open | [`spec/implementation-notes.md`](spec/implementation-notes.md), [`spec/web-component-phase2-spec.md`](spec/web-component-phase2-spec.md) |
| H-006 | Missing, malformed, or unsupported data appears normal or is silently omitted | Null/invalid values, unknown category/device code, missing required fields, unsupported unit, or host mapping failure | False reassurance, incomplete score, hidden deterioration, or inability to interpret the chart | Defined data model; skip-reason support; FHIR and scorer tests; malformed-input browser tests planned under R15; `TC-001`; explicit validation/failure contract still required | Component maintainer and integrator | Open | [`spec/data-model.md`](spec/data-model.md), [`spec/fhir.md`](spec/fhir.md), roadmap R15 |
| H-007 | FHIR conversion changes, loses, duplicates, or miscoded clinical information | Incorrect resource mapping, interim local codes, round-trip defect, unsupported source profile, or stored score trusted without recomputation | Incorrect chart, score, provenance, or transferred clinical record | Pure adapter separated from scoring; conformance fixtures; score recomputation tests; reverse round-trip and coding work under R37-R38; `TC-001` | Component maintainer and integrator | Open | [`spec/fhir.md`](spec/fhir.md), [`test/fhir/conformance-harness.test.js`](test/fhir/conformance-harness.test.js), [`test/fhir/score-conformance.test.js`](test/fhir/score-conformance.test.js) |
| H-008 | Colour, labels, or interaction make clinical state inaccessible or ambiguous | Colour-only distinction, insufficient contrast, small text/targets, unavailable exact values, keyboard failure, or host styling interference | Missed score band, observation, escalation, or action by a user with visual, motor, or cognitive access needs | Text/symbol redundancy in parts of the chart; exact-value interaction; fixed clinical palette; accessibility and browser evidence planned under R14-R18; `TC-007` | Component maintainer and integrator | Open | [`spec/implementation-notes.md`](spec/implementation-notes.md), [`spec/visual-regression-testing-plan.md`](spec/visual-regression-testing-plan.md) |
| H-009 | An integrator or user treats the component as a complete clinical workflow or compliant solution | Scope misunderstood, demo used clinically, missing host controls, alerts assumed to have been dispatched, or output treated as autonomous advice | Escalation not actioned, record not persisted, missing audit trail, or unsafe reliance on incomplete behaviour | Explicit product boundary and permitted claims; README warning; synthetic demo; transferred controls `TC-003-TC-008`; deployment safety assessment required | Component maintainer, supplier, and deployer | Controlled, unreviewed | [`spec/product-boundary.md`](spec/product-boundary.md), [`README.md`](README.md), this file |

## Safety controls and evidence

| Control ID | Control | State | Linked hazards | Evidence |
| --- | --- | --- | --- | --- |
| SC-001 | Keep numeric scoring thresholds in one canonical JSON source and generate runtime/human-readable artifacts | Implemented | H-001 | [`spec/npews-scoring-spec.json`](spec/npews-scoring-spec.json), [`scripts/generate-scoring.mjs`](scripts/generate-scoring.mjs) |
| SC-002 | Fail tests when generated scoring artifacts drift or selected scoring behaviours disagree with expected results | Implemented, coverage incomplete | H-001 | [`test/scoring/generated-artifacts-current.test.js`](test/scoring/generated-artifacts-current.test.js), [`test/scoring/config-matches-spec.test.js`](test/scoring/config-matches-spec.test.js), [`test/fhir/score-conformance.test.js`](test/fhir/score-conformance.test.js) |
| SC-003 | Derive age band from exact calendar DOB at each observation and test birthday boundaries | Implemented | H-002 | [`chart/age-band.js`](chart/age-band.js), [`test/scoring/age-band.test.js`](test/scoring/age-band.test.js) |
| SC-004 | Prevent discretionary scoring-band selection and visibly delineate birthday transitions | Implemented, policy review open | H-002 | [`spec/product-boundary.md`](spec/product-boundary.md), [`spec/decisions.md`](spec/decisions.md), roadmap R46 |
| SC-005 | Break trend lines for skipped values and oxygen-delivery modality changes | Implemented, browser evidence incomplete | H-004 | [`chart/chart.js`](chart/chart.js), requirements `U3.10` and `C9.6` |
| SC-006 | Keep latest PEWS and escalation presentation independent of the zoomed view | Implemented, browser evidence incomplete | H-005 | [`spec/implementation-notes.md`](spec/implementation-notes.md), [`chart/chart.js`](chart/chart.js) |
| SC-007 | Separate FHIR transformation from scoring and recompute scores for conformance tests | Implemented, coding/round-trip scope incomplete | H-001, H-007 | [`spec/fhir.md`](spec/fhir.md), [`test/fhir/score-conformance.test.js`](test/fhir/score-conformance.test.js) |
| SC-008 | Document the component boundary, known limitations, permitted claims, and transferred controls | Implemented, unreviewed | H-003, H-005-H-009 | [`spec/product-boundary.md`](spec/product-boundary.md), this file |
| SC-009 | Apply every supported non-score trigger, retain provenance, and choose the highest indicated escalation | Planned | H-003 | Roadmap R10 and [`spec/escalation.md`](spec/escalation.md) |
| SC-010 | Add deterministic browser interaction, accessibility, and visual-regression evidence | Planned | H-004-H-006, H-008 | Roadmap R14-R19 and [`spec/visual-regression-testing-plan.md`](spec/visual-regression-testing-plan.md) |
| SC-011 | Define validation and explicit failure behaviour for malformed or incomplete required input | Planned | H-001, H-002, H-006 | Roadmap R15; detailed acceptance criteria still required |
| SC-012 | Isolate component state and lifecycle so reassignment, reconnection, and multiple instances cannot cross-contaminate | Planned | H-005 | Roadmap R13 and R25-R27 |

## Safety change and release expectations

- A change to scoring, age-band selection, escalation, clinical colours, plotted geometry, line continuity, data mapping, or safety-relevant options must update the relevant specification, tests, and hazard/control evidence in the same change.
- Generated scoring artifacts must remain current and all automated tests must pass.
- Intentional visual changes require comparison with the authoritative NHS reference and explicit human review; regenerating a baseline is not approval by itself.
- Known limitations and transferred controls must accompany any component release or integration handover.
- No version may be designated for clinical deployment until a competent CSO has reviewed the intended use, hazard analysis, control effectiveness, residual risks, and release evidence.
- Deployment approval and local residual-risk acceptance remain the responsibility of the integrating healthcare organisation under its own governance.

## Incident and concern reporting

Report suspected patient-safety defects privately to <pews@rcpch.ac.uk>. Do not include patient-identifiable data. Security vulnerabilities should follow [`SECURITY.md`](SECURITY.md); a security issue with possible clinical impact must also be treated as a safety hazard.

For each confirmed safety incident or near miss, the maintainers must preserve the report, assess immediate containment, link or add the relevant hazard, identify affected versions, record corrective actions and evidence, and communicate residual risk to known integrators where possible.

## Open safety actions

- Appoint and record a competent Clinical Safety Officer before clinical deployment.
- Agree the risk-scoring and acceptability method, then clinically review and rate every hazard.
- Determine manufacturer/supplier roles and the applicability of DCB0129 and medical-device regulation for the intended release model.
- Complete R9 requirement allocation and traceability.
- Complete controls planned under R10-R19 and R25-R27 where required for the intended release.
- Run a multidisciplinary hazard workshop and decide whether to create a Tier 2 `HAZARD-LOG.md`, `SAFETY-CASE.md`, and `SAFETY-PLAN.md` file set.
- Define release configuration identification, safety sign-off, review cadence, and residual-risk communication.

## Review log

| Date | Reviewer | Scope | Outcome | Follow-up |
| --- | --- | --- | --- | --- |
| 2026-08-06 | Unreviewed working draft | Initial component boundary, known limitations, preliminary hazards, controls, and transferred responsibilities | Draft created; no maintainer or clinical safety approval and no residual-risk acceptance claimed | Maintainer review, formal CSO appointment, hazard workshop, risk assessment, and Tier 2 decision required before clinical deployment |
