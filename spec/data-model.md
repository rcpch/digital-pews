# NPEWS Data Model

This document describes the data structures used in the NPEWS (National Paediatric Early Warning Score) chart UI application.

## Overview

The data model consists of five main entities:
1. **Patient** - demographic and admission information
2. **Observation** - a single set of vital sign measurements at a point in time
3. **AgeBand** - age-specific scoring thresholds and chart display configuration
4. **ScoringBand** - threshold ranges that map vital sign values to PEWS scores
5. **EscalationLevel** - metadata for the four escalation levels (low, medium, high, emergency)

---

## 1. Patient

Represents a patient's demographic information and current admission details.

### Structure

```javascript
{
  name: string,              // Full name
  dob: string,               // Date of birth (ISO 8601 format: YYYY-MM-DD)
  age: string,               // Human-readable age (e.g., "7 years")
  ageBracket: string,        // Age bracket for display (e.g., "5-12")
  ageBand: string,           // Age band key for scoring lookup (e.g., "5-12y")
  nhsNumber: string,         // NHS number (formatted with spaces)
  ward: string,              // Ward name
  bed: string,               // Bed number
  consultant: string,        // Consultant name
  admittedAt: string,        // Admission timestamp (ISO 8601)
}
```

### Example

```javascript
{
  name: 'Alex Thompson',
  dob: '2017-03-14',
  age: '7 years',
  ageBracket: '5-12',
  ageBand: '5-12y',
  nhsNumber: '943 476 5210',
  ward: 'Paediatric Ward B',
  bed: '12',
  consultant: 'Dr S. Patel',
  admittedAt: '2025-01-10T08:00:00',
}
```

### Notes

- `ageBand` must match one of the keys in `AGE_BANDS`: `'0-11m'`, `'1-4y'`, `'5-12y'`, `'13+y'`
- This key determines which scoring thresholds and chart ranges are used

---

## 2. Observation

Represents a single set of vital sign measurements taken at a specific time.

### Structure

```javascript
{
  id: string,                              // Unique observation ID
  timestamp: string,                       // ISO 8601 timestamp
  
  // Respiratory parameters
  respiratoryRate: number | null,          // breaths/min
  respiratoryRate_skipReason?: string,     // Skip reason code (if null)
  respiratoryDistress: string | null,      // 'none'|'mild'|'moderate'|'severe'
  respiratoryDistress_skipReason?: string,
  
  // Oxygen parameters
  oxygenSaturation: number | null,         // % (0-100)
  oxygenSaturation_skipReason?: string,
  oxygenDevice: string | null,             // Device code (see observation-options.md)
  oxygenDevice_skipReason?: string,
  oxygenDelivery: {                        // null if no supplemental O2
    value: number,
    unit: '%' | 'L/min'
  } | null,
  oxygenDelivery_skipReason?: string,
  
  // Cardiovascular parameters
  heartRate: number | null,                // bpm
  heartRate_skipReason?: string,
  bloodPressureSystolic: number | null,    // mmHg
  bloodPressureSystolic_skipReason?: string,
  bloodPressureDiastolic: number | null,   // mmHg
  bloodPressureDiastolic_skipReason?: string,
  capillaryRefill: number | null,          // seconds
  capillaryRefill_skipReason?: string,
  
  // Neurological parameters
  avpu: string | null,                     // 'A'|'V'|'P'|'U'
  avpu_skipReason?: string,
  
  // Temperature
  temperature: number | null,              // °C
  temperature_skipReason?: string,
  
  // Calculated scores
  pewsTotal: number,                       // Total PEWS score
  escalationLevel: string | null,          // 'low'|'medium'|'high'|'emergency' or null
}
```

### Example

```javascript
{
  id: 'obs-4',
  timestamp: '2025-01-10T11:00:00',
  respiratoryRate: 35,
  respiratoryDistress: 'moderate',
  oxygenSaturation: 93,
  oxygenDevice: 'NP',
  oxygenDelivery: { value: 35, unit: '%' },
  heartRate: 128,
  bloodPressureSystolic: 96,
  bloodPressureDiastolic: 62,
  capillaryRefill: 3,
  avpu: 'A',
  temperature: 38.6,
  pewsTotal: 7,
  escalationLevel: 'medium',
}
```

