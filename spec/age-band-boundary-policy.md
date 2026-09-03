# Age-band boundary policy

Status: open research question with documented current behaviour and governance route. This is roadmap item [R46](./roadmap.md).

## The question

The NHS SPOT/NPEWS specification (`C2.2`) requires a complete solution to allow a clinician to select an alternate age-band form when a patient is "on the border" between two age brackets. This component deliberately does not provide that override (see [product-boundary.md](./product-boundary.md) and D15 in [decisions.md](./decisions.md)). The open question is: **what is the correct clinical policy when a patient's physiology near a birthday boundary produces a materially different PEWS score depending on which side of the boundary they fall?**

This is not a computational problem - calendar age at an observation timestamp is deterministic. It is a clinical governance problem: whether the national specification's alternate-form provision (`C2.2`) should be honoured in some form, whether the current deterministic behaviour is clinically safe at the boundary, and what senior-discretion mechanism (if any) should apply.

## Current behaviour

The component resolves the age band from the patient's date of birth at each observation's timestamp, using exact calendar completed-years (not a 365.25-day approximation). The canonical bounds in [`npews-scoring-spec.json`](./npews-scoring-spec.json) define four half-open intervals:

| Band | Bounds (completed years) | Boundary |
| --- | --- | --- |
| `0-11m` | [0, 1) | 1st birthday |
| `1-4y` | [1, 5) | 5th birthday |
| `5-12y` | [5, 13) | 13th birthday |
| `13+y` | [13, ∞) | - |

At the exact birthday instant, the scoring band changes. An observation taken one minute before the 5th birthday scores against `1-4y` thresholds; one minute after scores against `5-12y` thresholds. The thresholds for respiratory rate, heart rate, and systolic blood pressure differ between adjacent bands, so the same vital signs can produce a different PEWS score before and after the boundary.

When an admission spans a birthday, the chart joins the two age-band charts seamlessly: one continuous trend line on a unified y-scale, with coloured scoring-band backgrounds segmented at the birthday instant and a dashed divider (D5 in [`decisions.md`](./decisions.md)).

The component does not accept a host or clinician override of the scoring age band. The `patient.ageBand` property is a display/fallback hint used only when DOB is absent, and is not suitable for assured clinical use.

## Why the override was excluded

Allowing manual band selection could make identical physiology produce a different PEWS score and escalation solely because a different form was chosen. It could also turn an age-band override into an opaque proxy for clinical intuition or organisational pressure - making the score less auditable, not more.

Clinical concern near a boundary should instead be recorded through the clinical-intuition or specific-concern escalation pathway, with trigger provenance and the highest resulting escalation level preserved. This is more transparent than changing the scoring frame to obtain a preferred total.

## Hazard implications

Recorded as H-002 in [`SAFETY.md`](../SAFETY.md): "An observation is scored against the wrong age band." The identified causes include incorrect/missing DOB, timestamp error, use of the unassured `patient.ageBand` fallback, boundary arithmetic defect, or discretionary band override in the host. Current controls:

- Exact calendar arithmetic (not day approximation)
- Birthday-boundary automated tests ([`test/scoring/age-band.test.js`](../test/scoring/age-band.test.js))
- No clinician band override exposed by the component
- Explicit chart boundary when a window spans a transition
- `TC-001` (host supplies correct DOB) and `TC-002` (host does not expose `patient.ageBand` as a clinician-selectable scoring override)
- SC-003 and SC-004 in SAFETY.md

The residual risk is not a defect in the arithmetic but a policy gap: the component has no mechanism for the scenario `C2.2` was written to address - a clinician who believes the adjacent band's thresholds are more appropriate for a particular patient.

## The `C2.4` prompt

`C2.4` (a Should requirement) asks the solution to prompt a clinician when a patient has moved age brackets, recommend the new form, allow staying on the current form, and only prompt once per age change. Since the component does not support form selection at all, it also does not implement `C2.4`. If a future governance decision requires the component to support adjacent-form selection, `C2.4` would need to be addressed at the same time.

The component does, however, visibly delineate the boundary - the dashed divider and `→ <band>` marker make the transition explicit on the chart, which is the informational prerequisite for any host that wishes to implement `C2.4` in its own workflow.

## Senior-discretion context

In NHS clinical practice, senior clinicians may use judgement to override protocol-based scoring in individual cases. The national specification acknowledges this through `C2.2`'s alternate-form provision. The component's position is that senior discretion should be expressed through the escalation trigger pathway (Clinical Intuition, Specific Concern) rather than by changing the scoring frame. This preserves:

- A consistent, auditable PEWS total derived from deterministic rules
- A visible record of the clinical concern that prompted the escalation
- The highest escalation level across all triggers, so the override is fail-safe

The counter-argument is that changing the scoring frame is what `C2.2` actually asks for, and the trigger pathway is not a complete substitute because it does not change the numeric total - only the escalation level. A clinician who wants the total itself to reflect a different threshold set has no way to express that through the current component.

## Governance route

Resolving this question requires:

1. **Clinical evidence**: Are there published studies or national guidance on how PEWS scoring should handle patients near age-band boundaries? Does any NHS trust currently implement `C2.2` in practice, and with what clinical outcome?
2. **NHSE clarification**: Does NHS England consider `C2.2` a Must for the component-level scoring and charting function, or only for the complete EPR solution? The product boundary (D15) argues the latter, but this has not been confirmed by NHSE.
3. **Risk assessment**: If an override were added, what new hazards would it introduce? A manual band selection that changes the score without visible provenance would undermine the audit trail. Any override mechanism would need to record who selected it, when, and why.
4. **Decision**: Record the outcome in [`decisions.md`](./decisions.md) as a new ADR, update [`product-boundary.md`](./product-boundary.md) and [`SAFETY.md`](../SAFETY.md) accordingly, and close or reclassify R46 on the roadmap.

Until governed guidance exists, the component will not add an override, rescale scores at boundaries, or make the scoring age band manipulable. The current deterministic behaviour is the safest default: it is predictable, auditable, and cannot be influenced by organisational pressure.