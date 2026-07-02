# Decision log

Durable decisions taken during the build, with rationale and where each is now
implemented/documented. Supersedes the old `queries.md` working notes. Newest first.

---

## D13 — Chart packaged as a framework-neutral Web Component (not React)
**2026-07-02.** The chart ships as a standards-based `<npews-chart>` custom element with no
runtime framework dependency; optional thin framework wrappers are allowed but the core never
requires one. React was considered (team familiarity from the Digital Growth Charts) but
rejected: dGC benefits from React because it renders declarative SVG (Victory), whereas this
chart is an imperative canvas engine, so React would wrap the shell without simplifying the
hard part. A distribution-only build (NPM/UMD + SRI CDN bundle) is acceptable; the source
stays unbuilt. Rationale + alternatives in [`react.md`](./react.md). Implemented in
`pews-chart/npews-chart.js`.

## D12 — Storybook removed in favour of a bespoke demo harness
**2026-07-02.** Storybook was only ever a static-page host here (no controls, Chromatic never
wired). A dependency-free harness (`pews-chart/demo.html` + `demo.js`, scenarios in
`scenarios.js`) demonstrates the same "stories" without a build tool or SaaS — on-message for
a vendor-neutral, anti-lock-in NHS pitch. Visual regression, when wanted, will be PNG
baselines captured via browser automation (e.g. Playwright `toHaveScreenshot`), not a hosted
service.

## D11 — Conform, don't extend
**2026-06-30, reaffirmed 2026-07-02.** The tool implements exactly the national SPOT NPEWS
algorithm and adds nothing not in the source specification. A trust evaluating us against
Cerner will expect bit-for-bit NPEWS conformance, so any deviation is a hard objection. This
principle governs D10.

## D10 — Temperature and AVPU are not numerically scored (conformant mode)
**2026-06-30, AVPU reconfirmed 2026-07-02** against the published PEWS PDFs and specs. Only
Respiratory Rate, Respiratory Distress, SpO₂, O₂ device, O₂ level, Heart Rate, systolic BP and
Capillary Refill contribute to the numeric total. Temperature (sepsis trigger ≥38/<36) and
AVPU (specific-concern trigger: V → escalate, P/U → escalate higher) drive **escalation only**.
No "augmented" scoring mode. Implemented in `pews-chart/npews-scorer.js`; documented in
[`npews-scoring.md`](./npews-scoring.md) and [`escalation.md`](./escalation.md).

## D9 — JSON is the canonical scoring source of truth
**2026-06-30.** `npews-scoring-spec.json` is the single source of truth for every numeric
threshold. A generator (`npm run generate:scoring`) produces both the runtime bands
(`pews-chart/npews-scoring-config.js`) and the human-readable
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
(`pews-chart/age-band.js`), not a hand-set string and not `days/365.25` (which mis-fires around
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

## D4 — Zoom must not affect the PEWS score
**Implementation.** The escalation banner and sticky footer always use the globally latest
observation set, never the latest observation visible in the current zoom window. See
[`implementation-notes.md`](./implementation-notes.md#RCPCH1.1).

## D3 — Colour-blindness: follow WCAG 2.2 (RCPCH 1.1)
**Implementation.** SPOT NPEWS mandates a colour-blindness-friendly design without prescribing
how; we follow WCAG 2.2 where it does not conflict with PEWS colour semantics. The mandated
band/escalation palette is never changed; `.cb-mode` supplies higher-contrast overrides. See
[`implementation-notes.md`](./implementation-notes.md).

## D2 — Dependencies current + Dependabot per house style
**Session.** All dependencies were upgraded to latest and Dependabot was configured following
the local house-style rules (cooldown windows, grouping).

## D1 — Pseudonymised data must never be published
Any pseudonymised/dummy patient data is treated as identifiable and must not be committed or
published.

---

## References to fold into the docs (follow-up)
- RCPCH UK Paediatric Early Warning Systems resource collection:
  <https://www.rcpch.ac.uk/resources/UK-paediatric-early-warning-systems#_1-what-other-resources-might-be-of-interest>
