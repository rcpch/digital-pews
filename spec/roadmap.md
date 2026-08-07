# Roadmap

Last reviewed: 2026-08-06 following NHSE child-health representative feedback on 2026-08-05 and review against the current implementation and test suite.

Legend: `[x]` delivered, `[~]` implemented but incomplete, `[ ]` not started. Item codes are stable and must not be renumbered when priorities change.

Clinical correctness, safety evidence, and conformance take precedence over packaging and presentation work.

The immediate priority is to settle the chart's visual design. Deterministic visual baselines should not be approved while known UI changes are still in motion. Once R54 records design agreement, the project moves through clinical/API refinement, test-fixture preparation, browser and visual evidence, component hardening, interoperability, and distribution.

## Completed Foundation

- [x] **R1 - Keep numeric scoring in one canonical JSON source.** `npews-scoring-spec.json` generates the runtime configuration and human-readable tables, with drift and freshness tests.
- [x] **R2 - Resolve age bands from date of birth.** Exact calendar arithmetic and birthday boundaries are covered by automated tests.
- [x] **R3 - Render the observation chart.** Proportional time spacing, skipped-observation and oxygen-modality line breaks, birthday crossing, PEWS totals, escalation banners, fixed time windows, and responsive layouts are implemented. Browser and Canvas regression evidence is now tracked separately under R16-R18 and R55 rather than keeping rendering itself permanently partial.
- [x] **R4 - Provide the Phase 1 Web Component.** The light-DOM `<npews-chart>` element accepts `{ patient, observations }`, supports property reassignment, self-provisions its styles, and intentionally supports one chart per document. Isolation, multiple instances, and complete lifecycle ownership belong to Phase 2 under R25-R27.
- [x] **R7 - Define the product and compliance boundary.** The repository is explicitly a scoring and charting component, not an EPR or complete SPOT/NPEWS solution; see [`product-boundary.md`](./product-boundary.md).
- [x] **R8 - Establish the clinical safety file.** Root [`SAFETY.md`](../SAFETY.md) records intended use, current status, preliminary hazards, controls, transferred responsibilities, and release limitations.
- [x] **R13 - Make controls survive component updates.** Fixed time-window links use delegated event handling and preserve the selected window when the light-DOM shell is replaced.
- [x] **R44 - Publish the demo to GitHub Pages.** Artifact-based deployment serves the demo at <https://rcpch.github.io/digital-pews/>.
- [x] **R45 - Add contributor and reporting routes.** `CONTRIBUTING.md`, issue templates, and `SECURITY.md` provide public, private, clinical-safety, and security reporting paths.

## Doing Next - Settle The Chart UI

These are the granular changes requested in the latest clinical review. Complete them before approving visual baselines.

