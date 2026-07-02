# Queries & Review Notes — returning to Digital PEWS

> Written after a "where are we?" review of `spec/roadmap.md` against the codebase.
> Date of review: 2026-06-30. Branch: `main`. There is a large body of **uncommitted**
> work in the tree (see §1). Items marked **❓Q** want a decision/answer from you.

---

## 0. TL;DR

- The chart UI itself is in good shape: all four age bands now render with full fictional
  scenarios, layout/zoom/colour-blind/skip/O₂-modality all work in `chart.js`.
- There are now **two parallel workstreams** in the tree, and only one of them is in the
  roadmap. The roadmap describes *Storybook parameterisation + visual regression*; the
  actual uncommitted work is a *FHIR interoperability + scoring + conformance-test* layer.
  **They don't reference each other.** (§1)
- **The single most important issue for an NHS pitch is clinical-safety, not features:**
  the scoring thresholds the live chart uses (`npews-scoring-config.js`) **do not match the
  authoritative `spec/npews-scoring.md` for 3 of the 4 age bands** (0-11m, 1-4y, 13+y).
  Only 5-12y matches. (§2) This must be resolved before the tool is shown as "the safe
  open-source option".
- A pile of docs/comments are now stale (CLAUDE.md, README, Documentation.stories.js,
  fhir-adapter.js header). (§5)

---

## 1. The roadmap and the codebase have diverged ❓Q

`spec/roadmap.md` (which you have **edited but not committed**) now reads as:
NPM updates → parameterise hard-coded chart values via Storybook controls/data model →
`argTypes` controls → edge-case stories → Chromatic/Percy visual regression.

But the **uncommitted files actually in the tree** are almost entirely a different effort:

| Uncommitted / untracked | Workstream |
|---|---|
| `pews-chart/fhir-adapter.js` | FHIR ⇄ chart-model adapter |
| `pews-chart/npews-scorer.js` | Pure NPEWS scoring functions |
| `test/` (3 suites, 111 passing + 6 todo) | Scorer + FHIR conformance/round-trip tests |
| `vitest.config.js`, `package.json` (vitest dep) | Test harness |
| `spec/fhir-chart-adapter.md`, `spec/fhir-pews-conformance-testing.md`, `spec/fhir-uk-core-mapping-draft.md` | FHIR specs |
| `reference-sources/fhir-*` notes | FHIR research |
| `s/csv-to-attendance-timeseries-json.py`, `s/sanitise-open-test-harness*.py`, `dummy-pews-data/` | Pipeline for real anonymised ED observation data |

**❓Q1.** Which workstream is the current priority — Storybook parameterisation (the
roadmap) or FHIR/scoring/real-data (the actual WIP)? For an NHS/Cerner-competitor pitch,
my instinct is FHIR interoperability + verified scoring matters far more than Storybook
controls, but the roadmap says the opposite. Should I rewrite `roadmap.md` to merge both
and re-prioritise?

> Both workstreams are current and important. The aim is to build a SMART-on-FHIR compatible PEWS charting tool. Storybook is part of the human design review process, to try to ensure we build something that is not just functional but beautiful. FHIR work may have been done in spare time and not added to roadmap properly yet, but it is still important. This is not really funded RCPCH work, however it could become funded if we can develop something attractive enough. GESH seem keen to use an open-source, vendor-neutral product, however there is often pressure to use a vendor's proprietary solution.