### Skip Reasons

When a vital sign cannot be measured, the value is set to `null` and a corresponding `*_skipReason` field is added. Valid skip reason codes are defined in `spec/observation-options.md`:

- `'refused'` - Patient/family refused
- `'unable'` - Unable to obtain reading
- `'procedure'` - Patient in procedure
- `'asleep'` - Patient asleep

### Oxygen Delivery

The `oxygenDelivery` field has special semantics:
- `null` indicates no supplemental oxygen (room air)
- When present, it's an object with `value` and `unit` properties
- `unit` can be either `'%'` (FiO2 percentage) or `'L/min'` (flow rate)
- **Important**: A change in `unit` causes a visual line break in the chart (discontinuity)

### Oxygen Device Codes

Common device codes (see `spec/observation-options.md` for full list):
- `'air'` - Room air (no supplemental O2)
- `'NP'` - Nasal prongs/cannula
- `'FM'` - Face mask
- `'HF'` - High flow nasal oxygen
- `'CPAP'` - CPAP
- `'NIV'` - Non-invasive ventilation
- `'MV'` - Mechanical ventilation

---

## 3. AgeBand

Defines age-specific scoring thresholds and chart display parameters for one age group.

### Structure

```javascript
{
  label: string,              // Display name (e.g., "5-12 Years")
  headerColor: string,        // Header banner color (hex)
  chartConfig: {              // Chart Y-axis configuration for each parameter
    [parameterName]: {
      label: string,          // Display label
      unit: string,           // Unit of measurement
      yMin: number,           // Y-axis minimum
      yMax: number,           // Y-axis maximum
      step: number,           // Y-axis tick interval
    }
  },
  scoringBands: {             // Scoring thresholds for each parameter
    [parameterName]: ScoringBand[]
  }
}
```

### Chart Parameters

Each age band defines chart configuration for six parameters:
1. `respiratoryRate`
2. `heartRate`
3. `bloodPressureSystolic`
4. `oxygenSaturation`
5. `temperature`
6. `oxygenDelivery`

### Scoring Parameters

Scoring bands are defined for:
1. `respiratoryRate`
2. `heartRate`
3. `bloodPressureSystolic`
4. `oxygenSaturation`
5. `temperature`
6. `oxygenDeliveryPercent` (for FiO2 in %)
7. `oxygenDeliveryLpm` (for flow rate in L/min)

### Example

```javascript
{
  label: '5-12 Years',
  headerColor: '#FFFF00',
  chartConfig: {
    respiratoryRate: { 
      label: 'Respiratory Rate', 
      unit: 'breaths/min', 
      yMin: 0, 
      yMax: 60, 
      step: 10 
    },
    // ... other parameters
  },
  scoringBands: {
    respiratoryRate: [
      { min: 0,   max: 9.99,  score: 4, color: 'pink'   },
      { min: 10,  max: 14.99, score: 2, color: 'orange' },
      { min: 15,  max: 19.99, score: 1, color: 'yellow' },
      { min: 20,  max: 24.99, score: 0, color: 'white'  },
      { min: 25,  max: 39.99, score: 1, color: 'yellow' },
      { min: 40,  max: 49.99, score: 2, color: 'orange' },
      { min: 50,  max: 999,   score: 4, color: 'pink'   },
    ],
    // ... other parameters
  }
}
```

### Age Band Keys

Four age bands are defined:
- `'0-11m'` - 0 to 11 months (pink header)
- `'1-4y'` - 1-4 years (orange header)
- `'5-12y'` - 5-12 years (yellow header)
- `'13+y'` - 13+ years (grey header)

---

## 4. ScoringBand

Defines a threshold range that maps a vital sign value to a PEWS score and display color.

### Structure

```javascript
{
  min: number,      // Minimum value (inclusive)
  max: number,      // Maximum value (inclusive)
  score: number,    // PEWS score (0, 1, 2, or 4)
  color: string,    // Display color ('white'|'yellow'|'orange'|'pink')
}
```

