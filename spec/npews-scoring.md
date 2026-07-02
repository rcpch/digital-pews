# NPEWS Scoring — clinical narrative

> **The numbers live elsewhere.** The single source of truth for every numeric
> threshold is [`npews-scoring-spec.json`](./npews-scoring-spec.json). It generates
> both the runtime bands (`pews-chart/npews-scoring-config.js`) and the human-readable
> [`npews-scoring-tables.generated.md`](./npews-scoring-tables.generated.md); a test
> fails if they drift. Edit the JSON, then run `npm run generate:scoring`.
>
> This file holds only the **clinical narrative that the JSON can't express** — the
> per-age-band respiratory-distress descriptors below. For the RR / HR / BP / SpO₂ /
> oxygen / capillary-refill thresholds, the oxygen-device rule and the escalation
> mapping, see the [generated reference table](./npews-scoring-tables.generated.md).

> Source: Configuration Document for SPOT NPEWS (NHS England). Scores are colour-coded
> **White (0)**, **Yellow (1)**, **Orange (2)**, **Pink (4)**.

**Conformance note.** Temperature and AVPU are **not** numerically scored — they are
recorded and drive escalation only (temperature = sepsis/escalation trigger; AVPU =
specific-concern escalation trigger), matching the national SPOT NPEWS algorithm. See
[`escalation.md`](./escalation.md).

**Clinical verification.** The numeric thresholds in the source JSON were manually
checked against the live NHS England NPEWS charts by Marcus Baw (GMC 4712729) on
2026-06-30.

---

## Respiratory distress descriptors

Respiratory distress is scored **Mild = 1 (Yellow)**, **Moderate = 2 (Orange)**,
**Severe = 4 (Pink)**. The clinical signs for each severity differ between the younger
and older age groups.

### 0–11 months and 1–4 years

| Severity | Signs |
| --- | --- |
| **Mild (1)** | Nasal flaring; subcostal recession |
| **Moderate (2)** | Head bobbing; tracheal tug; intercostal recession; inspiratory or expiratory noises |
| **Severe (4)** | Sternal recession; grunting; exhaustion; impending respiratory arrest |

### 5–12 years and 13–18 years

| Severity | Signs |
| --- | --- |
| **Mild (1)** | Accessory muscle use |
| **Moderate (2)** | Tracheal tug; intercostal recession; inspiratory or expiratory noises |
| **Severe (4)** | Tripoding; supraclavicular recession; grunting; exhaustion; impending respiratory arrest |

---

## Implementer notes

- **Oxygen support device** overrides delivery-level scoring: High Flow (HF), BiPAP
  (BiP) and CPAP (CP) always score 4; nasal prongs (NP), face mask (FM), head box (HB)
  and non-rebreather (NRB) score per the oxygen-delivery band. (Full rule and the
  numeric oxygen bands are in the [generated table](./npews-scoring-tables.generated.md).)
- **Very low oxygen support:** if a system permits recording FiO₂ below the lowest
  banded value (or < 0.01 L/min) while support is being given, it should still score 1.
- **Capillary refill:** the charts define ≤ 2 s = 0 and ≥ 3 s = 2, with no score
  defined for the 2.01–2.99 s gap.