**❓Q2.** All of the above is uncommitted. Do you want it committed (and the python
data-pipeline + `dummy-pews-data/` reviewed for what's safe to commit) before we go
further? `dummy-pews-data/` is now git-ignored, but the `s/sanitise-*` scripts and CSVs
suggest real patient-derived data is being handled — worth confirming the
anonymisation/governance story before anything lands in history.

> I think owing to the very early development stage there were lots of loose ends. We have a stream making a coherent visual chart out of a vague spec, we have a stream of FHIR work that is not yet integrated, and we have a stream of pseudonymised testing data which we can use locally but we MUST NOT PUBLISH. It is quite anonymous, but given that re-identification of rich data is likely to be possible, we must treat it as such. I'm hoping today's session can start to bring all this together into a more coherent whole

---

## 2. ⚠️ CLINICAL SAFETY — scoring thresholds disagree with the spec (highest priority)

`pews-chart/npews-scoring-config.js` drives both the **coloured bands drawn on the chart**
and (via `npews-scorer.js`) the **computed PEWS score**. It diverges from the authoritative
`spec/npews-scoring.md` for **three of four age bands**. Only **5-12y** matches.

`npews-scorer.js`'s own header and the tests only admit discrepancies for **0-11m and 1-4y**
— the **13+y divergence appears to be unnoticed**.

Concrete examples (config → what spec says it should be):

**0-11 months — Respiratory Rate**
- Config: `<20 = Pink(4)`, `20-24.99 = Orange(2)`, `25-60.99 = White(0)`, `61+ = Orange(2)`.
- Spec:   `<10 = Pink`, `10-19.99 = Orange`, `20-29.99 = Yellow`, `30-49.99 = White`, `50-59.99 = Yellow`, `60-69.99 = Orange`, `70+ = Pink`.
- Effect: config **under-scores** a tachypnoeic infant (e.g. RR 55 scores 0 in config, should be Yellow/1; RR 70 scores 2, should be Pink/4) and **over-scores** the low end. Whole Yellow band is missing.

**0-11 months — Heart Rate**
- Config white band runs `110-160.99`; spec white is `110-149.99`. So HR 150-160 scores 0 instead of Yellow/1 (under-scoring). Lower bands also shifted (config `80-89.99` = Pink vs spec Orange).

**1-4 years — Respiratory Rate**
- Config: `40+ = Orange(2)` for everything above 40. Spec: `40-49.99 = Yellow`, `50-59.99 = Orange`, `60+ = Pink`. A 1-4y child with RR 65 scores Orange/2 in config but should be Pink/4.

**1-4 years — Heart Rate**
- Config white `100-140.99` vs spec white `90-139.99`; multiple band edges differ.

**13+ years — Respiratory Rate** (not currently flagged anywhere)
- Config: `<8 Pink`, `8-11.99 Yellow`, `12-20.99 White`, `21-24.99 Yellow`, `25-29.99 Orange`, `30+ Pink`.
- Spec (13-18): `<10 Pink`, `10-14.99 Yellow`, `15-24.99 White`, `25-29.99 Yellow`, `30-39.99 Orange`, `40+ Pink`.
- These look like they may have come from an **adult NEWS2-style** source rather than NPEWS. HR and BP top bands for 13+y also differ from spec.

> You are right, these discrepancies are top priority to resolve and fix. Can we identify if one of the source documents is the cause of these discrepancies? We were given a dump of source documents in a variety of formats, some were pretty unimpressive for supposed clinically-robust specification. Let's check which docs are bringing the errors. Let's triple check by finding NPEWS online spec as well and triangulate that.
> If there is a culprit document then a) we can remove it and check through spec that we don't use any of its erroneous references b) I will flag it to the authors that there are errors. Then we review and continue with this project.

> **Findings (investigated & actioned, 2026-06-30 PM):**
> **There is no culprit source document — the error was in our code.** I extracted and
> compared all four authoritative sources and they *agree with each other*:
> - `reference-sources/Configuration Document for SPOT NPEWS.pdf` (the NHSE source),
> - the four published `pews-observation-and-escalation-chart-*-updated.pdf` charts,
> - the official NHS England NPEWS page (web-verified: 0-11m RR 20–29 → 1, HR 90–109 → 1),
> - and `spec/npews-scoring.md`, which is a **faithful transcription** of the above.
>
> The wrong values lived **only** in `pews-chart/npews-scoring-config.js` (a bad hand
> transcription, despite its comment claiming extraction from the chart PDFs). 0-11m, 1-4y
> and 13+y RR/HR/BP bands were wrong (13+y looked NEWS2-flavoured); 5-12y was already
> correct, as was 0-11m BP.
>
> **Done:** corrected all wrong bands in `npews-scoring-config.js` to match the
> Configuration Document; updated the scorer’s stale discrepancy comment; replaced the
> "DISCREPANCY" tests with spec-correct expectations; added
> `test/scoring/config-matches-spec.test.js` — an **independent** copy of the authoritative
> thresholds (24 assertions) that fails if the config ever drifts again. Full suite: 137
> passing. So: **nothing to flag to the source authors** — the published spec is sound. The
> only caveat is the small boundary/overlap wording you noticed in `npews-scoring.md`
> (e.g. the 94.99↔95 SpO2 gap); see the representation question below.

