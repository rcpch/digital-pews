# House-Style Audit

Audit date: 2026-07-23

Audited against: `~/code/house-style` as of this date, especially `agents.md`, `new-repos.md`, `security.md`, `licensing.md`, `scripts.md`, `ci.md`, `dependencies.md`, `specs.md`, `testing.md`, `clinical-safety.md`, and `ui.md`.

Scope: lightweight static audit only. No compliance findings were fixed as part of the audit. The roadmap, its two supporting plans, and the specification index were separately tidied because that was an explicit part of the request.

## Summary

Digital PEWS is a framework-neutral clinical chart component with an unusually strong specification structure and a good canonical-data approach to numeric scoring. Its main house-style gap is not code organisation but assurance: a public, clinically consequential repository has no clinical safety file, CI, licence declaration, vulnerability policy, or browser-level evidence for its Canvas interface.

Main improvements:

- Establish the intended-use and compliance boundary, then add clinical safety ownership, hazards, and requirements traceability.
- Put the existing scoring and FHIR tests under CI and add browser/visual checks for safety-relevant rendering and component lifecycle behaviour.
- Resolve licensing and third-party provenance before distribution work.
- Add the missing public-repository maintenance baseline: `SECURITY.md`, operational agent instructions, canonical test scripts, and reproducible development dependencies.

## Priority Findings

### P1 - Clinical safety management is absent

Evidence:

- `CLAUDE.md:5-7` explicitly identifies the chart as a clinical safety tool whose visual accuracy and specification compliance matter.
- `CLAUDE.md:179-197` records safety-relevant invariants, but the repository has no root `SAFETY.md`, safety owner, hazard log, safety case, or safety plan.
- `spec/escalation.md` documents non-score escalation behaviour that is not yet represented in the runtime scorer, making intended scope and known limitations particularly important.

House style:

- `clinical-safety.md` requires every non-toy clinical tool that can affect care to grow from a root `SAFETY.md`, covering intended use, responsible role, current status, known hazards, and evidence links.
- `agents.md` says safety-relevant changes, hazards, evidence, and review decisions should share the implementation trail.

Suggested change:

- Complete roadmap R7 and R8 first: define whether this is a chart component or a complete SPOT/NPEWS implementation, name the responsible clinical safety role, record current limitations, and open a small hazard log linked to requirements and tests.

### P1 - Existing tests are not enforced by CI

Evidence:

- `package.json:7-15` defines Vitest and scoring-generation checks.
- `test/scoring/config-matches-spec.test.js:22-65` and `test/scoring/generated-artifacts-current.test.js:24-33` provide useful canonical-data drift guards.
- `.github/dependabot.yml:7-8` explicitly says no workflows exist, and `.github/workflows/` is absent.

House style:

- `new-repos.md` requires `.github/workflows/ci.yml` once a repository has meaningful code to test.
- `ci.md` requires least-privilege workflows, full-SHA Action pins with version comments, dependency installation from the lockfile, and workflow security analysis.

Suggested change:

- Add `s/test` and a single CI workflow that runs `npm ci`, the full test suite, `npm run generate:scoring:check`, licence compliance, and Zizmor. Fetch every Action's current stable tag and SHA immediately before writing the workflow.

### P1 - Licensing and source provenance are undefined

Evidence:

- The public repository has no `LICENSE`, `REUSE.toml`, or SPDX headers; a repository-wide source search found no SPDX declarations.
- `README.md` has no licensing section.
- `reference-sources/` contains NHS specifications, charts, PDFs, and other third-party clinical material whose redistribution terms need explicit provenance.

House style:

- `licensing.md` expects a deliberate code licence, SPDX coverage, REUSE annotations for files that cannot carry headers, a separate content licence, and documentation of third-party provenance.
- `new-repos.md` requires a root licence and a README licensing statement.

Suggested change:

- Confirm RCPCH ownership and redistribution rights before applying the house default mechanically. Then add the correct root licence text, SPDX/REUSE coverage, a content-licensing statement, and an inventory of third-party reference material with its applicable terms.

### P1 - Browser and Canvas safety behaviour has no automated evidence

Evidence:

- `vitest.config.js:3-7` runs only Node tests, so the Web Component, Canvas renderer, controls, keyboard behaviour, responsive layout, and visual output are not exercised.
- `chart/npews-chart.js:158` remounts the shell into the element when data is rendered, while `chart/chart.js:1524-1528` uses a module-global one-time toolbar-wiring guard. Controls inserted after a data update can therefore be left without handlers.
- `chart/styles.css:57-66` applies colour-blind custom properties on `body.cb-mode`, while `chart/chart.js:42-53` reads Canvas colours from `document.documentElement`; the effective colour-blind values are not read by the Canvas renderer.

House style:

- `ui.md` requires rendered mobile, tablet, and desktop verification, keyboard and zoom checks, and confirmation that Canvas assets actually render.
- `testing.md` calls for source-derived vectors and observable-behaviour tests for specification implementations.
- `clinical-safety.md` requires safety-relevant implementation and evidence to stay linked.

Suggested change:

- Treat roadmap R13-R19 as clinical correctness work, not polish. Fix the lifecycle and colour scope, add browser interaction coverage, then approve deterministic visual baselines against the NHS references.

### P2 - The public repository has no vulnerability reporting policy

Evidence:

- GitHub reports `rcpch/digital-pews` as public and active on default branch `main`.
- The repository has no `SECURITY.md`.

House style:

- `security.md` and `new-repos.md` require public repositories to document a private vulnerability-reporting route and safe findings handling.

Suggested change:

