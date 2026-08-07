# Decision log

Durable decisions taken during the build, with rationale and where each is now
implemented/documented. Supersedes the old `queries.md` working notes. Newest first.

---

## D17 — Keep presentation options separate from clinical data

**2026-08-07.** `<npews-chart>` exposes assignable presentation settings through a separate `.options` object rather than adding them to `Patient`, `Observation`, or inferring them from missing data. `showDemographics` defaults to `true` for standalone use; an embedding host must explicitly set it to `false` when patient identification is already provided elsewhere. Data reassignment preserves the selected presentation options. Roadmap R23 will type and extend this object without changing that separation.

## D16 — Use fixed time windows; do not create an ED variant without evidence
**2026-08-06.** Remove the ineffective zoom, calendar-range, and “Jump to Present” buttons.
The component instead offers small text links for fixed windows ending at the latest observation,
which provide the functional ability to see fewer observations in more detail or more observations
in less detail required by `U3.1`:
1 week, 3 days, 24, 12, 8, 4, 2, and 1 hour. This covers the currently described Emergency
Department need for fewer observations consulted more frequently without introducing an
ill-defined ED-specific chart. A separate ED variant requires evidence of distinct clinical
semantics that cannot be met by these windows. Missing blood pressure in ED is not addressed by
rescaling or altering PEWS; it remains an explicit research question under R53.

## D15 — Build a composable NPEWS component, not a complete SPOT/NPEWS solution
**2026-08-06.** This repository owns the bounded scoring and observation-chart component. It
does not own observation entry, EPR records, persistence, audit, operational escalation,
reporting, hosting, training, support, or the supplier-level obligations in the national
procurement specification, and it must not independently claim complete National PEWS
compliance. Integrators can compose the component into a wider solution and are responsible for
the surrounding workflow and deployment controls. The component deliberately does not implement
the adjacent-form override in `C2.2`: exact calendar age selects the scoring band, while clinical
intuition or specific concern must be recorded transparently rather than expressed by changing
the scoring frame. Full scope, allocation matrix, permitted claims, and rationale are in
[`product-boundary.md`](./product-boundary.md). This decision narrows D11 to conformance within
the component's defined algorithm and rendering scope.

## D14 — Component source (`chart/`) separated from the demo harness (`demo/`)
**2026-07-03.** The single `pews-chart/` folder was split into `chart/` (the reusable
component: scorer, config, age-band maths, canvas engine, chart shell, `<npews-chart>`
element, FHIR adapter, styles) and `demo/` (harness, example pages and scenario/demo data).
This makes the shippable surface obvious and keeps demo-only data out of the component.
Demo pages import the component with paths relative to the served demo root (`./chart/…`). The
dev server mounts `demo/` at the served root and `chart/` as a subdirectory (see
`docker-compose.yml`), so `http://localhost:8000/` renders the demo (not a directory listing)
and `./chart/…` resolves to `/chart/…`. The same paths also retain the GitHub Pages project
base (`/digital-pews/`). Demo app URLs are unchanged by the split: `/demo.html` (harness), `/`
(single chart), `/embed-example.html`.

## D13 — Chart packaged as a framework-neutral Web Component (not React)
**2026-07-02.** The chart ships as a standards-based `<npews-chart>` custom element with no
runtime framework dependency; optional thin framework wrappers are allowed but the core never
requires one. React was considered (team familiarity from the Digital Growth Charts) but
rejected: dGC benefits from React because it renders declarative SVG (Victory), whereas this
chart is an imperative canvas engine, so React would wrap the shell without simplifying the
hard part. A distribution-only build (NPM/UMD + SRI CDN bundle) is acceptable; the source
stays unbuilt. Rationale + alternatives in [`react.md`](./react.md). Implemented in
`chart/npews-chart.js`.

## D12 — Storybook removed in favour of a bespoke demo harness
**2026-07-02.** Storybook was only ever a static-page host here (no controls, Chromatic never
wired). A dependency-free harness (`demo/demo.html` + `demo.js`, scenarios in
`scenarios.js`) demonstrates the same "stories" without a build tool or SaaS — on-message for
a vendor-neutral, anti-lock-in NHS pitch. Visual regression, when wanted, will be PNG
baselines captured via browser automation (e.g. Playwright `toHaveScreenshot`), not a hosted
service.

## D11 — Conform, don't extend
**2026-06-30, reaffirmed 2026-07-02 and scoped by D15 on 2026-08-06.** Within the component's
defined responsibilities, the tool implements the national NPEWS scoring algorithm and chart
semantics without locally invented scoring behaviour. Algorithmic deviations are clinical-safety
issues. This principle governs D10; D15 separately defines which complete-solution workflow
requirements are outside the component or deliberately excluded.