**❓Q3.** Is `spec/npews-scoring.md` the authoritative source of truth? If yes, the
0-11m, 1-4y and 13+y bands in `npews-scoring-config.js` need correcting to match it (I can
do this and add a test that asserts config == spec for every band, so they can never drift
again). If `npews-scoring.md` is itself out of date vs the official RCPCH/NHSE
configuration document, point me at the correct source and I'll reconcile against that
instead.

> I am manually reviewing the entirety of `npews-scoring.md` against the published NHSE charts. It is going to be the source of truth, as long as it makes sense technically to be able to derive the scoring rules from markdown. In my review of `npews-scoring.md`, I found a number of small discrepancies between the markdown and the published NHSE charts, mainly around overlap of values used for scoring. I think there is a better way to represent this data in a table that shows the physiological parameters as rows, with linear intervals between them, and their corresponding scoring values, with ALL the age ranges as columns on the same table. This will make it easier to understand and compare the scoring rules for different age groups and physiological parameters.

**❓Q4.** Temperature and AVPU/consciousness: `npews-scoring.md` has **no Temperature and
no AVPU scoring tables at all**, yet the config scores temperature (`38=1, 39=2, 40+=4`)
and the scorer scores AVPU (`V=2, P/U=4`). Where did those rules come from, and are they
correct? (See also Q5 — AVPU may not be a points parameter at all.)

> I don't know where these came from, will have to review the sources.

**❓Q5.** AVPU modelling. `spec/escalation.md` treats an AVPU change as a **"Specific
Concern" that overrides the escalation level** (V → Medium, P/U → High/Emergency), *not* as
points added to the PEWS total. But `npews-scorer.js` **adds** AVPU as numeric points
(V=2, P/U=4) to the total. Is AVPU a scoring parameter, an escalation override, or both?
Right now we risk double-counting or mis-escalating.

> AVPU is used for both scoring and escalation. It contributes to the overall NPEWS score, which has the advantade of enabling us to track deterioration (or improvement) over time. And it adds hard thresholds to the escalation process.

---

## 3. The scorer and FHIR adapter aren't wired into the running chart ❓Q

- `index.html` only loads `npews-scoring-config.js → demo-data.js → chart.js`.
  `npews-scorer.js` and `fhir-adapter.js` are **not loaded by the app** — they exist purely
  for the test suite.
- `chart.js` **displays** `obs.pewsTotal` / `obs.escalationLevel` straight from the data;
  it does **not compute** them. So scores shown on screen are whatever was hand-typed into
  `demo-data.js` / the story arrays.
- Those hand-typed scores are **not cross-checked against `npews-scorer.js`**. Spot-checking
  the 13+y story (`AgeBands.stories.js` obs-3: RR22, NP@24%, temp 38.1, mild distress) the
  hand-typed `pewsTotal: 2` doesn't reconcile with the scorer's component logic. With the
  config also being wrong (§2), there are effectively three different "scores" floating
  around (hand-typed, scorer-from-config, spec-correct).

**❓Q6.** Target architecture: should the chart **compute** PEWS via `npews-scorer.js`
(single source of truth, scores never hand-typed), with `demo-data.js`/stories carrying
only raw observations? That would also let a test assert "every fixture's hand-typed score
== scorer output" and kill this whole class of bug. I'd recommend yes.

> Always single source of truth. Scores are never hand-typed, always calculated. Chart should always compute PEWS,

---

## 4. Roadmap item-by-item status vs the code

