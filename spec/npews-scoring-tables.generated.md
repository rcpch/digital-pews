<!-- GENERATED FILE — do not edit by hand.
     Source of truth: spec/npews-scoring-spec.json
     Regenerate with: npm run generate:scoring -->

# NPEWS Scoring — Unified Reference Table

> Configuration Document for SPOT NPEWS (NHS England)
>
> Manually checked against the live NHS England NPEWS charts by Marcus Baw (GMC 4712729) on 2026-06-30.
>
> Colours: **White (0)**, **Yellow (1)**, **Orange (2)**, **Pink (4)**. Each cell lists every
> band as `range → score (Colour)`; bands are inclusive and meet at `x.99` boundaries.
>
> **Conformance:** Conformant with the national SPOT NPEWS algorithm: temperature and AVPU are NOT numerically scored — they are escalation / sepsis / specific-concern triggers (see nonScoring below).

## Numerically scored vital signs

### Respiratory Rate (breaths/min)

| 0 to 11 months | 1-4 Years | 5-12 Years | ≥13 Years |
| --- | --- | --- | --- |
| 0–9.99 → 4 (Pink)<br>10–19.99 → 2 (Orange)<br>20–29.99 → 1 (Yellow)<br>30–49.99 → 0 (White)<br>50–59.99 → 1 (Yellow)<br>60–69.99 → 2 (Orange)<br>70+ → 4 (Pink) | 0–9.99 → 4 (Pink)<br>10–19.99 → 2 (Orange)<br>20–39.99 → 0 (White)<br>40–49.99 → 1 (Yellow)<br>50–59.99 → 2 (Orange)<br>60+ → 4 (Pink) | 0–9.99 → 4 (Pink)<br>10–14.99 → 2 (Orange)<br>15–19.99 → 1 (Yellow)<br>20–24.99 → 0 (White)<br>25–39.99 → 1 (Yellow)<br>40–49.99 → 2 (Orange)<br>50+ → 4 (Pink) | 0–9.99 → 4 (Pink)<br>10–14.99 → 1 (Yellow)<br>15–24.99 → 0 (White)<br>25–29.99 → 1 (Yellow)<br>30–39.99 → 2 (Orange)<br>40+ → 4 (Pink) |

### Heart Rate (bpm)

| 0 to 11 months | 1-4 Years | 5-12 Years | ≥13 Years |
| --- | --- | --- | --- |
| 0–79.99 → 4 (Pink)<br>80–89.99 → 2 (Orange)<br>90–109.99 → 1 (Yellow)<br>110–149.99 → 0 (White)<br>150–169.99 → 1 (Yellow)<br>170–179.99 → 2 (Orange)<br>180+ → 4 (Pink) | 0–59.99 → 4 (Pink)<br>60–69.99 → 2 (Orange)<br>70–89.99 → 1 (Yellow)<br>90–139.99 → 0 (White)<br>140–149.99 → 1 (Yellow)<br>150–169.99 → 2 (Orange)<br>170+ → 4 (Pink) | 0–59.99 → 4 (Pink)<br>60–69.99 → 2 (Orange)<br>70–79.99 → 1 (Yellow)<br>80–119.99 → 0 (White)<br>120–139.99 → 1 (Yellow)<br>140–159.99 → 2 (Orange)<br>160+ → 4 (Pink) | 0–49.99 → 4 (Pink)<br>50–59.99 → 2 (Orange)<br>60–69.99 → 1 (Yellow)<br>70–99.99 → 0 (White)<br>100–119.99 → 1 (Yellow)<br>120–129.99 → 2 (Orange)<br>130+ → 4 (Pink) |

### Blood Pressure — systolic (mmHg)

| 0 to 11 months | 1-4 Years | 5-12 Years | ≥13 Years |
| --- | --- | --- | --- |
| 0–49.99 → 4 (Pink)<br>50–59.99 → 2 (Orange)<br>60–69.99 → 1 (Yellow)<br>70–89.99 → 0 (White)<br>90–99.99 → 1 (Yellow)<br>100–109.99 → 2 (Orange)<br>110+ → 4 (Pink) | 0–49.99 → 4 (Pink)<br>50–59.99 → 2 (Orange)<br>60–79.99 → 1 (Yellow)<br>80–99.99 → 0 (White)<br>100–119.99 → 1 (Yellow)<br>120–129.99 → 2 (Orange)<br>130+ → 4 (Pink) | 0–69.99 → 4 (Pink)<br>70–79.99 → 2 (Orange)<br>80–89.99 → 1 (Yellow)<br>90–109.99 → 0 (White)<br>110–119.99 → 1 (Yellow)<br>120–129.99 → 2 (Orange)<br>130+ → 4 (Pink) | 0–79.99 → 4 (Pink)<br>80–89.99 → 2 (Orange)<br>90–99.99 → 1 (Yellow)<br>100–119.99 → 0 (White)<br>120–129.99 → 1 (Yellow)<br>130–139.99 → 2 (Orange)<br>140+ → 4 (Pink) |

