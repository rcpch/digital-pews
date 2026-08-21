# Requirements traceability

Status: partial. This is the reviewable requirement-by-requirement traceability record for roadmap R9. It begins with the clinical calculation and chart-rendering critical path. Observation entry, workflow, supplier, deployment, and interoperability requirements remain to be allocated individually in later rows; they are not implicitly claimed by this component.

## How to use this matrix

- **Component implemented**: this repository implements the bounded behaviour. Evidence identifies code and automated tests; it is not a complete-solution compliance claim.
- **Component planned**: the responsibility belongs to the component but evidence is incomplete or the feature is not implemented.
- **Shared**: the component can support part of the requirement from supplied data, while the host/EPR owns record entry, workflow, persistence, or local policy.
- **Host/deployer**: the requirement belongs outside the component boundary.
- **Deliberate exclusion**: the component will not implement the requirement. The reason and governing decision are stated.

The complete source requirements remain the [UI specification](./spot-npews-ui-spec.md) and [clinical/technical specification](./spot-npews-spec.md). The [product boundary](./product-boundary.md) explains the allocation model and permitted claims.

## Clinical calculation and chart rendering

| Requirement | Allocation and state | Evidence |
| --- | --- | --- |
| `U1.1` | Component planned. Accessible rendering and an evidenced colour-blindness approach require browser evidence. | Roadmap R14; [`SAFETY.md`](../SAFETY.md) H-008 |
| `U3.1` | Component implemented. Fixed time windows provide more or less chart detail without changing the score. | [`chart/chart.js`](../chart/chart.js); [`implementation-notes.md`](./implementation-notes.md#rcpch-11-time-window-selection-must-not-affect-pews-score-display) |
| `U3.2` | Component implemented. The default view ends at the latest supplied observation. | [`chart/chart.js`](../chart/chart.js); [`demo/demo.js`](../demo/demo.js) |
| `U3.5` | Component implemented. Exact plotted values are available by interaction. | [`chart/chart.js`](../chart/chart.js) |
| `U3.6` | Component implemented. Chart dots and interaction expose exact values. | [`chart/chart.js`](../chart/chart.js) |
| `U3.7` | Component implemented. Numeric y-axes increase upwards; categorical rows use score severity. | [`chart/chart.js`](../chart/chart.js) |
| `U3.9` | Shared. The component renders supplied skipped values and reasons; the host captures them. | [`chart/chart.js`](../chart/chart.js); [`data-model.md`](./data-model.md) |
| `U3.10` | Component implemented. A skipped value breaks the trend line. | [`chart/chart.js`](../chart/chart.js); [`SAFETY.md`](../SAFETY.md) SC-005 |
| `U3.11` | Component implemented. The time axis and interaction identify observation times. | [`chart/chart.js`](../chart/chart.js) |
| `U3.13` | Component implemented. Observations use visible dots distinct from trend lines. | [`chart/chart.js`](../chart/chart.js) |
| `U3.14` | Component implemented. Numeric observations are plotted at their exact position within each scoring band. | [`chart/chart.js`](../chart/chart.js); [`implementation-notes.md`](./implementation-notes.md#pews-bands-and-plotted-observations) |
| `U9.5` | Component implemented. Oxygen-delivery observations use plotted markers. | [`chart/chart.js`](../chart/chart.js) |
| `U9.6` | Component implemented. Oxygen delivery trends connect compatible observations. | [`chart/chart.js`](../chart/chart.js) |
| `U9.7` | Component implemented. Changing oxygen-delivery units causes a line break. | [`chart/chart.js`](../chart/chart.js); [`SAFETY.md`](../SAFETY.md) SC-005 |
| `U10.4` | Component implemented. Heart-rate observations use exact plotted markers. | [`chart/chart.js`](../chart/chart.js) |
| `U10.5` | Component implemented. Heart-rate trends connect consecutive observations. | [`chart/chart.js`](../chart/chart.js) |
| `U11.5` | Component implemented. Systolic and diastolic values use joined inward-pointing markers. | [`chart/chart.js`](../chart/chart.js); roadmap R49 |
| `U11.7` | Component implemented. No horizontal trend line joins separate blood-pressure observations. | [`chart/chart.js`](../chart/chart.js) |
| `U12.4` | Component implemented. Capillary refill uses scored categorical presentation. | [`chart/chart.js`](../chart/chart.js) |
| `U15.4` | Component implemented. Temperature observations use exact plotted markers. | [`chart/chart.js`](../chart/chart.js) |
| `U15.5` | Component implemented. Temperature trends connect consecutive observations. | [`chart/chart.js`](../chart/chart.js) |
| `U17.6` | Shared. The component presents the calculated level and guidance; the host owns the end-of-entry workflow. | [`chart/chart.js`](../chart/chart.js); [`product-boundary.md`](./product-boundary.md) |
| `C1.2` | Component implemented. Canonical scoring bands and colours are generated from one source. | [`npews-scoring-spec.json`](./npews-scoring-spec.json); [`test/scoring/config-matches-spec.test.js`](../test/scoring/config-matches-spec.test.js) |
| `C1.3` | Component implemented. National threshold changes are made in canonical JSON and generated into runtime artefacts. | [`npews-scoring-spec.json`](./npews-scoring-spec.json); [`scripts/generate-scoring.mjs`](../scripts/generate-scoring.mjs) |
| `C1.4` | Component implemented. Inclusive band scoring selects the applicable specified result. | [`chart/npews-scorer.js`](../chart/npews-scorer.js); [`test/fhir/score-conformance.test.js`](../test/fhir/score-conformance.test.js) |
| `C2.2` | Deliberate exclusion. Exact calendar age selects the band; the adjacent-form override is not supported. | [`product-boundary.md`](./product-boundary.md#deliberate-non-conformance-alternate-age-band-selection-c22); D15 in [`decisions.md`](./decisions.md) |
| `C2.3` | Component implemented. The chart resolves and renders the supported national age bands. | [`chart/npews-scoring-config.js`](../chart/npews-scoring-config.js); [`chart/age-band.js`](../chart/age-band.js) |
| `C3.1` | Shared. The component renders supplied observations with fixed windows; the host retrieves the longitudinal record. | [`chart/chart.js`](../chart/chart.js); [`product-boundary.md`](./product-boundary.md) |
| `C3.12` | Host/EPR. Previous admissions and record retrieval are outside the component. | [`product-boundary.md`](./product-boundary.md) |
| `C3.13` | Shared. The component labels its view; the host identifies historical records and admissions. | [`chart/chart.js`](../chart/chart.js); [`product-boundary.md`](./product-boundary.md) |
| `C3.17` | Shared. The component accepts and displays supplied skip reasons; the host prompts and persists them. | [`data-model.md`](./data-model.md); [`product-boundary.md`](./product-boundary.md) |
| `C5.2` | Component implemented. Respiratory rate is rendered as an exact value and trend. | [`chart/chart.js`](../chart/chart.js) |
| `C5.3` | Component implemented. Respiratory-rate bands are scored from canonical configuration. | [`chart/npews-scorer.js`](../chart/npews-scorer.js); [`npews-scoring-spec.json`](./npews-scoring-spec.json) |
| `C5.4` | Component implemented. Respiratory-rate trends are rendered. | [`chart/chart.js`](../chart/chart.js) |
| `C6.4` | Component implemented. Respiratory-distress categories produce defined scores. | [`chart/npews-scorer.js`](../chart/npews-scorer.js) |
| `C6.5` | Component implemented. Age-band configuration varies respiratory-distress presentation and scoring. | [`npews-scoring-spec.json`](./npews-scoring-spec.json) |
| `C7.2` | Component implemented. Oxygen saturation is scored from canonical bands. | [`chart/npews-scorer.js`](../chart/npews-scorer.js) |
| `C7.3` | Component implemented. Oxygen saturation is rendered as an exact value. | [`chart/chart.js`](../chart/chart.js) |
| `C8.2` | Component implemented. High-flow devices override oxygen-delivery score. | [`chart/npews-scorer.js`](../chart/npews-scorer.js); `C17.11` below |
| `C8.6` | Partial. Device changes are retained in data; clinically useful change presentation remains R22. | Roadmap R22 |
| `C9.2` | Component implemented. Oxygen delivery is rendered as percentage or litres per minute. | [`chart/chart.js`](../chart/chart.js); [`data-model.md`](./data-model.md) |
| `C9.4` | Component implemented. Oxygen delivery is scored from canonical bands. | [`chart/npews-scorer.js`](../chart/npews-scorer.js) |
| `C9.6` | Component implemented. Unit changes break oxygen-delivery trends. | [`chart/chart.js`](../chart/chart.js); [`SAFETY.md`](../SAFETY.md) SC-005 |
| `C10.2` | Component implemented. Heart rate is rendered as an exact value and trend. | [`chart/chart.js`](../chart/chart.js) |
| `C10.3` | Component implemented. Heart rate is scored from canonical bands. | [`chart/npews-scorer.js`](../chart/npews-scorer.js) |
| `C11.2` | Component implemented. Systolic and diastolic blood pressure are rendered. | [`chart/chart.js`](../chart/chart.js) |
| `C11.3` | Component implemented. The data contract carries systolic and diastolic values. | [`data-model.md`](./data-model.md) |
| `C11.4` | Component implemented. Systolic and diastolic points are joined. | [`chart/chart.js`](../chart/chart.js) |
| `C11.6` | Component implemented. Systolic blood pressure is scored from canonical bands. | [`chart/npews-scorer.js`](../chart/npews-scorer.js) |
| `C12.2` | Component implemented. Capillary refill is scored from canonical rules. | [`chart/npews-scorer.js`](../chart/npews-scorer.js) |
| `C12.3` | Component implemented. Capillary refill is rendered as a categorical value. | [`chart/chart.js`](../chart/chart.js) |
| `C14.1` | Shared. The contract supports AVPU including asleep; the host owns entry workflow. | [`data-model.md`](./data-model.md); [`escalation.md`](./escalation.md) |
| `C14.6` | Shared. The contract supports new sepsis and septic-shock suspicion; the host owns entry workflow. | [`data-model.md`](./data-model.md); [`escalation.md`](./escalation.md) |
| `C14.7` | Component implemented. New sepsis and septic-shock suspicion derive the defined escalation. | [`chart/npews-scorer.js`](../chart/npews-scorer.js); [`test/scoring/non-score-escalation.test.js`](../test/scoring/non-score-escalation.test.js) |
| `C15.2` | Partial. Temperature is plotted and retained but route capture is host-owned. | [`chart/chart.js`](../chart/chart.js); [`data-model.md`](./data-model.md) |
| `C15.3` | Component implemented. Temperature trends are rendered. | [`chart/chart.js`](../chart/chart.js) |
| `C17.1` | Component implemented. The scorer calculates and the chart displays total PEWS. | [`chart/npews-scorer.js`](../chart/npews-scorer.js); [`test/fhir/score-conformance.test.js`](../test/fhir/score-conformance.test.js) |
| `C17.2` | Shared. The component retains trigger short-code provenance; the host owns the clinical record. | [`chart/npews-scorer.js`](../chart/npews-scorer.js); [`escalation.md`](./escalation.md) |
| `C17.3` | Component implemented. Escalation provenance is presented in chart status surfaces. | [`chart/chart.js`](../chart/chart.js) |
| `C17.6` | Component implemented. The highest level across score and supported triggers is calculated. | [`chart/npews-scorer.js`](../chart/npews-scorer.js); [`test/scoring/non-score-escalation.test.js`](../test/scoring/non-score-escalation.test.js) |
| `C17.11` | Component implemented. High-flow device scoring takes precedence over oxygen-delivery rate. | [`chart/npews-scorer.js`](../chart/npews-scorer.js); [`test/fhir/score-conformance.test.js`](../test/fhir/score-conformance.test.js) |

## Supplier, deployment, and integration requirements

The following source areas are not component claims. Their individual allocation is the next matrix expansion:

- Observation entry, correction, audit, reporting, comments, local risk factors, and clinical workflow: `U5-U17`, `C1.1`, `C2.1`, `C3.6-C4.5`, `C13`, `C16-C20`.
- Supplier commercial, security, training, environment, governance, availability, and support: `T1-T5`, `T7`.
- Interoperability, record transfer, and nationally governed coding: `C1.1`, `T6`, with component-adapter evidence in [`fhir.md`](./fhir.md) and open coding work in R38.

These requirements are allocated at capability level in the [product boundary](./product-boundary.md). R9 remains incomplete until every applicable source ID appears in this matrix with its specific allocation and evidence.
