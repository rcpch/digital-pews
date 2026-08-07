# Digital PEWS — specification & decisions

This folder is the source of record for **what** Digital PEWS must do and **why** it is
built the way it is. Every fact here is traceable to a document in
[`../reference-sources/`](../reference-sources/) (the NHS SPOT/NPEWS specifications, the
published age-band charts, and the configuration/decision-pathway PDFs) or to the code in
[`../chart/`](../chart/) (the chart component) and [`../demo/`](../demo/) (the demo harness).

New here? Read [`../README.md`](../README.md) for how to run the app, then
[`decisions.md`](./decisions.md) for the shape of the project, then the reference
specs below.

---

## Reference specifications (transcribed from the SPOT-NPEWS `.xlsx`)

These are faithful transcriptions of the national specification. **Must** requirements are
non-negotiable; requirement IDs (`U3.10`, `C3.17`, …) are load-bearing — don't renumber them.

| Document | What it covers |
| --- | --- |
| [`spot-npews-ui-spec.md`](./spot-npews-ui-spec.md) | NHS SPOT/NPEWS **UI** specification (MOSCOW-prioritised `U*` requirements). |
| [`spot-npews-spec.md`](./spot-npews-spec.md) | NHS SPOT/NPEWS **clinical/technical** specification (`C*` requirements). |

## Scoring (JSON is the source of truth)

| Document | What it covers |
| --- | --- |
| [`npews-scoring-spec.json`](./npews-scoring-spec.json) | **Canonical** numeric scoring spec — every threshold, age-band bound and escalation mapping. Edit this, then run `npm run generate:scoring`. Drift-tested. |
| [`npews-scoring-tables.generated.md`](./npews-scoring-tables.generated.md) | Human-readable unified reference table. **Generated** from the JSON — do not hand-edit. |
| [`npews-scoring.md`](./npews-scoring.md) | Clinical narrative only: the per-age-band respiratory-distress descriptors and implementer notes. |

## Clinical policy & data

| Document | What it covers |
| --- | --- |
| [`escalation.md`](./escalation.md) | Escalation levels, non-score triggers, "think sepsis", and the ISBAR aide-memoire. |
| [`data-model.md`](./data-model.md) | The two component inputs — `Patient` and `Observation` (raw vitals) — plus data-entry reference codes. |
| [`fhir.md`](./fhir.md) | The FHIR adapter contract (as implemented) and the conformance-testing approach. |
| [`patient-derived-data-assessment.md`](./patient-derived-data-assessment.md) | Aggregate analysis of the gitignored ED resource, disclosure-risk decision, synthetic replacement strategy, and controlled local-testing constraints. |
| [`../SAFETY.md`](../SAFETY.md) | Current clinical safety status, initial hazard log, controls, transferred responsibilities, and open assurance work. |

## Project decisions & direction

| Document | What it covers |
| --- | --- |
| [`product-boundary.md`](./product-boundary.md) | The component-only product boundary, responsibility allocation, compliance claims, and deliberate `C2.2` non-conformance. |
| [`decisions.md`](./decisions.md) | Durable decision log (ADR-style, newest first). Start here to understand the project's choices. |
| [`implementation-notes.md`](./implementation-notes.md) | Clarifications discovered while building, plus a manual visual-QA checklist. |
| [`react.md`](./react.md) | The component-architecture decision: framework-neutral Web Component vs React. |
| [`roadmap.md`](./roadmap.md) | Forward-looking work (including Web Component Phase 2). |
| [`web-component-phase2-spec.md`](./web-component-phase2-spec.md) | Acceptance criteria for isolation, multiple instances, lifecycle, types, and distribution. |
| [`visual-regression-testing-plan.md`](./visual-regression-testing-plan.md) | Browser interaction, screenshot, baseline-governance, and visual-CI plan. |

---

## Conventions

- **The JSON scoring spec wins.** Where any prose disagrees with
  [`npews-scoring-spec.json`](./npews-scoring-spec.json), the JSON is correct (and a drift
  test will be red). Regenerate artifacts with `npm run generate:scoring`.
- **Ground claims in a source.** Prefer citing a `reference-sources/` document or a code
  path over asserting a fact. If a requirement can't be traced, mark it as an
  implementation decision in [`decisions.md`](./decisions.md).
- **Clinical safety over features.** Visual and numeric fidelity to the national NPEWS
  charts takes precedence — see the hard constraints in [`../CLAUDE.md`](../CLAUDE.md).
- **Record decisions once.** New durable decisions go in [`decisions.md`](./decisions.md),
  not scattered through the specs.
