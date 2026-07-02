# NPEWS Scoring Parameters

> **Canonical source of truth for the numbers is now [`npews-scoring-spec.json`](./npews-scoring-spec.json)** — a machine-readable file that generates both the runtime scoring bands (`pews-chart/npews-scoring-config.js`) and the unified reference table ([`npews-scoring-tables.generated.md`](./npews-scoring-tables.generated.md)). Edit the JSON and run `npm run generate:scoring`; a test fails if they drift apart.
>
> This document is the **clinical narrative**: it keeps the per-age-band respiratory-distress descriptors, the oxygen-device lists, the boundary notes, and the manual-review annotations below. Where a number here disagrees with the JSON, the JSON wins (and the drift test will be red).
>
> **Conformance note:** Temperature and AVPU are NOT numerically scored — they are recorded and drive escalation only (temperature = sepsis/escalation trigger; AVPU = specific-concern escalation trigger), matching the national SPOT NPEWS algorithm.

> Source: Configuration Document for SPOT NPEWS (NHS England)
>
> This document defines the scoring thresholds for the National Paediatric Early Warning Score (NPEWS) across all age brackets. Scores are colour-coded: **White (0)**, **Yellow (1)**, **Orange (2)**, **Pink (4)**.

MANUALLY CHECKED AGAINST NPEWS CHARTS ON THE LIVE NHS ENGLAND WEBSITE
BY MARCUS BAW GMC 4712729 ON 2026.06.30


---

## Age Bracket: 0 – 11 months

### Respiratory Rate

| Range | Colour | Score |
| --- | --- | --- |
| Under 10 | Pink | 4 | CORRECT
| 10 – 19.99 | Orange | 2 | CORRECT
| 20 – 29.99 | Yellow | 1 | CORRECT
| 30 – 49.99 | White | 0 | CORRECT
| 50 – 59.99 | Yellow | 1 | CORRECT
| 60 – 69.99 | Orange | 2 | CORRECT
| 70 and above | Pink | 4 | CORRECT

### Respiratory Distress

**Mild – Yellow – Score 1:**

- Nasal flaring CORRECT
- Subcostal recession CORRECT

**Moderate – Orange – Score 2:**

- Head bobbing CORRECT
- Tracheal tug CORRECT
- Intercostal recession CORRECT
- Inspiratory or expiratory noises CORRECT

**Severe – Pink – Score 4:**

- Sternal recession CORRECT
- Grunting CORRECT
- Exhaustion CORRECT
- Impending respiratory arrest CORRECT

### Oxygen Saturation

| Range | Colour | Score |
| --- | --- | --- |
| Below or equal to 91% | Pink | 4 | CORRECT
| 91.01% to 94.99% | Yellow | 1 | **INCONSISTENCY** - SHOULD BE 92.00% - 94.99%
| Above or equal to 95% | White | 0 | CORRECT: >95.00%

### Oxygen Support Device

**Pink – Score 4** (overrides any score from oxygen support level):

- HF – High Flow
- BiP – BiPAP
- CP – CPAP

**White – Score As Per Oxygen Support Level**

- NP – Nasal prongs
- FM – Face mask
- HB – Head box
- NRB – Non Rebreather

### Oxygen Support Level – Percentages

| Range | Colour | Score |
| --- | --- | --- |
| Air / No Support / <21% FiO2 | White | 0 | CORRECT
| 16% to 29.99% | Yellow | 1 | **INCONSISTENCY** - SHOULD BE 21.01% - 29.99%
| 30% to 49.99% | Orange | 2 | CORRECT
| 50% or higher | Pink | 4 | CORRECT

> Note: If your system allows support under 16%, it should still score 1. WHERE DID THIS COME FROM? WHO IS GIVING <16% O2?

### Oxygen Support Level – Litres per min

| Range | Colour | Score |
| --- | --- | --- |
| Air / No Support | White | 0 | CORRECT
| 0.01 to 1.99 | Yellow | 1 | CORRECT
| 2 to 5.99 | Orange | 2 | CORRECT
| 6 or higher | Pink | 4 | CORRECT

> Note: If your system allows support under 0.01, it should still score 1.

### Heart Rate

| Range | Colour | Score |
| --- | --- | --- |
| 0 - 79.99| Pink | 4 | AMENDED TO USE A MATHEMATICAL RANGE
| 80 – 89.99 | Orange | 2 | CORRECT
| 90 – 109.99 | Yellow | 1 | CORRECT
| 110 – 149.99 | White | 0 | CORRECT
| 150 – 169.99 | Yellow | 1 | CORRECT
| 170 – 179.99 | Orange | 2 | CORRECT
| 180 and above | Pink | 4 | CORRECT

### Blood Pressure (Systolic)

| Range | Colour | Score |
| --- | --- | --- |
| 0 - 49.99 | Pink | 4 | AMENDED TO USE A MATHEMATICAL RANGE
| 50 – 59.99 | Orange | 2 | CORRECT
| 60 – 69.99 | Yellow | 1 | CORRECT
| 70 – 89.99 | White | 0 | CORRECT
| 90 – 99.99 | Yellow | 1 | CORRECT
| 100 – 109.99 | Orange | 2 | CORRECT
| 110 and above | Pink | 4 | CORRECT