| Roadmap item | Status | Notes |
|---|---|---|
| All NPM packages updated | ❌ Not done | Storybook `8.6.18` → latest `10.4.6` (**2 majors behind**); Vite `6` → `8`; vitest `4.1.5`→`4.1.9`. `@storybook/addon-essentials` is in `package.json` but folded into core in SB8/9 — needs review on upgrade. |
| Parameterise hard-coded chart values | 🟡 Partial | Patient/observations/age-bands **are** parameterised — `NPEWSChart.init(patient, observations, ageBands)` and stories use it. **Still hard-coded:** escalation thresholds/actions (`ESCALATION_META`), layout heights, colour-blind toggle, show-values, zoom step, time range, O₂ modality handling, NHS logo (absent), helper/explanatory text. None are exposed as Storybook controls or config inputs. |
| Priority 2 — `argTypes` interactive controls | ❌ Not done | No story uses `args`/`argTypes`. `preview.ts` configures control *matchers* but nothing drives them. Stories build the DOM and call `init()` directly. |
| Priority 3 — edge-case stories | 🟡 Partial | Skipped obs (`procedure`), O₂ % → L/min transitions, deterioration **and** recovery all appear *inside* the per-band scenarios. But there are **no dedicated, labelled edge-case stories** (skip, modality change, missing-data, rapid deterioration, recovery) as the roadmap asks. |
| Priority 4 — Chromatic/Percy visual regression | ❌ Not done | Only referenced as a TODO in `spec/rcpch-implementation-spec.md`. |
| (old Priority 1 — fictional data for all age bands) | ✅ Done | You removed this from the roadmap; it's genuinely complete now — `AgeBands.stories.js` has Alex Thompson (5-12y), Zara Okafor (0-11m), Jamie Osei (1-4y), Morgan Clarke (13+y). **But the docs didn't get the memo — see §5.** |

**❓Q7.** Priority 2 (`argTypes`) and the current story architecture conflict: stories
hand-build the full `index.html` body and call `init()`. Real interactive controls would
mean a single parametric story whose `args` feed `init()` and toggle body attributes. Do
you want me to refactor the stories that way, or keep per-scenario stories and add controls
only where cheap?

> I am leaning towards refactoring the stories to use a single parametric story with `argTypes`, but not 100% sure yet.

---

## 5. Stale documentation / comments (low-risk, quick fixes)

- **`CLAUDE.md` and `README.md`** both still say *"Currently only 5-12y has complete demo
  data; the other three age bands have placeholder Storybook stories."* — no longer true
  (all four bands have full data, §4).
- **`Documentation.stories.js`** states layout chart heights of **180 / 140 / 100** px.
  The actual values in `chart.js` (`LAYOUT_CHART_HEIGHTS`) are **140 / 90 / 70** (which is
  what CLAUDE.md and README say). The Documentation story is wrong.
- **`Documentation.stories.js`** references `apps/chart-ui/README.md` — that path doesn't
  exist (the app lives in `pews-chart/`).
- **`fhir-adapter.js`** header says *"Status: Phase 1 skeleton — functions are stubbed."*
  They're fully implemented and the suite passes (111 tests). Comment is stale.
- **`fhir-chart-adapter.md`** still says scores are recomputed nowhere in the adapter (a
  non-goal) — consistent with §3, but worth confirming that stays the intent once the
  scorer is wired into the UI.

**❓Q8.** Happy for me to fix all of §5 in one tidy-up pass? They're harmless individually
but collectively make the repo look unmaintained to an evaluating trust.

> fix all please

---

## 6. Test / quality gaps (informational)

- 6 `.todo` round-trip tests (FHIR → Chart → FHIR) in `roundtrip.test.js` are still pending.
- No tests exercise `chart.js` rendering (canvas) — understandable, but a visual-regression
  pass (roadmap Priority 4) would cover this.
- No test currently asserts `npews-scoring-config.js` matches `npews-scoring.md`. Adding one
  would have caught §2 immediately; I'd add it as part of fixing the bands.

> yes we need a way to assert the scoring config matches the scoring spec. Will we need to express the spec in some specific way to make it more easily computable?

---

## 7. Suggested next moves (for your sign-off)