### Oxygen Saturation (SpO₂ %)

| 0 to 11 months | 1-4 Years | 5-12 Years | ≥13 Years |
| --- | --- | --- | --- |
| 0–91 → 4 (Pink)<br>91.01–94.99 → 1 (Yellow)<br>95–100 → 0 (White) | 0–91 → 4 (Pink)<br>91.01–94.99 → 1 (Yellow)<br>95–100 → 0 (White) | 0–91 → 4 (Pink)<br>91.01–94.99 → 1 (Yellow)<br>95–100 → 0 (White) | 0–91 → 4 (Pink)<br>91.01–94.99 → 1 (Yellow)<br>95–100 → 0 (White) |

### Oxygen Support Level (FiO₂ %)

| 0 to 11 months | 1-4 Years | 5-12 Years | ≥13 Years |
| --- | --- | --- | --- |
| 0–15.99 → 0 (White)<br>16–29.99 → 1 (Yellow)<br>30–49.99 → 2 (Orange)<br>50–100 → 4 (Pink) | 0–15.99 → 0 (White)<br>16–29.99 → 1 (Yellow)<br>30–49.99 → 2 (Orange)<br>50–100 → 4 (Pink) | 0–15.99 → 0 (White)<br>16–29.99 → 1 (Yellow)<br>30–49.99 → 2 (Orange)<br>50–100 → 4 (Pink) | 0–15.99 → 0 (White)<br>16–29.99 → 1 (Yellow)<br>30–49.99 → 2 (Orange)<br>50–100 → 4 (Pink) |

### Oxygen Support Level (L/min)

| 0 to 11 months | 1-4 Years | 5-12 Years | ≥13 Years |
| --- | --- | --- | --- |
| 0–0.009 → 0 (White)<br>0.01–1.99 → 1 (Yellow)<br>2–5.99 → 2 (Orange)<br>6–20 → 4 (Pink) | 0–0.009 → 0 (White)<br>0.01–1.99 → 1 (Yellow)<br>2–5.99 → 2 (Orange)<br>6–20 → 4 (Pink) | 0–0.009 → 0 (White)<br>0.01–1.99 → 1 (Yellow)<br>2–5.99 → 2 (Orange)<br>6–20 → 4 (Pink) | 0–0.009 → 0 (White)<br>0.01–1.99 → 1 (Yellow)<br>2–5.99 → 2 (Orange)<br>6–20 → 4 (Pink) |

## Categorical parameters (all age bands)

### Respiratory Distress

| Severity | Score |
| --- | --- |
| none | 0 (White) |
| mild | 1 (Yellow) |
| moderate | 2 (Orange) |
| severe | 4 (Pink) |

### Capillary Refill Time

| Range | Score |
| --- | --- |
| ≤ 2 seconds | 0 (White) |
| ≥ 3 seconds | 2 (Orange) |

> Below/equal 2s scores 0; >=3s scores 2. Charts do not define a score for 2.01-2.99s.

### Oxygen Support Device

- **Score 4 (Pink), overrides delivery level:** HF, BiP, CP (High Flow, BiPAP, CPAP)
- **Scored per delivery level:** NP, FM, HB, NRB (Nasal prongs, Face mask, Head box, Non-rebreather)

## Not numerically scored

These are recorded and drive escalation only — they do **not** add to the PEWS total
(national SPOT NPEWS conformance).

- **Temperature** — Sepsis / escalation trigger: high >= 38, low < 36.
- **AVPU** — Specific-concern escalation trigger: V → escalate; P/U → escalate higher.

## Escalation (PEWS total → level)

| Level | PEWS total |
| --- | --- |
| Low | 1–4 |
| Medium | 5–8 |
| High | 9–12 |
| Emergency | 13+ |