- Add a concise `SECURITY.md` naming supported versions, the private reporting channel, expected handling, and a warning not to disclose patient data or exploit details in public issues.

### P2 - Development serving is not reproducible

Evidence:

- `docker-compose.yml:7-9` uses the mutable `node:alpine` tag and installs the latest `live-server` globally every time the service starts.
- `live-server` is not declared in `package.json` or captured by `package-lock.json`, so the served environment can change without a repository diff.

House style:

- `dependencies.md` treats every dependency as reviewed code, requires direct dependencies to be declared, and requires deployable environments to build from committed locks.
- `security.md` requires supply-chain changes to be reproducible and reviewable.

Suggested change:

- Choose and review a serving approach, declare the tool directly, install from the lockfile, and pin the container image deliberately. Keep the chart runtime dependency-free; this is development tooling only.

### P2 - Agent guidance is detailed but not operationally complete

Evidence:

- `CLAUDE.md` documents the architecture, source references, and critical invariants well.
- It does not link to `~/code/house-style/AGENTS.md`, provide canonical validation commands, define a before-commit gate, or state which external actions require approval.
- There is no vendor-neutral `agent-instructions.md` or `AGENTS.md` pointer, so the only repository guidance is tool-specific.

House style:

- `agents.md` requires read-first documents, invariants, canonical scripts, exact validation commands, assurance expectations, and approval boundaries. New guidance should be vendor-neutral, while mature substantive guidance may be migrated rather than duplicated.

Suggested change:

- Move the operational core into a concise `agent-instructions.md`, leave `CLAUDE.md` and `AGENTS.md` as pointers, and retain detailed domain material in `spec/` rather than copying it between instruction files.

### P2 - Repeated validation processes bypass the canonical `s/` interface

Evidence:

- `s/` contains only `up` and `down`.
- Tests and scoring generation are exposed only through `package.json`, while generator implementation lives under `scripts/`.
- `s/up:7-8` and `s/down:6-7` locate the repository correctly, but neither script forwards arbitrary arguments to the underlying Compose command and both contain more process policy than the canonical thin-wrapper shape.

House style:

- `scripts.md` says repeated processes should be discoverable as `s/test`, `s/lint`, `s/up`, and similar wrappers that run from the repository root and forward `"$@"`.

Suggested change:

- Add `s/test` and an appropriate scoring-generation/check verb, keep implementation helpers under `scripts/` only where they are source modules rather than user-facing commands, and simplify Compose wrappers without losing their useful browser-opening preflight.

### P3 - Repository baseline and prose conventions need a consistency pass

Evidence:

- The repository has no `.editorconfig`.
- `README.md` and `CLAUDE.md` hard-wrap prose and use em dashes extensively, contrary to current house style.
- `README.md:131` links to `test-output/VISUAL_COMPARISON.md`, which is absent.
- `chart/README.md` contains stale input and layout descriptions relative to the DOB-authoritative data model and current renderer.

House style:

- `new-repos.md` includes `.editorconfig` in the minimum baseline.
- `AGENTS.md` specifies unwrapped Markdown paragraphs, hyphens rather than em dashes, and consistent slug-case filenames except recognised conventions.
- `specs.md` says intentional implementation/specification divergence must be updated or tracked explicitly.

Suggested change:

- Add `.editorconfig`, remove dead references, reconcile component documentation with `spec/data-model.md`, and apply prose formatting only in files already being substantively edited to avoid noisy bulk churn.

## Compliant / Good Patterns

- `spec/README.md` provides a clear specification index, source-of-truth hierarchy, reading order, and explicit rule that clinical safety takes precedence over features.
- `spec/npews-scoring-spec.json`, the generator, and the drift/freshness tests form a strong single-source-of-truth pattern for clinical numeric configuration.
- The tidied `spec/roadmap.md` now uses stable item codes, `[x]/[~]/[ ]` status markers, explicit priority, and separates delivered behaviour from unverified behaviour.
- `.github/dependabot.yml` has weekly npm updates, cooldowns, and grouped routine minor/patch updates matching `ci.md`.
- `package-lock.json` is committed, the package has no runtime dependencies, and development dependencies are correctly separated.
- `chart/styles.css` centralises semantic design tokens and preserves clinically mandated colour values; responsive modes and the NHS visual references are domain-specific rather than generic UI scaffolding.
- `.gitignore:26-29` excludes common environment-secret files.
- `s/up` and `s/down` are executable Bash entry points with strict mode, repository-root resolution, dependency preflights, and clear errors.

## Not Applicable

- Rust CLI, Cargo release, crate extraction, Homebrew/Scoop, and cargo-dist standards do not apply to this JavaScript Web Component.
- Tauri GUI standards do not apply.
- Presentation and reusable agent-skill standards do not apply.
- Documentation-site and Pages deployment standards do not currently apply because `spec/` is repository documentation rather than a generated docs site.
- Full distribution/release standards are deferred until roadmap R29-R33; the native `chart/` source must remain build-free even when distribution artifacts are introduced.

## Suggested First PR

1. Define the product/compliance boundary, add `SAFETY.md` and an initial hazard log, and create the first Must-requirement traceability table focused on scoring, escalation, skipped observations, and colour-dependent rendering.
2. Resolve the two known UI hazards in roadmap R13 and R14 and link their browser tests back to the hazard evidence.

## Suggested Second PR

1. Add deliberate licensing/provenance, `SECURITY.md`, `.editorconfig`, vendor-neutral agent instructions, and canonical `s/test`/generation-check scripts.
2. Add a SHA-pinned, least-privilege CI workflow that runs lockfile installation, unit/conformance tests, generation drift, REUSE, and Zizmor before visual-test CI is layered on.
