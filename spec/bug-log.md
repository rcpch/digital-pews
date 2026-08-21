# Bug log

Findings awaiting review. Raised 2026-08-21 during the R11 source-derived scorer vector work.

Each `B-*` finding is pinned by a characterisation test in [`test/scoring/scorer-source-vectors.test.js`](../test/scoring/scorer-source-vectors.test.js). Those tests assert **current** behaviour so that any change is deliberate and visible. They are explicitly not an endorsement that the current behaviour is clinically correct.

Nothing in this log has been clinically reviewed. `B-01`, `B-02`, `B-05` and `B-06` change numeric PEWS output if resolved, so they are clinical-behaviour decisions, not refactors.

## Scorer findings

All six share one root cause: `scoreFromBands` and `scoreOxygen` in [`chart/npews-scorer.js`](../chart/npews-scorer.js) return `0` when no rule matches. A score of `0` is also the legitimate value for a normal observation, so an unmatched, malformed or unrecorded input is indistinguishable from a normal one. Every failure below therefore resolves towards *falsely reassuring*.

| ID | Finding | Current behaviour | Why it matters |
| --- | --- | --- | --- |
| B-01 | The canonical bands are not contiguous. Upper bounds use `.99` style values (`[0, 9.99, 4]` then `[10, 19.99, 2]`), leaving the open interval `(9.99, 10)` undeclared. | Scores `0`. | Unreachable for integer-valued vitals, but reachable for any parameter a device reports with more than two decimal places. Both neighbouring bands may score above `0`. |
| B-02 | A value beyond the outermost declared bounds matches no band. | Scores `0`. | `oxygenDeliveryLpm` tops out at `[6, 20, 4]`, so a level device charted at 25 L/min scores `0` rather than `4`. A unit-confusion or transcription error reads as "normal". |
| B-03 | `scoreObservation` performs no numeric validation, unlike `deriveNonScoreEscalation` which throws on unknown `avpu`, `newSepsisSuspicion` and non-finite `temperature`. | `NaN` and `Infinity` score `0` silently. | `NaN` fails every `>=` / `<=` comparison, so a corrupt reading is silently absorbed into the total. |
| B-04 | The canonical spec records that capillary refill 2.01-2.99s has no defined score. | `scoreCrt` resolves the hole downwards to `0`. | A known specification hole is currently closed by implementation accident rather than by decision. |
| B-05 | `scoreOxygen` requires `LEVEL_DEVICES.has(device) && delivery`. | A level device with `oxygenDelivery: null` scores `0`. | A patient demonstrably receiving oxygen scores identically to one breathing air. Relates to `H-006` in [`SAFETY.md`](../SAFETY.md). |
| B-06 | An unrecognised `oxygenDevice` code is neither high-flow nor level. | Scores `0` silently, no error. | Inconsistent with the strict validation applied to other coded fields. A host mapping defect fails silently. |

### Options for resolution

These interact, so they should be decided together rather than piecemeal:

1. **Clamp to the nearest declared band.** Extreme values score as the most abnormal band. Keeps `pewsTotal` a plain number; masks genuine data errors.
2. **Throw on unmatched input.** Consistent with existing validation. Requires every host to supply clean data, and an uncaught throw in a rendering path is its own hazard.
3. **Return an explicit unscoreable marker.** Safest clinically, but changes the contract of `pewsTotal` / `scoreBreakdown` and therefore affects the chart, the FHIR adapter, escalation selection and `SAFETY.md`.

Option 3 overlaps substantially with **R53** ("make the missing BP explicit with its applicable reason") and with the validation contract already queued as `SC-011`. Recommend deciding it once, there, rather than separately here.

## Documentation discrepancies

| ID | Finding |
| --- | --- |
| D-01 | [`roadmap.md`](./roadmap.md) records `Last reviewed: 2026-08-06`, but the uncommitted changes incorporate clinical review through 2026-08-11 and further review on 2026-08-21. |
| D-02 | The roadmap section heading `Doing Next - Settle The Chart UI` no longer matches the stated priority. The intro now names requirements traceability and fixtures as immediate, and `R54` has moved to Stage 5. Every item in the section is `[x]` except `R41` and `R50`. |
| D-03 | `R50` sits under "Doing Next" but is blocked externally on NHSE supplying authoritative RGB values ([issue #5](https://github.com/rcpch/digital-pews/issues/5)). It is not actionable by this team. |
| D-04 | [`requirements-traceability.md`](./requirements-traceability.md) marks `C8.6` and `C15.2` as `Partial`, which is not one of the five allocation states its own legend defines. |
| D-05 | `C1.1` is allocated twice in the traceability matrix, to two different buckets (observation entry/workflow, and interoperability/coding). |
| D-06 | The `C8.2` evidence cell reads `C17.11 below` rather than citing code or a test, unlike every other row. |

## Withdrawn

| ID | Finding | Outcome |
| --- | --- | --- |
| W-01 | Suspected that the `U3.5`, `U3.6` and `U3.11` "available by interaction" claims in the traceability matrix were unsubstantiated. | **Not a defect.** `attachTooltip` and `attachCategoricalTooltip` implement hover tooltips, `chart.js:11` cites `U3.5`/`U3.6` directly, and canvases carry `aria-label` text alternatives. Worth noting only that the tooltips are `mousemove`-driven with no keyboard/focus equivalent, so keyboard-only users depend on the `aria-label` — a point for `R14`, not a traceability error. |
