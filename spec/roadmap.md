# Roadmap

Last reviewed: 2026-07-23 against the current implementation and test suite.

Legend: `[x]` done with relevant automated evidence, `[~]` implemented but unverified or partially complete, `[ ]` not started. Item codes are stable and must not be renumbered when priorities change.

Clinical correctness, safety evidence, and conformance take precedence over packaging and presentation work.

## Current Baseline

- [x] **R1 - Keep numeric scoring in one canonical JSON source.** `npews-scoring-spec.json` generates the configuration consumed by the calculator and UI plus the human-readable reference tables, with drift and freshness tests preventing those surfaces from diverging.
- [x] **R2 - Resolve age bands from date of birth.** Date arithmetic and birthday-boundary behaviour are covered by automated tests.
- [~] **R3 - Render the observation chart.** Proportional time spacing, skipped-observation line breaks, oxygen-modality line breaks, birthday crossing, PEWS totals, escalation banners, and responsive layouts are implemented but lack browser and Canvas regression tests.
- [~] **R4 - Provide the Phase 1 Web Component.** The light-DOM `<npews-chart>` element accepts `{ patient, observations }`, but remains limited to one chart per document and has lifecycle gaps when data is reassigned.
- [~] **R5 - Maintain clinical review scenarios.** All four age bands, birthday crossing, rapid deterioration, recovery, non-hour observation times, skipped values, and oxygen-modality changes appear in the demo, but the scenarios are not automated browser fixtures.
- [~] **R6 - Maintain the FHIR adapter.** Bidirectional conversion and current conformance fixtures are tested, but reverse round-trip cases, national coding decisions, and strict profile validation remain open.

## P0 - Clinical Safety And Conformance

- [ ] **R7 - Define the product and compliance boundary.** State whether this repository is only an NPEWS chart component or is intended to satisfy the complete SPOT/NPEWS workflow and Must requirements.
- [ ] **R8 - Establish the clinical safety file.** Add a root `SAFETY.md`, named safety ownership, intended use, known hazards, and links from mitigations to specifications and tests; grow this into a hazard log and safety case as governance requires.
- [ ] **R9 - Add requirements traceability.** Map applicable `U*` and `C*` requirements to implementation, tests, exclusions, and clinical review without changing the authoritative source transcriptions.
- [ ] **R10 - Implement or explicitly exclude non-score escalation triggers.** Resolve carer concern, clinical intuition, specific concern, AVPU change, temperature/sepsis triggers, highest-level selection, trigger provenance, and reason display against `escalation.md` and the national requirements.
- [ ] **R11 - Expand source-derived scorer vectors.** Exercise every age band and threshold boundary using cases independently derived from the canonical specification, not only generated-config equality.
- [ ] **R12 - Add general CI.** Run installation from the lockfile, the complete test suite, scoring-generation checks, licence checks, and workflow security checks on pull requests and `main` before adding release automation.

## P1 - Browser And Visual Safety Evidence

- [ ] **R13 - Make controls survive component updates.** Remove module-global one-time listener state or otherwise ensure layout, values, zoom, range, and colour-blind controls still work after `.data` is reassigned or the component reconnects.
- [~] **R14 - Complete colour-blind rendering.** DOM overrides exist, but Canvas colour lookup must read the effective component/body values and receive an automated browser assertion.
- [ ] **R15 - Add browser interaction tests.** Cover initial render, repeated `.data` assignment, scenario switching, connect/disconnect cycles, controls, layout locking, empty input, malformed input, keyboard use, and 200% zoom.
- [ ] **R16 - Establish deterministic visual regression testing.** Add Playwright with controlled fonts, timezone, data, viewport, and device scale, without requiring Storybook or a hosted visual-testing service; see the [Visual Regression Testing Plan](./visual-regression-testing-plan.md).
- [ ] **R17 - Approve the visual baseline matrix.** Capture all age bands, landscape/portrait/mobile layouts, supported themes, colour-blind mode, birthday crossing, skipped values, and oxygen-modality changes against the NHS reference chart.
- [ ] **R18 - Add visual CI and change governance.** Run browser tests on pull requests and document who approves intentional clinical visual changes and baseline updates.
- [ ] **R19 - Reuse scenarios as automated fixtures.** Import the scenario catalogue into browser and regression checks instead of maintaining separate test data.
- [~] **R40 - Make the local development experience reliable.** `s/up` serves the current demo, but a clean checkout must have one documented setup path, reproducible locked serving dependencies, useful startup errors, automatic browser opening, and a straightforward way to run tests and scoring-generation checks.
- [~] **R41 - Complete the clinical UI quality pass.** Preserve fidelity to the NHS chart while making the interface coherent, readable, responsive, accessible, and professionally finished across realistic patient data, supported themes, colour-blind mode, and mobile/tablet/desktop layouts; verify through human review and R15-R18 rather than subjective polish alone.

## P2 - Component API And Configuration

- [ ] **R20 - Decide which clinical configuration may be overridden.** Age-band bounds and scoring thresholds are already data-driven internally; arbitrary host overrides require an explicit clinical-governance decision and canonical defaults must remain authoritative.
- [~] **R21 - Centralise escalation configuration.** Presentation metadata is centralised, but score boundaries and non-score trigger policy are not yet represented by one canonical runtime structure.
- [~] **R22 - Complete respiratory-support handling.** Known support codes are scored; configurable additions, national-code governance, and clinically useful device-change display remain incomplete.
- [ ] **R23 - Define typed presentation options.** Keep options separate from `Patient` and `Observation`, covering initial layout, colour-blind mode, show-values state, time window, and zoom.
- [ ] **R24 - Define branding and explanatory-content extension points.** Separate demo-owner branding, embedding-organisation branding, NHS identity approval, and host-supplied helper text.

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
- [ ] **R38 - Resolve FHIR coding and validation scope.** Decide canonical national codes and trigger representation, then add strict FHIR R4 and UK Core validation where required.
- [ ] **R39 - Add SMART-on-FHIR conformance coverage.** Test the adapter and component contract in a representative SMART host after the component API is stable.
- [ ] **R42 - Create an Oracle Health developer account.** Establish the approved project account needed to access Oracle Health SMART-on-FHIR testing tools, record ownership and credential handling outside the repository, and document the local testing workflow without committing secrets.
- [~] **R43 - Establish reusable synthetic test patients.** The demo already includes synthetic patients across all age bands and key trajectories; review them for clinical plausibility, document expected scores and escalation outcomes, add any missing edge cases, and reuse them through R19, R34, and R37-R39.