1. **Decide the scoring source of truth (Q3/Q4/Q5)** and fix the 0-11m / 1-4y / 13+y bands,
   guarded by a config-vs-spec test. *(Clinical safety — do first.)*
2. **Decide the scoring architecture (Q6):** compute scores in-app via `npews-scorer.js`
   rather than hand-typing them.
3. **Re-baseline the roadmap (Q1):** merge the FHIR/real-data workstream into it and
   re-prioritise for the NHS pitch.
4. **Commit the WIP safely (Q2)**, after the governance check on the data pipeline.
5. Then the original roadmap features: NPM upgrade, `argTypes` controls, labelled edge-case
   stories, Chromatic.
6. Doc tidy-up (Q8) — can ride along anytime.

> Looks good to me, do it.

---

### Answer me inline
Drop your answers under each **❓Q** (or just reply in chat) and I'll action them.


### Additional (from Marcus)
I found a trove of relevant papers referenced here:
https://www.rcpch.ac.uk/resources/UK-paediatric-early-warning-systems#_1-what-other-resources-might-be-of-interest
We should pull the links into the documentation for this work

---

## 8. New decisions needed before wiring scores into the chart (2026-06-30 PM)

The scoring-config fix is done. Two decisions now gate the "chart always computes PEWS"
work (because they change what the computed total *is*):

**❓Q9 — Temperature & AVPU conformance (clinical).**
The national SPOT NPEWS Configuration Document scores **only**: Respiratory Rate, Respiratory
Distress, SpO2, O2 device, O2 level, Heart Rate, Systolic BP, Capillary Refill. It does
**not** assign points to Temperature or AVPU — temperature is a sepsis/escalation trigger
(≥38 or <36) and AVPU is a "Specific Concern" escalation trigger (V → one level, P/U →
higher). Our code currently **adds points** for temperature (38=1, 39=2, 40+=4) and AVPU
(V=2, P/U=4), which has no basis in any source doc.

You answered (Q5) that you *want* AVPU to contribute to the total. That's a deliberate
**deviation from the national NPEWS algorithm**. Implications to weigh:
- A trust evaluating us against Cerner will likely expect *bit-for-bit* NPEWS conformance.
  If our total differs from the official chart for the same obs, that's a hard objection.
- Options: (a) **Conformant mode** — temp/AVPU recorded & drive escalation only, not the
  numeric total (matches national standard); (b) **Augmented mode** — keep them in the
  total as you described, but label the score clearly as "RCPCH-augmented", not "NPEWS";
  (c) make it a **config flag** so a trust can choose. My recommendation: default to (a)
  for the pitch, offer (c) for flexibility. **Which do you want?**
- Same question applies to temperature points (where did 38=1/39=2/40+=4 even come from? —
  not in any source we hold).

