# NPEWS Chart UI - Data Model Documentation

## Overview

This is a plain HTML/CSS/JS implementation of the NHS National Paediatric Early Warning System (NPEWS) observation chart. It runs directly in a browser with no build step.

## Data Model Extensions

The following data model fields were identified by analyzing the four age band reference PDFs that were not obvious from the original specification:

### Patient Object

```javascript
{
  name: "Patient Name",
  dob: "2019-03-15",
  nhs_number: "123 456 7890",
  hospital_number: "H987654",
  consultant: "Dr. Smith",
  age_band: "5-12y"  // NEW: Required for age-specific thresholds and visual styling
}
```

**New field:**
- `age_band`: String identifying which age-specific chart to use. Valid values: `"0-11m"`, `"1-4y"`, `"5-12y"`, `"13+y"`

### Age Band Configurations

Each age band has different:

1. **Y-axis ranges** for each parameter
2. **Scoring thresholds** (band boundaries)
3. **Header color** for visual identification
4. **Distress/respiratory support labels** (slight variations)

Example age band configuration structure:

```javascript
const AGE_BANDS = {
  "0-11m": {
    label: "0 to 11 months",
    headerColor: "#FFB6C1",  // Pink
    parameters: {
      respiratory_rate: { min: 0, max: 65, unit: "/min" },
      heart_rate: { min: 60, max: 190, unit: "bpm" },
      respiratory_support: { min: 21, max: 100, unit: "%" },
      blood_pressure_systolic: { min: 40, max: 140, unit: "mmHg" },
      capillary_refill: { min: 0, max: 40, unit: "sec" }
    },
    scoring: {
      respiratory_rate: [
        { min: 0, max: 19, score: 3, color: "pink" },
        { min: 20, max: 24, score: 2, color: "orange" },
        { min: 25, max: 60, score: 0, color: "yellow" },
        { min: 61, max: 65, score: 2, color: "orange" }
      ],
      // ... other parameters
    }
  },
  "1-4y": {
    label: "1-4 Years",
    headerColor: "#FFA500",  // Orange
    // ... age-specific ranges and thresholds
  },
  "5-12y": {
    label: "5-12 Years",
    headerColor: "#FFFF00",  // Yellow
    // ... age-specific ranges and thresholds
  },
  "13+y": {
    label: "≥13 Years",
    headerColor: "#A9A9A9",  // Grey
    // ... age-specific ranges and thresholds
  }
}
```

### Observation Objects

No changes required to observation structure, but scoring must now reference the patient's `age_band` to use correct thresholds.

```javascript
{
  timestamp: "2024-12-08T09:00:00",
  respiratory_rate: { value: 28, unit: "/min" },
  heart_rate: { value: 95, unit: "bpm" },
  // ... other measurements
  distress: "mild",
  respiratory_support: { value: 21, unit: "%" },
  // PEWS score calculated using age_band-specific thresholds
  pews_score: 1,
  escalation_level: "low"
}
```

## Visual Styling Requirements

The PDF analysis revealed these visual requirements:

1. **Header banner color** must match age band (see `AGE_BANDS[age_band].headerColor`)
2. **Grid lines** at every Y-axis tick (subtle grey, not just major gridlines)
3. **Y-axis labels** positioned outside chart area (left margin)
4. **Time axis** shows clock times (HH:MM format), not just observation numbers
5. **Band colors** use more saturated palette than initial pastels:
   - Score 3 (pink): `#FFB6D9`
   - Score 2 (orange): `#FFD6A5`
   - Score 0 (yellow): `#FFFFCC`
   - (Blue bands for specific parameters)

## Layout Modes

Three responsive layout modes with different chart heights:

- **Landscape** (>1200px): Full-width, taller charts (180px)
- **Portrait** (768-1199px): Narrower, shorter charts (140px)
- **Mobile** (<768px): Minimal chrome, shortest charts (100px)

User can override auto-detection via toolbar toggle. Implementers can lock layout by setting `data-lock-layout` attribute on `<body>` tag.

## Implementation Files

- `npews-scoring-config.js` - Age band configurations, scoring bands, escalation metadata
- `demo-data.js` - Patient data and observations for demo/testing
- `chart.js` - Chart rendering engine, scoring calculation, layout switching
- `styles.css` - Design tokens, band colors, layout mode styles
- `index.html` - Page structure, patient header, toolbar, charts container

## Scoring Rules

See `spec/npews-scoring.md` for full scoring thresholds per age band.

## Escalation Levels

See `spec/escalation.md` for escalation level definitions and guidance.

## Reference Materials

- `reference-sources/*.pdf` - Official NHS NPEWS charts for each age band
- `reference-sources/images/*.png` - Converted PNG versions for visual comparison
- `spec/spot-npews-ui-spec.md` - Original UI requirements specification