## D10 — Temperature and AVPU are not numerically scored (conformant mode)
**2026-06-30, AVPU reconfirmed 2026-07-02** against the published PEWS PDFs and specs. Only
Respiratory Rate, Respiratory Distress, SpO₂, O₂ device, O₂ level, Heart Rate, systolic BP and
Capillary Refill contribute to the numeric total. Temperature (sepsis trigger ≥38/<36) and
AVPU (specific-concern trigger: V → escalate, P/U → escalate higher) drive **escalation only**.
No "augmented" scoring mode. Implemented in `chart/npews-scorer.js`; documented in
[`npews-scoring.md`](./npews-scoring.md) and [`escalation.md`](./escalation.md).

## D9 — JSON is the canonical scoring source of truth
**2026-06-30.** `npews-scoring-spec.json` is the single source of truth for every numeric
threshold. A generator (`npm run generate:scoring`) produces both the runtime bands
(`chart/npews-scoring-config.js`) and the human-readable
[`npews-scoring-tables.generated.md`](./npews-scoring-tables.generated.md); drift tests fail if
they diverge or if the committed artifacts are stale. Structured-data-as-truth was chosen over
markdown-as-truth for a safety tool (least drift). Prose lives in
[`npews-scoring.md`](./npews-scoring.md) as clinical narrative only.

## D8 — Scoring thresholds corrected to match the authoritative charts
**2026-06-30 (clinical safety).** Three of the four age bands (0-11m, 1-4y, 13+y) had scoring
thresholds in the runtime config that disagreed with the national charts; only 5-12y matched.
All were corrected and are now generated from the canonical JSON, which was manually verified
against the live NHS England NPEWS charts (Marcus Baw, GMC 4712729).

## D7 — Scores are always computed, never authored
**Session 2.** The chart calls `scoreObservationsForPatient(patient, observations)` on render;
any `pewsTotal`/`escalationLevel` in the input is ignored and overwritten (single source of
truth). FHIR fixtures retain stored totals for interop fidelity — the conformance tests derive
independently and compare (see [`fhir.md`](./fhir.md)).

## D6 — Canonical age bands derived from date of birth
**Session 2 (clinical safety).** The applicable band is derived per observation from
`patient.dob` + the observation timestamp using **calendar completed years**
(`chart/age-band.js`), not a hand-set string and not `days/365.25` (which mis-fires around
leap-year birthdays). Bounds are half-open year intervals, canonical in
`npews-scoring-spec.json` (`ageBandBounds`): `0-11m`=[0,1), `1-4y`=[1,5), `5-12y`=[5,13),
`13+y`=[13,∞) — every boundary lands on an exact birthday. `patient.ageBand` is a
display/fallback hint used only when `dob` is absent.

## D5 — Seamless age-band boundary crossing
**Session 2.** When an admission spans a birthday the chart JOINS the two age-band charts
rather than stopping one and starting another: one continuous trend line on a unified y-scale
(the union of the spanned ranges), with the coloured scoring-band backgrounds segmented in time
at the exact birthday instant, a dashed divider, and a `→ <band>` marker on the PEWS row. Only
RR/HR/BP thresholds differ across bands, so SpO₂/O₂/temperature show no visible seam.

## D4 — The visible time window must not affect the PEWS score
**Implementation.** The escalation banner and sticky footer always use the globally latest
observation set, never the latest observation visible in the selected time window. See
[`implementation-notes.md`](./implementation-notes.md#RCPCH1.1).

## D3 — Colour-blindness: follow WCAG 2.2 (RCPCH 1.1)
**Implementation.** SPOT NPEWS mandates a colour-blindness-friendly design without prescribing how; we follow WCAG 2.2 where it does not conflict with PEWS colour semantics. The mandated band/escalation palette is never changed. The `.cb-mode` toggle and its CSS overrides have been removed because Canvas rendering did not read them; an evidenced accessible mode will be reintroduced under roadmap R14. See [`implementation-notes.md`](./implementation-notes.md).

## D2 — Dependencies current + Dependabot per house style
**Session.** All dependencies were upgraded to latest and Dependabot was configured following
the local house-style rules (cooldown windows, grouping).

## D1 — Pseudonymised data must never be published
Any pseudonymised or patient-derived row-level data is treated as identifiable and must not be
committed or published. Small random perturbations do not make a rich longitudinal record
synthetic: they preserve timestamps, trajectory shape, rare events, and cross-variable patterns
that may permit linkage or singling out. Public fixtures must be independently generated from a
documented synthetic scenario or pass a formal disclosure-risk review with recorded approval.
The assessed ED resource, cohort-level statistics, replacement strategy, and rules for any
controlled local robustness exercise are documented in
[`patient-derived-data-assessment.md`](./patient-derived-data-assessment.md).

---

## References to fold into the docs (follow-up)
- RCPCH UK Paediatric Early Warning Systems resource collection:
  <https://www.rcpch.ac.uk/resources/UK-paediatric-early-warning-systems#_1-what-other-resources-might-be-of-interest>