### Example

```javascript
{ min: 20, max: 24.99, score: 0, color: 'white' }
```

### Scoring Colors

- `'white'` - Score 0 (normal range)
- `'yellow'` - Score 1 (mild concern)
- `'orange'` - Score 2 (moderate concern)
- `'pink'` - Score 4 (severe concern)

### Range Semantics

- Ranges are **inclusive** on both ends
- Ranges should be contiguous (no gaps)
- The maximum value in the last band is typically set to 999 to catch all high values
- For decimal values (e.g., O2 saturation), use `.99` to avoid overlaps (e.g., `max: 94.99` vs `min: 95`)

---

## 5. EscalationLevel

Metadata for the four escalation levels that trigger based on total PEWS score.

### Structure

```javascript
{
  label: string,       // Display label
  color: string,       // Background color (hex)
  textColor: string,   // Text color (hex)
  pewsRange: string,   // Score range (e.g., "5-8")
  action: string,      // Required action text
}
```

### Escalation Levels

```javascript
{
  low: {
    label: 'Low',
    color: '#1d70b8',
    textColor: '#fff',
    pewsRange: '1-4',
    action: 'Reassess within 60 minutes. Inform Nurse in Charge.'
  },
  medium: {
    label: 'Medium',
    color: '#ffdd00',
    textColor: '#0b0c0c',
    pewsRange: '5-8',
    action: 'Medical review within 30 minutes. Continuous SpO2 monitoring.'
  },
  high: {
    label: 'High',
    color: '#f47738',
    textColor: '#fff',
    pewsRange: '9-12',
    action: 'Rapid Review within 15 minutes. Call Nurse in Charge immediately.'
  },
  emergency: {
    label: 'Emergency',
    color: '#d4351c',
    textColor: '#fff',
    pewsRange: '13+',
    action: 'Call 2222 immediately: "Paediatric Medical Emergency". Inform consultant urgently.'
  }
}
```

### Score Mapping

- **PEWS 0**: No escalation
- **PEWS 1-4**: Low escalation
- **PEWS 5-8**: Medium escalation
- **PEWS 9-12**: High escalation
- **PEWS 13+**: Emergency escalation

---

## Data Files

The data model is split across two files:

1. **`npews-scoring-config.js`** - Contains `AGE_BANDS` and `ESCALATION_META`
   - Age-specific scoring thresholds
   - Chart display parameters
   - Escalation level metadata

2. **`demo-data.js`** - Contains `PATIENT` and `OBSERVATIONS`
   - Fictional test patient data
   - 18 observation sets spanning 24 hours
   - Demonstrates normal -> deterioration -> recovery scenario

The `chart.js` file derives `SCORING_BANDS` and `CHART_CONFIG` directly from `AGE_BANDS[PATIENT.ageBand]` at runtime.

---

## Validation Rules

### Required Fields

All observations must have:
- `id` (unique)
- `timestamp` (ISO 8601)
- `pewsTotal` (calculated score)
- `escalationLevel` (can be null for score 0)

### Constraints

- AVPU must be one of: `'A'`, `'V'`, `'P'`, `'U'`
- Respiratory distress must be one of: `'none'`, `'mild'`, `'moderate'`, `'severe'`
- Escalation level must be one of: `null`, `'low'`, `'medium'`, `'high'`, `'emergency'`
- Temperature values should be in Celsius (typically 35-41°C)
- Oxygen saturation should be 0-100%
- Heart rate and respiratory rate should be positive integers
- Blood pressure should be positive integers (mmHg)
- Capillary refill should be a positive number (seconds)

### Null Handling

- Any vital sign parameter can be `null` (skipped)
- When a parameter is `null`, a corresponding `*_skipReason` field should be present
- `oxygenDelivery` is `null` when patient is on room air (no supplemental oxygen)

---

## See Also

- `spec/npews-scoring.md` - Detailed scoring tables by age bracket
- `spec/escalation.md` - Escalation guidance and timings
- `spec/observation-options.md` - Valid device codes and skip reasons
