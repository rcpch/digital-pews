# Roadmap

Last reviewed: 2026-08-06 following NHSE child-health representative feedback on 2026-08-05 and review against the current implementation and test suite.

Legend: `[~]` implemented but unverified or partially complete, `[ ]` not started. Completed items are removed from this forward-looking roadmap; item codes are stable and must not be renumbered when priorities change.

Clinical correctness, safety evidence, and conformance take precedence over packaging and presentation work.

## Current Baseline

- [~] **R3 - Render the observation chart.** Proportional time spacing, skipped-observation line breaks, oxygen-modality line breaks, birthday crossing, PEWS totals, escalation banners, and responsive layouts are implemented but lack browser and Canvas regression tests.
- [~] **R4 - Provide the Phase 1 Web Component.** The light-DOM `<npews-chart>` element accepts `{ patient, observations }`, but remains limited to one chart per document and has lifecycle gaps when data is reassigned.
- [~] **R5 - Maintain clinical review scenarios.** All four age bands, birthday crossing, rapid deterioration, recovery, non-hour observation times, skipped values, and oxygen-modality changes appear in the demo, but the scenarios are not automated browser fixtures.
- [~] **R6 - Maintain the FHIR adapter.** Bidirectional conversion and current conformance fixtures are tested, but reverse round-trip cases, national coding decisions, and strict profile validation remain open.

## P0 - Clinical Safety And Conformance

- [ ] **R9 - Add requirements traceability.** Extend the capability allocation in [`product-boundary.md`](./product-boundary.md) into an individual requirement matrix mapping applicable `U*`, `C*`, and `T*` requirements to the component, host, deployment, supplier, deliberate exclusion, implementation, tests, and clinical review without changing the authoritative source transcriptions.
- [~] **R10 - Implement or explicitly exclude non-score escalation triggers.** Explicit host-supplied `CI`, `CQ`, and `SC` trigger levels now retain provenance and participate in highest-level selection, with Clinical Intuition and Carer Question controls in the demo. Resolve automatic AVPU change, temperature/sepsis and specific-concern derivation, raw-response semantics, trigger reason display across every chart surface, and clinical review against `escalation.md` and the national requirements.
- [ ] **R11 - Expand source-derived scorer vectors.** Exercise every age band and threshold boundary using cases independently derived from the canonical specification, not only generated-config equality.
- [ ] **R12 - Add general CI.** Run installation from the lockfile, the complete test suite, scoring-generation checks, licence checks, and workflow security checks on pull requests and `main` before adding release automation.
- [ ] **R46 - Define clinical policy at age-band boundaries.** Preserve the current deterministic switch and explicit divider at the 1st, 5th, and 13th birthdays, without the `C2.2` alternate-form override excluded by the product boundary. Document that the scientifically preferred treatment at or near a boundary remains an open research question and a matter for senior clinical discretion, including the current behaviour, hazard implications, research question, and governance route before presenting it as settled clinical policy.
- [ ] **R52 - Complete formal clinical safety assurance before clinical release.** Appoint a competent Clinical Safety Officer, determine manufacturer/supplier and regulatory roles, agree a risk-scoring method, conduct a multidisciplinary hazard workshop, review control effectiveness, accept or transfer residual risks, define release safety gates, and create the Tier 2 hazard log, safety case, and safety plan required by the resulting governance assessment. The current draft position and initial hazards are recorded in [`../SAFETY.md`](../SAFETY.md).

## P1 - Browser And Visual Safety Evidence

- [ ] **R14 - Establish accessible rendering.** Ensure Canvas colour lookup reads from the effective component scope and that rendering meets WCAG 2.2 AA contrast and target-size requirements; add an automated browser assertion.
- [ ] **R15 - Add browser interaction tests.** Cover initial render, repeated `.data` assignment, scenario switching, connect/disconnect cycles, controls, layout locking, empty input, malformed input, keyboard use, and 200% zoom.
- [ ] **R16 - Establish deterministic visual regression testing.** Add Playwright with controlled fonts, timezone, data, viewport, and device scale, without requiring Storybook or a hosted visual-testing service; see the [Visual Regression Testing Plan](./visual-regression-testing-plan.md).
- [ ] **R17 - Approve the visual baseline matrix.** Capture all age bands, landscape/portrait/mobile layouts, supported themes, birthday crossing, skipped values, and oxygen-modality changes against the NHS reference chart.
- [ ] **R18 - Add visual CI and change governance.** Run browser tests on pull requests and document who approves intentional clinical visual changes and baseline updates.
- [ ] **R19 - Reuse scenarios as automated fixtures.** Import the scenario catalogue into browser and regression checks instead of maintaining separate test data.
- [~] **R40 - Make the local development experience reliable.** `s/up` serves the current demo, but a clean checkout must have one documented setup path, reproducible locked serving dependencies, useful startup errors, automatic browser opening, and a straightforward way to run tests and scoring-generation checks.
- [~] **R41 - Complete the clinical UI quality pass.** Preserve fidelity to the NHS chart while making the interface coherent, readable, responsive, accessible, and professionally finished across realistic patient data, supported themes, and mobile/tablet/desktop layouts; verify through human review and R15-R18 rather than subjective polish alone.
- [ ] **R47 - Increase parameter-heading legibility.** Raise chart parameter headings such as “Blood Pressure” from 14pt Lato to 16pt or 18pt where space permits, then verify wrapping, row height, truncation, and readability across every supported layout and at 200% zoom.
- [ ] **R48 - Replace the decorative age-band strip with a chart identifier.** Show the deterministically selected chart identifier (for example, `0-11m`) in large black text at the right of the toolbar containing the time-window selectors, and remove the coloured top strip once requirements traceability confirms it is not required. Define what the identifier shows when the displayed admission crosses an age-band boundary, and cover both ordinary and birthday-crossing cases in browser tests.
- [ ] **R49 - Refine blood-pressure markers.** Rework the current blocky endpoint triangles into smaller, lighter standard inward- or outward-pointing arrow marks while retaining the exact systolic and diastolic positions and their joining vertical line required by the UI specification. Compare against the NHS reference chart and approve the result through visual regression review.
- [ ] **R50 - Verify exact reference-chart colours.** Sample and document the authoritative PDF shades, compare them with the existing clinical colour tokens, and retain the exact reference shades unless NHSE-approved screen-colour research establishes a replacement standard. Treat any token change as a clinically governed visual-baseline change and assess display-profile limitations separately from print intent.