> **ANSWER (Marcus): Conformant — we don't add anything not in the original spec.**
> **DONE:** temperature and AVPU removed from the numeric total in `npews-scorer.js`
> (they're no longer in the score breakdown at all). Temperature also removed from the
> *scoring* bands in config (it keeps DISPLAY config — the hot/cold zones still render via
> `tempOverlays`); the chart temperature row now shows a neutral background with red ≥38 /
> blue <36 zones instead of yellow/orange/pink scoring bands. AVPU cells still render their
> escalation-cue colours (A white, V orange, P/U pink) but contribute 0 to the score.
> Scorer/conformance tests updated; `skip-reasons-0-11m` fixture stored total corrected
> 2→1 (its 38.2°C no longer adds a point). Escalation-from-triggers (temp ≥38/<36, AVPU
> V/P/U) is a separate, not-yet-built concern — flagged for the escalation-logic work.

**❓Q10 — Canonical representation of the scoring spec (engineering).**
You want `npews-scoring.md` as the source of truth, a unified params×age-bands table, and it
to be "computable" so config can be checked against it. Right now the drift guard
(`test/scoring/config-matches-spec.test.js`) holds an *independent hand copy* of the
thresholds — safe, but it's a second place to maintain. Cleaner end-states:
- **(A) Markdown is truth:** I restructure `npews-scoring.md` into one strict, parseable
  table per parameter (age bands as columns) and the test *parses the markdown* and asserts
  config matches. You edit markdown; code is checked against it.
- **(B) Structured data is truth:** one canonical `npews-scoring-spec.json`; we *generate*
  both the runtime config bands and the human-readable unified markdown table from it.
  Most robust, least drift, but you edit JSON not prose.
I lean **(B)** for a safety tool, with the generated markdown table for human/clinical
review. **Which do you prefer?** (I left your hand-edited `npews-scoring.md` untouched so as
not to clash with your manual review.)

> **ANSWER (Marcus): (B) — JSON canonical data.**
> **DONE:** created `spec/npews-scoring-spec.json` as the single source of truth for the
> numbers. A generator (`scripts/generate-scoring.mjs`, pure logic in
> `scripts/scoring-spec.mjs`, `npm run generate:scoring`) produces BOTH:
> 1. the runtime scoring bands in `pews-chart/npews-scoring-config.js` (now a marked
>    `SCORING_BANDS_BY_AGE` generated block; display config stays hand-authored), and
> 2. a unified params×age-bands table at `spec/npews-scoring-tables.generated.md`.
> The drift guard no longer holds a hand copy — it builds expectations from the JSON via the
> same builder the generator uses, and a second test fails if the committed artifacts are
> stale (i.e. JSON edited but `generate:scoring` not run). `npm run generate:scoring:check`
> gives a CI-friendly staleness check. Your annotated `spec/npews-scoring.md` is preserved
> as the clinical narrative (resp-distress descriptors, notes, your GMC sign-off) with a
> banner pointing at the canonical JSON. Full suite green: 144 passing + 6 todo.

**FYI (no decision needed now):** two boundary nuances in the spec worth a later pass —
the SpO2 94.99↔95 gap, and the note "O2 support under 16%/0.01 should still score 1" which
our `0–15.99% → 0` band doesn't honour for a child actually on low-flow support (the scorer
mitigates this via `oxygenDevice`, but it's worth tightening).

---

## Session 2 — canonical age bands, scorer wiring, seamless boundary crossing

These are **decisions taken** during the implementation, not open questions. Recorded here
so the rationale is discoverable.

**Canonical age bands by date of birth (clinical safety).**
The applicable age band is now derived from `patient.dob` + each observation's timestamp,
not a hand-set `patient.ageBand` string. Bounds are half-open year intervals, canonical in
`spec/npews-scoring-spec.json` (`ageBandBounds`) and generated into `AGE_BAND_BOUNDS` in the
config: `0-11m`=[0,1), `1-4y`=[1,5), `5-12y`=[5,13), `13+y`=[13,∞). All boundaries fall on
exact birthdays.

> **Why calendar completed-years, not `days/365.25`.** Band selection uses
> `pews-chart/age-band.js → completedYears(dob, at)`, which compares calendar month/day so
> the band flips on the *exact* birthday. A day-based approximation drifts around leap years
> (a child born 2021-01-01 is ~4.999 "day-years" old on their 5th birthday and would be
> mis-banded). Feb-29 births normalise their birthday to Mar-1 in non-leap years. `ageBand`
> is kept as a display/fallback hint only (used when `dob` is absent).

**Scores are always computed (single source of truth).**
`chart.js` is now an ES module that calls `scoreObservationsForPatient(patient, observations)`
on init; any `pewsTotal` / `escalationLevel` present in the input is ignored and overwritten.
Hand-typed scores were removed from `demo-data.js` and `AgeBands.stories.js`. FHIR fixtures
keep their stored totals for interop fidelity (the scorer derives its own and the conformance
tests compare).

**Seamless boundary crossing (the UX the spec couldn't do on paper).**
When an admission spans a birthday the chart JOINS the two age-band charts rather than
stopping one and starting another: one continuous trend line on a **unified y-scale** (the
union of the spanned bands' ranges) with the coloured **scoring-band backgrounds segmented in
time** at the exact birthday instant, plus a dashed divider and a `→ <band>` marker on the
PEWS row. Only RR / HR / BP thresholds differ across bands, so SpO2 / O2 / temperature show no
visible seam. Demonstrated by the new Storybook story *"Birthday Crossing (turns 5
mid-admission)"* — identical vitals score PEWS 1 in the 1-4y band and PEWS 0 in 5-12y across
the midnight seam.

**Module conversion (latent bug fixed).**
The Q10 refactor added an ES `export` to `npews-scoring-config.js`, but `index.html` and the
stories loaded it as a *classic* `<script>` (Storybook `staticDirs`, untransformed) — a
top-level `export` in a classic script is a SyntaxError, so the browser runtime was silently
broken. Fixed by making `chart.js` a module that imports its config / scorer / age-band deps;
`index.html` and the stories now load `chart.js` (and `demo-data.js`) as `type="module"`.

---

## Session 3 (2026-07-02): remove Storybook, bespoke demo harness, props-driven chart

**Decision — Storybook removed.** After weighing Storybook/Chromatic against a
dependency-free harness for a vendor-neutral, NHS-positioned tool, Marcus chose to drop
Storybook. Rationale: Storybook was only ever a static-page host here (no `argTypes`/controls,
Chromatic never wired up), and a bespoke harness demonstrates the same "stories" to a clinical
audience without adding a build tool or a SaaS dependency — which is on-message for an
anti-lock-in pitch. Visual regression, when we want it, will be PNG baselines captured with
browser automation (e.g. Playwright `toHaveScreenshot`) rather than a hosted service.

**What replaced it.**
- `pews-chart/scenarios.js` — canonical `SCENARIOS` catalogue (the former stories as plain
  `{ id, title, ageBand, description, patient, observations }` objects). Verified parity with
  the deleted `AgeBands.stories.js` (same 5 patients / DOBs). Observations carry raw vitals
  only; scores are computed.
- `pews-chart/demo.html` + `demo.js` + `demo.css` — a left-sidebar scenario picker. Selecting a
  scenario mounts a fresh chart shell and calls `render({ patient, observations })`.
  Deep-linkable via the URL hash (`demo.html#birthday-crossing`).
- `pews-chart/chart-shell.js` — the shared chart DOM scaffold (`mountChartShell`) used by both
  `index.html` and `demo.html` so they can't drift; the patient header is intentionally EMPTY
  and populated by `chart.js` from the patient object.

**Data / presentation split completed.**
`chart.js` is now a pure visualisation device: `render({ patient, observations })` is the entry
point, the patient header is data-driven (name/DOB/meta populated from the patient object, age
computed from DOB), and there is **no auto-init off window globals** — nothing renders until a
host passes in its data. `index.html` was refactored to mount the shell and call `render`
explicitly (its hardcoded "Alex Thompson" header markup is gone).

**Verification.** vitest 176 passing + 6 todo (unchanged); `generate:scoring:check` clean.
Rendered `demo.html`, `index.html` and `demo.html#birthday-crossing` in headless Chrome — the
sidebar, data-driven header, computed PEWS scores and the seamless birthday seam
(`1 1 1` in 1-4y → `→ 5-12 Years` → `0 0 0` in 5-12y) all render correctly.

**❓Q — CLAUDE.md "script load order" hard constraint is now stale (for you, Marcus).**
`CLAUDE.md` still lists as hard-constraint #7 *"Do not change script load order"* with
*"Files use global scope, not ES modules"*. That stopped being true in session 2 (the module
conversion): `chart.js` is an ES module that imports its config/scorer/age-band deps, and both
entry points load it as `type="module"`. I updated the Storybook-related parts of `CLAUDE.md`
but left the hard-constraints list alone rather than silently rewriting a "never violate" rule.
Please confirm and I'll reword constraint #7 (e.g. "load `pews-chart/` as native ES modules; no
bundler/transpiler") and the "Script load order" block.

**❓Q — still open from session 1:** does AVPU contribute to the **numeric** PEWS total?
`plan.md` (Decisions) says *"AVPU contributes to BOTH the PEWS total AND escalation
thresholds"*, but the Q9=CONFORMANT decision removed AVPU from the numeric total (it still
drives escalation). These contradict. The scorer currently EXCLUDES AVPU from the total. Please
confirm which is correct against the NHSE spec so I can align the scorer + docs.

---

## Session 3 addendum (2026-07-02): React discussion → framework-neutral Web Component

**Decision — the chart is packaged as a framework-neutral `<npews-chart>` Web Component
(not a React component).** After the `spec/react.md` discussion (grounded in the real RCPCH
Digital Growth Charts library — Victory/SVG, Rollup, UMD+SRI CDN, typed props — versus our
imperative canvas engine of ~1750 lines / ~280 `ctx.*` calls), Marcus chose the recommended
Web Component route. Key reasoning: React helped the dGC because its rendering is *declarative
SVG*; ours is *imperative canvas*, so React would wrap the shell but not simplify the hard 90%.
A standards-based custom element gives the dGC ergonomics ("include an element, pass it data")
without forcing a framework on NHS consumers — a stronger anti-lock-in story for the GESH pitch.

**Answers Marcus gave at the end of `spec/react.md` that drove the build:**
- First real consumer = **GESH on Oracle via SMART-on-FHIR** (embeds in its own EHR iframe, so
  light DOM is sufficient for Phase 1 — the iframe already isolates styles/DOM).
- "One stack with the dGC" is a nice-to-have, not a requirement → Web Components are fine.
- A build step is acceptable **for distribution only** (Phase 2 CDN bundle), source stays unbuilt.
- Softening the old "no framework" hard constraint to *framework-neutral core + optional
  wrappers* = **yes**.

**What was built (Phase 1).**
- `pews-chart/npews-chart.js` — the `<npews-chart>` custom element. Light DOM, no engine
  changes. `.data = { patient, observations }` property (plus `.patient` / `.observations`
  convenience setters). Self-provisions `styles.css` (resolved via `import.meta.url`) + Lato
  fonts so it is a genuine one-import drop-in.
- `pews-chart/embed-example.html` — a minimal self-contained drop-in that links **no** chart
  stylesheet and calls **no** rendering API; it just loads the module and sets `.data`.
- `index.html` / `demo.js` / `demo.html` now consume the element; `styles.css` gets a
  `display:block` rule for the element (custom elements default to `display:inline`).

**Colour-race gotcha (fixed).** The engine reads the clinically-mandated band/escalation
colours from CSS custom properties at *canvas render time*. The element injects `styles.css`
asynchronously, so an early first paint drew with non-spec fallback colours (vivid magenta
instead of `--band-pink`). Fixed: `ensureStyles()` returns a promise that resolves only after
the stylesheet `<link>` has loaded (and `document.fonts.ready` settles, raced with a 1500 ms
timeout); the element awaits it before mounting + rendering. Re-verified in headless Chrome —
`index.html`, `embed-example.html` and the demo harness all draw the correct pastel bands and
the full escalation-coloured PEWS row.

**Phase 2 (deferred, tracked in `spec/roadmap.md`).** Shadow-DOM isolation, multiple instances
per page (retire fixed DOM ids + the global resize listener), an NPM package + UMD/CDN bundle
with Subresource Integrity (mirroring the dGC recipe), and published TypeScript prop types.

**✅ Resolved — CLAUDE.md "script load order" staleness (the session-3 ❓ above).** Since the
constraint was demonstrably false after the module conversion and I was already rewriting
`index.html`/`CLAUDE.md` for the element, I reworded it factually rather than leave a false
"never violate" rule: the "Script load order (must not change)" block is now a "Module
dependency graph", hard-constraint #7 now describes the ES-module dependency order, #3 is
softened to "keep the runtime framework-neutral", and #4 now allows a distribution-only build.
Shout if you'd rather I phrase any of these differently.

**❗ Still open — AVPU in the numeric PEWS total (unchanged from session 1).** `plan.md` says
AVPU contributes to BOTH the numeric total AND escalation; the Q9=CONFORMANT decision + the
current scorer EXCLUDE it from the numeric total (it still drives escalation). Please confirm
against the NHSE spec so I can align scorer + docs.
