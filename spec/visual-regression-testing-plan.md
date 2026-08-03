# Visual Regression Testing Plan

Status: not started. This document supports roadmap R15-R19; [`roadmap.md`](./roadmap.md) remains the source of truth for priority and progress.

## Purpose

The chart communicates clinical state through Canvas position, line continuity, labels, colour bands, totals, and escalation banners. Browser interaction tests and reviewed screenshots are therefore safety evidence, not cosmetic snapshots.

Vitest currently covers pure scoring configuration, age-band logic, and FHIR behaviour in Node. It does not load the Web Component, operate controls, inspect Canvas output, or verify responsive rendering.

## Tool

Use Playwright's test runner and `toHaveScreenshot` support. It keeps interaction and screenshot checks in one local, reviewable tool without requiring a hosted visual-testing service.

Add Playwright only when implementation begins. Confirm the current stable package version and browser support from the official registry and repository, commit the updated lockfile, and document the development-only dependency review.

## Test Layers

### Interaction Tests

Prefer semantic assertions for behaviour that does not require pixel comparison:

- Initial render from `.data` assigned before and after connection.
- Repeated `.data`, `.patient`, and `.observations` updates.
- Scenario changes after the shell has already rendered.
- Layout, zoom, quick-range controls.
- Layout locking, keyboard navigation, focus visibility, and 200% zoom.
- Empty observations, missing optional fields, malformed required fields, and skipped values.
- Connect, disconnect, and reconnect cleanup.
- Multiple independent instances after roadmap R26.

### Visual Tests

Use screenshots where Canvas pixels, geometry, or cross-element layout are the contract:

- Trend points and line continuity.
- Clinically mandated band and escalation colours.
- Age-band transitions and headers.
- PEWS totals and escalation banners.
- Responsive chart heights, labels, legends, and sticky regions.
- Host-style and Shadow DOM isolation after roadmap R25.

Do not use a broad pixel tolerance to hide antialiasing or font instability. First make rendering deterministic, then set the smallest reviewed threshold needed for platform noise.

## Deterministic Environment

- Serve the demo through one declared project command that CI can run from a clean lockfile install. Do not rely on the current undeclared global `live-server` installation.
- Pin the CI operating system and browser versions through reviewed lockfile and workflow updates.
- Use a fixed timezone, locale, viewport, device scale, and reduced-motion preference.
- Wait for the selected font and the custom element to be ready before capturing.
- Use fixed scenario data and avoid current-time-dependent rendering.
- Disable transitions and animation that do not form part of the clinical contract.
- Keep screenshot names stable and derived from scenario, layout, theme, mode, and browser.

## Baseline Matrix

The minimum approved matrix covers:

- Every age band: `0-11m`, `1-4y`, `5-12y`, and `13+y`.
- Landscape, portrait, and mobile layouts.
- Every supported theme registered by the demo, currently NHS, RCPCH, Slate, and Midnight.
- Normal mode and each supported theme.
- Values shown and hidden where labels could affect layout.
- Birthday crossing, skipped observations, oxygen-modality transition, rapid deterioration, and recovery.
- The primary NHS reference comparison at `reference-sources/images/chart-5-12-years-1.png`.

Avoid taking the full Cartesian product by default. Define a small canonical smoke matrix that covers every dimension at least once, then add targeted combinations for known hazards. Run broader cross-browser coverage at an agreed cadence if pull-request cost becomes excessive.

## Scenario Fixtures

Import `SCENARIOS` from `demo/scenarios.js` so the review harness and browser suite use the same patient and observation data. Add named scenarios for skipped observations and oxygen-modality transitions rather than relying only on incidental values inside larger datasets.

Before adding a generic missing-data case, define whether it means an isolated missing vital, consecutive missing values, an entirely absent observation round, a required patient field, or an explicit unable-to-measure code. Each behaviour needs its own expectation.

## Baseline Governance

- Store approved PNG baselines in the repository with the tests that consume them.
- Require a human review of rendered old/new images for every baseline update.
- Record why a changed image is intentional and cite the relevant requirement, decision, or hazard.
- Do not approve baselines solely because a newly generated image makes CI green.
- Keep the NHS source chart beside comparison output during clinical visual review.
- Name the role or reviewers authorised to approve safety-relevant visual changes before CI becomes a release gate.

## CI

Add browser checks after general CI in roadmap R12 is established.

The workflow must:

- Install dependencies from the committed lockfile.
- Install the reviewed Playwright browser set reproducibly.
- Start the declared local server and fail clearly if it does not become ready.
- Run interaction tests before screenshot comparisons.
- Upload failure images, diffs, traces, and reports with an explicit retention period.
- Use least-privilege permissions, disable persisted checkout credentials, and pin every Action to a full commit SHA with its version in a comment.
- Run Zizmor against the workflow collection.

Fetch each Action repository immediately before implementation to confirm the current stable tag and SHA. This plan intentionally does not include version tags or placeholder pins that will go stale.

## Completion Criteria

- The interaction suite catches component remount/listener regressions.
- The approved smoke matrix covers every age band, layout, theme, mode, and named edge case.
- A clean checkout can regenerate matching output through documented `s/` commands.
- CI blocks unexplained interaction or screenshot differences.
- Intentional baseline changes have a documented clinical review path.