- [x] **R47 - Increase parameter-heading legibility.** Chart parameter headings use 16px type in landscape and portrait layouts and 14px in the constrained mobile label column, increased from 14px, 13px, and 12px respectively. Wrapping, row height, truncation, and readability have been checked across every supported layout and at 200% browser zoom.
- [x] **R48 - Replace the decorative age-band strip with a chart identifier.** The toolbar shows the deterministically resolved visible age-band code in large text and the decorative coloured header strip has been removed. A visible window crossing a boundary shows both codes in chronological order, for example `1-4y → 5-12y`.
- [x] **R49 - Refine blood-pressure markers.** Blood pressure uses small open inward-pointing arrow marks with their tips at the exact systolic and diastolic positions, joined by the required vertical line. The lighter marks replace the previous filled blocky triangles and conform to `U11.5`.
- [~] **R50 - Verify exact reference-chart colours.** The component uses interim web-rendered screenshot samples: white `#ffffff`, yellow `#fff8ae`, orange `#fcc88e`, and pink `#f9cbd7`. Poppler renders the supplied PDFs differently, demonstrating that PDFs are not a normative RGB specification. [Issue #5](https://github.com/rcpch/digital-pews/issues/5) assigns NHSE the action to supply authoritative screen values, print/screen intent, Human Factors provenance, and change governance; see [`implementation-notes.md`](./implementation-notes.md).
- [x] **R51 - Make the demographics bar optional.** The separate assignable `.options` object exposes `showDemographics`, defaulting to `true`; only an explicit `false` hides the patient-identification header, and data reassignment preserves the setting. The demo provides a “Show demographics bar” checkbox.
- [x] **R56 - Keep current patient and escalation status visible.** The standard chart keeps the combined demographics and current-escalation block sticky while the observation chart scrolls, including when demographics are explicitly hidden.
- [x] **R57 - Decouple demo playback from the chart time axis.** The demo uses a fixed observation-index slider with native drag and arrow-key operation, starts at the latest observation, and supplies only the selected observation plus its history to the unmodified chart component. The selected chart window ends at that simulated current observation; future observations are hidden; the old canvas-aligned overlay and chart-geometry coupling have been removed.
- [x] **R58 - Keep the current PEWS status bar structurally stable.** The sticky status always renders a neutral PEWS 0 state when no escalation is indicated, preventing playback layout jumps. Escalation source provenance sits at the right end of the main status line on supported widths, reducing banner height while remaining visible on narrow layouts.
- [~] **R41 - Complete the clinical UI quality pass.** Apply the agreed changes coherently across realistic data, supported themes, and mobile/tablet/desktop layouts while preserving NHS chart fidelity and clinical semantics.
- [ ] **R54 - Approve the chart UI design baseline.** Review R47-R51, R56-R58, and the complete chart against the authoritative NHS references with the clinical reviewers, resolve remaining visual feedback, record who approved the result and when, and declare the UI sufficiently stable for deterministic screenshot baselines. This is a design gate, not a claim that browser regression evidence already exists.

## Stage 1 - Clinical Behaviour And Component Contract

Settle what the component calculates, accepts, displays, and deliberately excludes before freezing its API or generating broad evidence.

- [~] **R10 - Complete non-score escalation triggers.** Explicit host-supplied `CI`, `CQ`, and `SC` trigger levels retain provenance and participate in highest-level selection, with Clinical Intuition and Carer Question controls in the demo. Resolve automatic AVPU change, temperature/sepsis and specific-concern derivation, raw-response semantics, trigger display across every chart surface, and clinical review against [`escalation.md`](./escalation.md).
- [ ] **R46 - Define clinical policy at age-band boundaries.** Preserve the deterministic switch and explicit divider at the 1st, 5th, and 13th birthdays without the `C2.2` alternate-form override. Document the open research question, current behaviour, hazard implications, senior-discretion context, and governance route.
- [ ] **R53 - Resolve PEWS scoring when blood pressure is unavailable in ED.** Establish current clinical practice, whether the national specification defines a permitted pathway, and whether evidence supports rescaling or another adjustment. Until governed guidance exists, do not rescale, change the starting value, or invent substitute scoring; make the missing BP explicit with its applicable reason.
- [ ] **R20 - Decide which clinical configuration may be overridden.** Define the governed boundary between canonical national defaults and any host-configurable clinical behaviour.
- [~] **R21 - Centralise escalation configuration.** Presentation metadata is centralised, but score boundaries and non-score trigger policy are not yet represented by one canonical runtime structure.
- [~] **R22 - Complete respiratory-support handling.** Known support codes are scored; configurable additions, national-code governance, and clinically useful device-change display remain incomplete.
- [~] **R23 - Define typed presentation options.** The separate assignable `.options` object now controls demographics visibility. Define and type the remaining initial layout, show-values, and initial time-window fields.
- [ ] **R24 - Define branding and explanatory-content extension points.** Separate demo-owner branding, embedding-organisation branding, NHS identity approval, and host-supplied helper text.
- [ ] **R9 - Add requirements traceability.** Extend [`product-boundary.md`](./product-boundary.md) into an individual matrix allocating applicable `U*`, `C*`, and `T*` requirements to the component, host, deployment, supplier, deliberate exclusion, implementation, tests, and clinical review.
- [ ] **R11 - Expand source-derived scorer vectors.** Exercise every age band and threshold boundary using cases independently derived from the canonical specification, not only generated-config equality.

## Stage 2 - Reproducible Development And Test Fixtures

Prepare stable inputs and repeatable tooling before building browser and screenshot gates.

- [~] **R40 - Make the local development experience reliable.** A clean checkout needs one documented setup path, reproducible locked serving dependencies, useful startup errors, automatic browser opening, and straightforward test and scoring-generation commands.
- [ ] **R12 - Add general CI.** Run installation from the lockfile, the complete test suite, scoring-generation checks, licence checks, and workflow security checks on pull requests and `main` before adding visual or release automation.
- [~] **R5 - Maintain clinical review scenarios.** All age bands and major trajectories are represented, but clinical plausibility, expected outcomes, named edge cases, and reuse as automated fixtures remain incomplete.
- [~] **R36 - Complete named edge-case scenarios.** Add dedicated skipped-observation, oxygen-transition, missing-data, sparse-ED, and non-score-trigger cases with explicit expected behaviour.
- [~] **R43 - Establish reusable synthetic test patients.** Use the aggregate archetype strategy in [`patient-derived-data-assessment.md`](./patient-derived-data-assessment.md), review fixtures for clinical plausibility, document expected scores and escalation outcomes, and never publish lightly perturbed patient-derived records.
- [ ] **R19 - Reuse scenarios as automated fixtures.** Import the scenario catalogue into browser and regression checks instead of maintaining separate test data.

## Stage 3 - Browser, Accessibility, And Visual Evidence

Begin this stage after R54 so screenshot baselines protect an agreed design rather than freezing known defects.

- [ ] **R14 - Establish accessible rendering.** Ensure Canvas colour lookup reads from the effective component scope and rendering meets WCAG 2.2 AA contrast and target-size requirements; add automated browser assertions.
- [ ] **R15 - Add browser interaction tests.** Cover initial render, repeated `.data` assignment, scenario switching, connect/disconnect cycles, controls, layout locking, empty and malformed input, keyboard use, and 200% browser zoom.
- [ ] **R16 - Establish deterministic visual-regression infrastructure.** Add Playwright with controlled fonts, timezone, data, viewport, and device scale without Storybook or a hosted visual-testing service; see the [Visual Regression Testing Plan](./visual-regression-testing-plan.md).
- [ ] **R17 - Approve the visual baseline matrix.** Capture all age bands, landscape/portrait/mobile layouts, supported themes, birthday crossing, skipped values, oxygen-modality changes, sparse observations, and non-score triggers against the NHS reference chart.
- [ ] **R18 - Add visual CI and change governance.** Run browser checks on pull requests and document who approves intentional clinical visual changes and baseline updates.
- [ ] **R55 - Verify observation-chart rendering.** Use R14-R19 to provide browser and Canvas regression evidence for the behaviour delivered under R3: proportional spacing, exact points, trend continuity, skip and modality breaks, birthday transitions, PEWS totals, escalation presentation, fixed time windows, and responsive layouts.

## Stage 4 - Web Component Hardening

Harden the component after browser evidence can detect lifecycle, isolation, and visual regressions.

- [ ] **R25 - Add Shadow DOM isolation.** Scope rendering, styles, DOM lookup, and custom-property reads to the component root.
- [ ] **R26 - Support multiple simultaneous instances.** Replace fixed ids and module-global renderer/view state with per-instance state.
- [ ] **R27 - Complete component lifecycle cleanup.** Bind and release resize and control listeners per instance, preserving state deliberately across updates.
- [ ] **R28 - Publish generated consumer types.** Provide consistent `PatientObject` and `ObservationObject` JSDoc and `.d.ts` declarations.

See the [Web Component Phase 2 Specification](./web-component-phase2-spec.md) for detailed acceptance criteria.

## Stage 5 - Clinical Review And Interoperability

- [ ] **R34 - Show raw inputs and computed results together.** Add a review table beside the demo chart for observation values, skipped reasons, component scores, total PEWS, escalation level, and trigger provenance.
- [ ] **R35 - Add side-by-side age-band comparison.** Provide a clinical review view for comparing threshold and rendering differences without implying manual age-band selection.
- [~] **R6 - Maintain the FHIR adapter.** Bidirectional conversion and current conformance fixtures are tested, but reverse round trips, national coding decisions, trigger mapping, and strict profile validation remain open.
- [ ] **R37 - Complete FHIR reverse round-trip coverage.** Resolve outstanding `FHIR -> chart -> FHIR` cases for resources, scores, modality changes, skip reasons, and trigger provenance.
- [ ] **R38 - Resolve FHIR coding and validation scope.** Determine how EPR and FHIR models represent Clinical Intuition, Carer Question, Specific Concern, selected escalation level, and provenance; decide canonical national codes and add strict FHIR R4 and UK Core validation where required.
- [ ] **R39 - Add SMART-on-FHIR conformance coverage.** Test the adapter and component contract in a representative SMART host after the API is stable.
- [ ] **R42 - Create an Oracle Health developer account.** Establish the approved project account, record ownership and credential handling outside the repository, and document local testing without committing secrets.

## Stage 6 - Distribution And Clinical Release Readiness

Distribution starts only after the component API and instance model are stable. Clinical deployment additionally requires the independent safety work in R52.

- [ ] **R29 - Prepare publishable package metadata and exports.** Remove private-only packaging once the API is ready and define supported entry points.
- [ ] **R30 - Add a distribution-only ESM and browser bundle.** Keep `chart/` runnable as native modules while producing package/CDN artifacts separately.
- [ ] **R31 - Generate Subresource Integrity metadata.** Produce and document SHA-384 integrity values for browser artifacts.
- [ ] **R32 - Test real package consumers.** Verify package and CDN use from plain HTML and representative framework wrappers.
- [ ] **R33 - Define the release process and support policy.** Document versioning, artifact provenance, CDN URLs, compatibility, and deprecation expectations.
- [ ] **R52 - Complete formal clinical safety assurance before clinical release.** Appoint a competent Clinical Safety Officer, determine manufacturer/supplier and regulatory roles, agree a risk method, conduct a multidisciplinary hazard workshop, review control effectiveness, accept or transfer residual risks, define release gates, and create the required Tier 2 hazard log, safety case, and safety plan.