## P2 - Component API And Configuration

- [ ] **R20 - Decide which clinical configuration may be overridden.** Age-band bounds and scoring thresholds are already data-driven internally; arbitrary host overrides require an explicit clinical-governance decision and canonical defaults must remain authoritative.
- [~] **R21 - Centralise escalation configuration.** Presentation metadata is centralised, but score boundaries and non-score trigger policy are not yet represented by one canonical runtime structure.
- [~] **R22 - Complete respiratory-support handling.** Known support codes are scored; configurable additions, national-code governance, and clinically useful device-change display remain incomplete.
- [ ] **R23 - Define typed presentation options.** Keep options separate from `Patient` and `Observation`, covering initial layout, show-values state, and initial time window.
- [ ] **R24 - Define branding and explanatory-content extension points.** Separate demo-owner branding, embedding-organisation branding, NHS identity approval, and host-supplied helper text.
- [ ] **R51 - Make the demographics bar optional.** Add an explicit presentation option that shows or hides the patient-identification header without inferring presentation state from missing demographic data, so an EPR that already identifies the patient can avoid duplication. Add a “Show demographics bar” checkbox to the demo controls, preserve the default standalone behaviour, and test both states across supported layouts.

## P3 - Web Component Phase 2

- [ ] **R25 - Add Shadow DOM isolation.** Scope rendering, styles, DOM lookup, and custom-property reads to the component root.
- [ ] **R26 - Support multiple simultaneous instances.** Replace fixed ids and module-global renderer/view state with per-instance state.
- [ ] **R27 - Complete component lifecycle cleanup.** Bind and release resize and control listeners per instance, preserving state deliberately across updates.
- [ ] **R28 - Publish generated consumer types.** Provide consistent `PatientObject` and `ObservationObject` JSDoc and `.d.ts` declarations.

See the [Web Component Phase 2 Specification](./web-component-phase2-spec.md) for the detailed implementation plan.

## P4 - Distribution

- [ ] **R29 - Prepare publishable package metadata and exports.** Remove private-only packaging once the API is ready and define supported entry points.
- [ ] **R30 - Add a distribution-only ESM and browser bundle.** Keep `chart/` runnable as unbuilt native modules while producing package/CDN artifacts separately.
- [ ] **R31 - Generate Subresource Integrity metadata.** Produce and document SHA-384 integrity values for browser artifacts.
- [ ] **R32 - Test real package consumers.** Verify package and CDN use from plain HTML and representative framework wrappers before release.
- [ ] **R33 - Define the release process and support policy.** Document versioning, artifact provenance, CDN URLs, compatibility, and deprecation expectations.

## P5 - Clinical Review Tooling And Interoperability

- [ ] **R34 - Show raw inputs and computed results together.** Add a review table beside the demo chart for observation values, skipped reasons, component scores, total PEWS, escalation level, and trigger provenance.
- [ ] **R35 - Add side-by-side age-band comparison.** Provide a clinical review view for comparing threshold and rendering differences without implying that users choose an age band manually.
- [~] **R36 - Complete named edge-case scenarios.** Add dedicated skipped-observation and oxygen-transition cases with browser assertions, and define the required missing-data patterns before implementing them.
- [ ] **R37 - Complete FHIR reverse round-trip coverage.** Resolve the outstanding `FHIR -> chart -> FHIR` cases for resources, scores, modality changes, and skip reasons.
- [ ] **R38 - Resolve FHIR coding and validation scope.** Determine how EPR and FHIR models represent Clinical Intuition, Carer Question responses, Specific Concern, selected escalation level, and trigger provenance; decide canonical national codes for these and the existing PEWS fields, then add strict FHIR R4 and UK Core validation where required.
- [ ] **R39 - Add SMART-on-FHIR conformance coverage.** Test the adapter and component contract in a representative SMART host after the component API is stable.
- [ ] **R42 - Create an Oracle Health developer account.** Establish the approved project account needed to access Oracle Health SMART-on-FHIR testing tools, record ownership and credential handling outside the repository, and document the local testing workflow without committing secrets.
- [~] **R43 - Establish reusable synthetic test patients.** The demo already includes independently authored scenarios across all age bands and key trajectories; review them for clinical plausibility, document expected scores and escalation outcomes, add missing edge cases, and reuse them through R19, R34, and R37-R39. Do not publish the gitignored patient-derived dataset or call lightly perturbed records synthetic: any new public fixture must be independently generated from documented clinical constraints or pass a formal disclosure-risk review with recorded approval.
- [ ] **R53 - Resolve PEWS scoring when blood pressure is unavailable in ED.** Establish what ED clinicians currently do, whether the national specification defines a permitted missing-BP pathway, and whether any evidence supports rescaling or another adjustment. Until clinically governed guidance exists, do not rescale the total, change its starting value, or invent substitute scoring; represent BP as not obtained with the applicable reason and make the incomplete observation explicit.
