# Escalation, sepsis & communication

Sources: Configuration Document for SPOT NPEWS (NHS England); SPOT Decision Pathway V3 draft; NPEWS observation and escalation charts; implemented scorer behaviour in `pews-chart/npews-scorer.js`.

## Escalation levels

The scorer derives `escalationLevel` from the numeric PEWS total only.

| PEWS total | Escalation level | Colour |
| --- | --- | --- |
| 0 | None | n/a |
| 1–4 | Low | Blue `#1d70b8` |
| 5–8 | Medium | Yellow `#ffdd00` |
| 9–12 | High | Orange `#f47738` |
| ≥13 | Emergency | Red `#d4351c` |

Clinical response below is chart/Decision Pathway policy, not scorer logic.

| Level | Communication and response | Medical review timings | Minimal observations |
| --- | --- | --- | --- |
| Low | Inform Nurse-in-charge. Consider Medical Review by ST3+ or equivalent. Bedside nurse to feed back plan to parents. | As agreed with medical team. | Must reassess within 60 minutes, then document ongoing plan. |
| Medium | Review by Nurse-in-charge for potential escalation, and/or Outreach nurse or equivalent. Request Medical Review by ST3+ or equivalent. Consider stabilisation plan. Bedside nurse to feed back plan to parents. | Within 30 minutes. | Must reassess within 30 minutes, then document ongoing plan. Continuous oxygen saturation monitoring needed. |
| High | Immediate review by Nurse-in-charge for potential escalation. Call for Rapid Review: medical review including airway skills ST3+ or equivalent, and Outreach nurse if available or equivalent. Stabilisation plan to be discussed with consultant. Senior nurse to feed back plan to parents. | Within 15 minutes. | Every 30 minutes and continuous monitoring of respiratory rate, oxygen saturation and ECG. GCS recording if change in AVPU. |
| Emergency | Immediate 2222 call: “Paediatric Medical Emergency” and review by Nurse-in-charge. Consultant informed urgently to confirm stabilisation plan. Senior nurse to support and feed back to parents. In specialist environments, Rapid Review can replace 2222 only with prior agreement between consultant and Nurse-in-charge. | Immediate. | Every 15 minutes and continuous monitoring of respiratory rate, oxygen saturation and ECG. GCS recording if change in AVPU or abnormal pupillary response. |

For emergency or life-threatening situations: call 2222 and state “Paediatric Medical Emergency”.

## Non-score triggers (clinical overrides)

Clinical policy from the reference charts: respond according to the highest escalation level from the PEWS score or any trigger criterion. These triggers can raise the escalation level above the numeric-score level.

Implementation status: `pews-chart/npews-scorer.js` currently hardcodes only `escalationLevelFromScore(total)`. Trigger-based overrides for Carer Question, Clinical Intuition, Specific Concern, AVPU and temperature are documented policy and are not all hardcoded in the scorer.

| Trigger criterion | Low | Medium | High | Emergency |
| --- | --- | --- | --- | --- |
| Specific Concern | None stated. | New suspicion of sepsis. | AVPU change to V (“Responsive only to Voice”) or new suspicion of septic shock. | AVPU change to P or U (“Responsive only to Pain” or “Unresponsive”), or abnormal pupillary response. |
| Clinical Intuition | Nurse/clinician concern that patient needs increased monitoring despite low PEWS. | Nurse/clinician concern that patient needs a medical review irrespective of PEWS. | Nurse/clinician concern that patient needs a Rapid Review irrespective of PEWS. | Nurse/clinician concern that patient needs emergency review for a life-threatening situation. |
| Carer Question | Carer uses words suggesting the child needs increased monitoring or intervention despite low PEWS. | Carer uses words suggesting the child needs a clinical review irrespective of PEWS. | Carer uses words suggesting the child needs a Rapid Review irrespective of PEWS. | Carer uses words suggesting the child has collapsed or significantly deteriorated. |

Trigger input options preserved from the existing digital spec:

- Clinical Intuition: **Yes** = Concerned; **No** = Not Concerned. If “Yes” is selected, the clinician may record an escalation level: None, Low, Medium, High or Emergency.
- Parent/Carer Question: **W** = Worse; **S** = Same; **B** = Better; **A** = Parent/Carer Asleep; **U** = Unavailable. If “Worse” is selected, the clinician may record an escalation level: None, Low, Medium, High or Emergency.

Short codes for escalation reason:

| Code | Meaning |
| --- | --- |
| SC | Specific Concern |
| CQ | Carer Question |
| CI | Clinical Intuition |
| P | PEWS |
| 0 | None |

## AVPU & temperature

AVPU and temperature do not contribute to the numeric PEWS total. In `pews-chart/npews-scorer.js`, the numeric total includes respiratory rate, respiratory distress, oxygen saturation, oxygen support, heart rate, systolic blood pressure and capillary refill time only. AVPU and temperature feed the escalation/trigger grid: AVPU change to V/P/U or abnormal pupillary response; temperature ≥38°C or <36°C as a sepsis trigger.

## Think sepsis

Source: Configuration Document for SPOT NPEWS.

Think sepsis if any of the following are present:

- Neutropenia or immunocompromised: call medical professional for immediate review.
- Known or suspected infection.
- Temperature ≥38°C or <36°C.
- Increasing oxygen requirement.
- Unexplained tachypnoea / tachycardia.
- Altered mental state, e.g. lethargy/floppy.
- Prolonged CRT, mottled or ashen appearance.

If suspicion of sepsis: inform nurse-in-charge. Escalate to the patient’s own or on-call team.

## ISBAR communication

Source: Configuration Document for SPOT NPEWS.

The ISBAR aide-memoire is included in print PEWS charts. In the digital chart it is an optional/toggleable additional item.

| Letter | Guidance |
| --- | --- |
| **I** – Introduction | Hello, I am staff nurse (xx) from Ward (xx), I am calling about (xx). |
| **S** – Situation | I am calling because (e.g. PEWS increased to xx, carer is concerned because xx). The last observations were (xx). |
| **B** – Background | They are (age), admitted on (date) for (reason). They recently had surgery (xx); treatment (xx). |
| **A** – Assessment | I think they are (e.g. hypovolaemic). I don't know what is wrong with them but I am/carer is very concerned. |
| **R** – Recommendation | I would like you to (e.g. review in xx minutes please). |
