# Web Component Phase 2 Specification

Status: not started. This document defines the acceptance criteria for roadmap R25-R33; [`roadmap.md`](./roadmap.md) remains the source of truth for priority and progress.

## Purpose

Phase 2 hardens the existing framework-neutral `<npews-chart>` element for isolated, multi-instance embedding and distribution. The component remains plain HTML, CSS, and JavaScript loaded as native ES modules during development. Any build tooling is distribution-only.

## Current Baseline

The Phase 1 element renders into light DOM, mounts a shell containing fixed ids, and delegates to a renderer with module-global patient, observation, segment, view, and listener state. It supports one chart per document. Reassigning `.data` rebuilds the shell, while toolbar wiring is guarded globally, so newly inserted controls are not reliably rebound.

Phase 1 browser correctness work in roadmap R13-R19 must land before or with Phase 2. Shadow DOM must not hide existing lifecycle defects or make visual comparison harder.

## Invariants

- The public data contract remains `{ patient, observations }` unless a separately documented API decision changes it.
- The chart computes scores from raw observations and date of birth; supplied totals, escalation levels, and age bands do not become authoritative.
- The clinical band and escalation colours remain unchanged.
- A skipped observation breaks the corresponding trend line.
- The native `chart/` source remains directly runnable without bundling or transpilation.
- Responsive layouts, host font overrides, and NHS reference-chart fidelity remain supported.
- Instance isolation must not prevent hosts from setting documented CSS custom properties on `<npews-chart>`.

## R25 - Shadow DOM Isolation

The custom element creates one open shadow root and mounts its shell and component stylesheet into that root.

Acceptance criteria:

- DOM queries used by the renderer are scoped to the component root rather than `document`.
- Host-page selectors cannot restyle internal chart structure accidentally, and component selectors do not leak into the host page.
- Documented CSS custom properties inherit through the host and are read from the effective component scope by Canvas.
- Existing host pages that set the `.data`, `.patient`, or `.observations` properties continue to work.
- Browser tests demonstrate isolation in both directions with deliberately conflicting host styles.

## R26 - Multiple Instances

Renderer data, scored observations, segments, view state, control state, and resize state belong to one chart instance rather than the module.

Acceptance criteria:

- At least two charts can render different patients, age bands, time ranges, layouts, and display modes in the same document.
- Updating or interacting with one chart does not redraw or change another chart.
- Internal ids, if retained for labels or accessibility relationships, are unique within the relevant root and are never queried globally.
- Global layout attributes or body classes are not used as hidden per-instance state.
- A browser test exercises simultaneous instances and independent updates.

## R27 - Lifecycle Management

Connection, data updates, disconnection, and reconnection have explicit behaviour.

Acceptance criteria:

- Setting data before or after connection renders the same result.
- Reassigning `.data` updates the existing instance without losing control handlers or accumulating listeners.
- Reassigning `.patient` or `.observations` follows the same rendering and validation rules as assigning `.data`.
- Disconnecting releases resize observers and external event listeners; reconnecting restores one working set.
- Repeated connect, update, disconnect, and reconnect cycles are covered by browser tests.

## R28 - Consumer Types

Public types use the canonical names `PatientObject` and `ObservationObject`, matching [`data-model.md`](./data-model.md). JSDoc in the native source should remain the type source unless implementation establishes a better single-source approach.

Acceptance criteria:

- Generated declarations cover `PatientObject`, `ObservationObject`, chart data, presentation options, and the custom-element property surface.
- Required, optional, nullable, enumerated, and skip-reason fields match the data model exactly.
- Types do not expose computed scores or age bands as trusted inputs.
- A TypeScript consumer fixture compiles against the packed package.
- Naming is consistent across JSDoc, declarations, package exports, README examples, and framework wrappers.

## R29-R33 - Distribution

Distribution starts only after the component API and instance model are stable.

Required artifacts:

- A package ESM entry point for modern tooling.
- A self-contained browser entry point suitable for a CDN and plain `<script>` use.
- Type declarations and any required stylesheet or embedded-style artifact.
- SHA-384 Subresource Integrity metadata for browser artifacts.
- Package metadata, supported-runtime policy, provenance, licence, and release documentation.

Acceptance criteria:

- `npm pack` contains only documented consumer files and no demo, reference-source, or development-only material.
- A clean plain-HTML fixture loads the packed or CDN-shaped artifact without reaching into repository source paths.
- Representative React, Vue, and Angular fixtures use thin wrappers over the same custom element rather than introducing framework runtime dependencies into the core.
- Package tests verify ESM import, browser registration, types, styles, and integrity metadata.
- Published artifacts are reproducible from a reviewed lockfile and CI workflow.

The exact bundler, browser bundle format, package version, and dependency versions are implementation-time decisions. They must be checked against current official registries and repositories rather than frozen in this specification.

## Verification

Phase 2 is complete only when:

- Existing unit and conformance tests remain green.
- Browser lifecycle and multiple-instance tests pass.
- The approved visual baseline matrix shows no unexplained clinical rendering changes.
- Keyboard, 200% zoom, mobile, tablet, and desktop checks pass.
- Package-consumer fixtures pass against the packed artifact rather than local source imports.
- Any intentional visual or API change is documented in the decision log and linked to its clinical-safety review where applicable.

## Open Decisions

- Whether presentation options are mutable properties, methods, or a separate options object.
- Whether Canvas resizing uses one `ResizeObserver` per instance or another root-scoped mechanism.
- Whether the browser artifact should use UMD, IIFE, or another format based on actual consumer requirements.
- Which framework consumer fixtures are maintained in this repository versus downstream wrapper repositories.
- Which organisation may approve NHS identity use and which branding surfaces belong only to the demo.
