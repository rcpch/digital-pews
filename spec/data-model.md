# NPEWS Data Model

The `<npews-chart>` component consumes exactly **two inputs**: a `Patient` and an array
of `Observation`s (raw vital signs). Everything else — the applicable age band, the PEWS
score, the escalation level — is **computed by the component**, never supplied. This
document defines those two input shapes plus the data-entry reference codes.

Derived/config structures are documented where they live:

- **Scoring thresholds** → [`npews-scoring-spec.json`](./npews-scoring-spec.json) (source
  of truth) and the [generated reference table](./npews-scoring-tables.generated.md).
- **Age bands, bounds and escalation metadata** → `pews-chart/npews-scoring-config.js`.
- **Escalation levels, triggers and actions** → [`escalation.md`](./escalation.md).

---

## 1. Patient

```javascript
{
  name: string,          // required — full name
  dob: string,           // ISO 8601 (YYYY-MM-DD). Strongly recommended: drives scoring
  nhsNumber?: string,    // formatted with spaces
  ward?: string,
  bed?: string,
  consultant?: string,
  admittedAt?: string,   // ISO 8601
  // Display-only fallbacks (ignored when dob is present):
  age?: string,          // human-readable, e.g. "7 years"
  ageBracket?: string,   // e.g. "5-12"
  ageBand?: string,      // one of '0-11m' | '1-4y' | '5-12y' | '13+y'
}
```

### Age-band selection (important)

- `dob` is the **authoritative** input for age-band selection. The component resolves the
  applicable band per observation from `dob` + the observation timestamp using **calendar
  completed years** (`pews-chart/age-band.js`), so the boundary lands exactly on the 1st /
  5th / 13th birthday. Day-based approximations (`days/365.25`) are deliberately avoided
  because they mis-fire around leap-year birthdays.
- `ageBand` is a **display/fallback hint only** — used only when `dob` is missing. It must
  match a key in `AGE_BANDS`.
- The canonical half-open band bounds (years) live in `npews-scoring-spec.json`
  (`ageBandBounds`) → generated into `AGE_BAND_BOUNDS`: `0-11m`=[0,1), `1-4y`=[1,5),
  `5-12y`=[5,13), `13+y`=[13,∞).
- **Boundary crossing:** when an admission spans a birthday the component does not stop one
  chart and start another — it joins them. The trend line stays continuous on a unified
  y-scale (the union of the spanned bands' ranges) while the coloured scoring-band
  backgrounds switch at the exact birthday instant, with a dashed divider marking the seam.
- `age` / `ageBracket` are human-readable display strings only and play no part in scoring.

---

## 2. Observation

Raw vital signs at one instant. **No scores are authored here** — the component computes
`pewsTotal` / `escalationLevel` / per-observation age band from the vitals + the patient's
DOB, and ignores any score present in input.

```javascript
{
  id: string,                         // unique
  timestamp: string,                  // ISO 8601

  respiratoryRate: number | null,     // breaths/min
  respiratoryDistress: string | null, // 'none' | 'mild' | 'moderate' | 'severe'

  oxygenSaturation: number | null,    // %
  oxygenDevice: string | null,        // 'air' or a device code (see reference below)
  oxygenDelivery: { value: number, unit: '%' | 'L/min' } | null, // null = room air

  heartRate: number | null,           // bpm
  bloodPressureSystolic: number | null,  // mmHg (scored)
  bloodPressureDiastolic: number | null, // mmHg (carried for display; not scored)
  capillaryRefill: number | null,     // seconds

  avpu: string | null,                // 'A' | 'V' | 'P' | 'U' (escalation only, not scored)
  temperature: number | null,         // °C (escalation only, not scored)

  // Optional, one per vital that was skipped (value then null):
  //   <field>_skipReason?: string    e.g. respiratoryRate_skipReason: 'U4'
}
```

Field constraints: `avpu` ∈ {A,V,P,U}; `respiratoryDistress` ∈ {none,mild,moderate,severe};
any vital may be `null` (skipped). `oxygenDelivery` is `null` on room air; a change of
`unit` (`%` ↔ `L/min`) causes a deliberate line break in the chart (a real modality change,
not a continuous trend).

---

## 3. Data-entry reference

> Source: Configuration Document for SPOT NPEWS (NHS England).

### Skip-reason options

A skipped vital sets its value to `null` and records a `<field>_skipReason` code.

**Blood pressure**

| Code | Meaning | Scores |
| --- | --- | --- |
| `NCO` | Not attempted (no concern) | 0 |
| `U0` | Unsuccessful attempt (no concern) | 0 |
| `U4` | Unsuccessful attempt (concern) | 4 |
| `Other` | Free-text; user chooses to score 0 or 4 | 0 or 4 |

**Carer Question / Clinical Intuition** — may be skipped (no reason required).

### Respiratory support device codes

| Code | Device | Scoring |
| --- | --- | --- |
| `HF` | High Flow | Score 4 (override) |
| `BiP` | BiPAP | Score 4 (override) |
| `CP` | CPAP | Score 4 (override) |
| `NP` | Nasal prongs | Per oxygen-delivery band |
| `FM` | Face mask | Per oxygen-delivery band |
| `HB` | Head box | Per oxygen-delivery band |
| `NRB` | Non-rebreather | Per oxygen-delivery band |

`air` denotes room air (no supplemental oxygen).

---

## 4. Data files

- **`npews-scoring-config.js`** — `AGE_BANDS`, `AGE_BAND_BOUNDS`, `ESCALATION_META` and the
  generated `SCORING_BANDS_BY_AGE`. Loaded as an ES module by `chart.js`, `npews-scorer.js`
  and `age-band.js`.
- **`age-band.js`** — pure module: selects the band for a DOB + instant (calendar
  completed-years) and splits a window into per-band segments for seamless crossing.
- **`npews-scorer.js`** — `scoreObservationsForPatient(patient, observations)` resolves the
  band per observation, scores the vitals and derives the escalation level. Single source of
  truth for `pewsTotal` / `escalationLevel`.
- **`demo-data.js`** — `PATIENT` + `OBSERVATIONS` (raw vitals only) for the standalone chart.
- **`scenarios.js`** — the demo-harness scenario catalogue.