### Capillary Refill Time

| Range | Colour | Score |
| --- | --- | --- |
| Below or equal to 2 seconds | White | 0 | CORRECT
| Equal to or above 3 seconds | Orange | 2 | CORRECT

NOTE: Charts do not indicate a score for 2.01 - 2.99

---

## Age Bracket: 1 – 4 years

### Respiratory Rate

| Range | Colour | Score |
| --- | --- | --- |
| 0 - 9.99 | Pink | 4 | CORRECT
| 10 – 19.99 | Orange | 2 | CORRECT
| 20 – 39.99 | White | 0 | CORRECT
| 40 – 49.99 | Yellow | 1 | CORRECT
| 50 – 59.99 | Orange | 2 | CORRECT
| > 60  | Pink | 4 | CORRECT

### Respiratory Distress

**Mild – Yellow – Score 1:**

- Nasal flaring
- Subcostal recession

**Moderate – Orange – Score 2:**

- Head bobbing
- Tracheal tug
- Intercostal recession
- Inspiratory or expiratory noises

**Severe – Pink – Score 4:**

- Sternal recession
- Grunting
- Exhaustion
- Impending respiratory arrest

### Oxygen Saturation

| Range | Colour | Score |
| --- | --- | --- |
| =< 91.99% | Pink | 4 | AMENDED TO USE A MATHEMATICAL RANGE
| 92.00% to 94.99% | Yellow | 1 | FIXED RANGE
| > 95.00% | White | 0 | CORRECT

### Oxygen Support Device

**Pink – Score 4** (overrides any score from oxygen support level):

- HF – High Flow CORRECT
- BiP – BiPAP CORRECT
- CP – CPAP CORRECT

**White – Score As Per Oxygen Support Level**

- NP – Nasal prongs CORRECT
- FM – Face mask CORRECT
- HB – Head box CORRECT
- NRB – Non Rebreather CORRECT

### Oxygen Support Level – Percentages

| Range | Colour | Score |
| --- | --- | --- |
| Air / No Support | White | 0 | CORRECT
| 21.00% - 29.99% | Yellow | 1 | FIXED RANGE
| 30.00% - 49.99% | Orange | 2 | CORRECT
| >= 50.00% | Pink | 4 | CORRECT

> Note: If your system allows support under 16%, it should still score 1. WHERE DID THIS COME FROM?

### Oxygen Support Level – Litres per min

| Range | Colour | Score |
| --- | --- | --- |
| Air / No Support | White | 0 | CORRECT
| 0.01 - 1.99 | Yellow | 1 | FIXED RANGE
| 2.00 - 5.99 | Orange | 2 | CORRECT
| >= 6.00 | Pink | 4 | AMENDED TO USE MATHEMATICAL EXPRESSION

> Note: If your system allows support under 0.01, it should still score 1.

### Heart Rate

| Range | Colour | Score |
| --- | --- | --- |
| 0.00 - 59.99 | Pink | 4 | AMENDED TO USE MATHEMATICAL EXPRESSION
| 60 – 69.99 | Orange | 2 | 
| 70 – 89.99 | Yellow | 1 |
| 90 – 139.99 | White | 0 |
| 140 – 149.99 | Yellow | 1 |
| 150 – 169.99 | Orange | 2 |
| 170 and above | Pink | 4 |

### Blood Pressure (Systolic)

| Range | Colour | Score |
| --- | --- | --- |
| Under 50 | Pink | 4 |
| 50 – 59.99 | Orange | 2 |
| 60 – 79.99 | Yellow | 1 |
| 80 – 99.99 | White | 0 |
| 100 – 119.99 | Yellow | 1 |
| 120 – 129.99 | Orange | 2 |
| 130 and above | Pink | 4 |

### Capillary Refill Time

| Range | Colour | Score |
| --- | --- | --- |
| Below or equal to 2 seconds | White | 0 |
| Equal to or above 3 seconds | Orange | 2 |

---

## Age Bracket: 5 – 12 years

### Respiratory Rate

| Range | Colour | Score |
| --- | --- | --- |
| Under 10 | Pink | 4 |
| 10 – 14.99 | Orange | 2 |
| 15 – 19.99 | Yellow | 1 |
| 20 – 24.99 | White | 0 |
| 25 – 39.99 | Yellow | 1 |
| 40 – 49.99 | Orange | 2 |
| 50 and above | Pink | 4 |

### Respiratory Distress

**Mild – Yellow – Score 1:**

- Accessory muscle use

**Moderate – Orange – Score 2:**

- Tracheal tug
- Intercostal recession
- Inspiratory or expiratory noises

**Severe – Pink – Score 4:**

- Tripoding
- Supraclavicular recession
- Grunting
- Exhaustion
- Impending respiratory arrest

### Oxygen Saturation

| Range | Colour | Score |
| --- | --- | --- |
| Below or equal to 91% | Pink | 4 |
| 91.01% to 94.99% | Yellow | 1 |
| Above or equal to 95% | White | 0 |

### Oxygen Support Device

**Pink – Score 4** (overrides any score from oxygen support level):

- HF – High Flow
- BiP – BiPAP
- CP – CPAP

**White – Score As Per Oxygen Support Level**

- NP – Nasal prongs
- FM – Face mask
- HB – Head box
- NRB – Non Rebreather

### Oxygen Support Level – Percentages

| Range | Colour | Score |
| --- | --- | --- |
| Air / No Support | White | 0 |
| 16% to 29.99% | Yellow | 1 |
| 30% to 49.99% | Orange | 2 |
| 50% or higher | Pink | 4 |

> Note: If your system allows support under 16%, it should still score 1.

### Oxygen Support Level – Litres per min

| Range | Colour | Score |
| --- | --- | --- |
| Air / No Support | White | 0 |
| 0.01 to 1.99 | Yellow | 1 |
| 2 to 5.99 | Orange | 2 |
| 6 or higher | Pink | 4 |

> Note: If your system allows support under 0.01, it should still score 1.

### Heart Rate

| Range | Colour | Score |
| --- | --- | --- |
| Under 60 | Pink | 4 |
| 60 – 69.99 | Orange | 2 |
| 70 – 79.99 | Yellow | 1 |
| 80 – 119.99 | White | 0 |
| 120 – 139.99 | Yellow | 1 |
| 140 – 159.99 | Orange | 2 |
| 160 and above | Pink | 4 |

### Blood Pressure (Systolic)

| Range | Colour | Score |
| --- | --- | --- |
| Under 70 | Pink | 4 |
| 70 – 79.99 | Orange | 2 |
| 80 – 89.99 | Yellow | 1 |
| 90 – 109.99 | White | 0 |
| 110 – 119.99 | Yellow | 1 |
| 120 – 129.99 | Orange | 2 |
| 130 and above | Pink | 4 |

### Capillary Refill Time

| Range | Colour | Score |
| --- | --- | --- |
| Below or equal to 2 seconds | White | 0 |
| Equal to or above 3 seconds | Orange | 2 |

---

## Age Bracket: 13 – 18 years

### Respiratory Rate

| Range | Colour | Score |
| --- | --- | --- |
| Under 10 | Pink | 4 |
| 10 – 14.99 | Yellow | 1 |
| 15 – 24.99 | White | 0 |
| 25 – 29.99 | Yellow | 1 |
| 30 – 39.99 | Orange | 2 |
| 40 and above | Pink | 4 |

### Respiratory Distress

**Mild – Yellow – Score 1:**

- Accessory muscle use

**Moderate – Orange – Score 2:**

- Tracheal tug
- Intercostal recession
- Inspiratory or expiratory noises

**Severe – Pink – Score 4:**

- Tripoding
- Supraclavicular recession
- Grunting
- Exhaustion
- Impending respiratory arrest

### Oxygen Saturation

| Range | Colour | Score |
| --- | --- | --- |
| Below or equal to 91% | Pink | 4 |
| 91.01% to 94.99% | Yellow | 1 |
| Above or equal to 95% | White | 0 |

### Oxygen Support Device

**Pink – Score 4** (overrides any score from oxygen support level):

- HF – High Flow
- BiP – BiPAP
- CP – CPAP

**White – Score As Per Oxygen Support Level**

- NP – Nasal prongs
- FM – Face mask
- HB – Head box
- NRB – Non Rebreather

### Oxygen Support Level – Percentages

| Range | Colour | Score |
| --- | --- | --- |
| Air / No Support | White | 0 |
| 16% to 29.99% | Yellow | 1 |
| 30% to 49.99% | Orange | 2 |
| 50% or higher | Pink | 4 |

> Note: If your system allows support under 16%, it should still score 1.

### Oxygen Support Level – Litres per min

| Range | Colour | Score |
| --- | --- | --- |
| Air / No Support | White | 0 |
| 0.01 to 1.99 | Yellow | 1 |
| 2 to 5.99 | Orange | 2 |
| 6 or higher | Pink | 4 |

> Note: If your system allows support under 0.01, it should still score 1.

### Heart Rate

| Range | Colour | Score |
| --- | --- | --- |
| Under 50 | Pink | 4 |
| 50 – 59.99 | Orange | 2 |
| 60 – 69.99 | Yellow | 1 |
| 70 – 99.99 | White | 0 |
| 100 – 119.99 | Yellow | 1 |
| 120 – 129.99 | Orange | 2 |
| 130 and above | Pink | 4 |

### Blood Pressure (Systolic)

| Range | Colour | Score |
| --- | --- | --- |
| Under 80 | Pink | 4 |
| 80 – 89.99 | Orange | 2 |
| 90 – 99.99 | Yellow | 1 |
| 100 – 119.99 | White | 0 |
| 120 – 129.99 | Yellow | 1 |
| 130 – 139.99 | Orange | 2 |
| 140 and above | Pink | 4 |

### Capillary Refill Time

| Range | Colour | Score |
| --- | --- | --- |
| Below or equal to 2 seconds | White | 0 |
| Equal to or above 3 seconds | Orange | 2 |
