// NPEWS scoring configuration and age band parameters
// Age band configurations - thresholds and display parameters vary by age
// Extracted from reference PDFs: pews-observation-and-escalation-chart-[age-band]-updated.pdf

const AGE_BANDS = {
  '0-11m': {
    label: '0 to 11 months',
    headerColor: '#FFB6C1',  // pink header banner
    chartConfig: {
      respiratoryRate:      { label: 'Respiratory Rate',      unit: 'breaths/min', yMin: 0,  yMax: 65,  step: 10 },
      heartRate:            { label: 'Heart Rate',            unit: 'bpm',         yMin: 60, yMax: 190, step: 20 },
      bloodPressureSystolic:{ label: 'Blood Pressure (Sys)', unit: 'mmHg',        yMin: 40, yMax: 140, step: 20 },
      oxygenSaturation:     { label: 'O2 Saturation',         unit: '%',           yMin: 80, yMax: 100, step: 5  },
      temperature:          { label: 'Temperature',           unit: '°C',          yMin: 35, yMax: 41,  step: 1  },
      oxygenDelivery:       { label: 'O2 Delivery',           unit: '% / L/min',   yMin: 0,  yMax: 100, step: 20 },
    },
    scoringBands: {
      respiratoryRate: [
        { min: 0,   max: 19.99,  score: 4, color: 'pink'   },
        { min: 20,  max: 24.99,  score: 2, color: 'orange' },
        { min: 25,  max: 60.99,  score: 0, color: 'white'  },
        { min: 61,  max: 999,    score: 2, color: 'orange' },
      ],
      heartRate: [
        { min: 0,   max: 89.99,  score: 4, color: 'pink'   },
        { min: 90,  max: 99.99,  score: 2, color: 'orange' },
        { min: 100, max: 109.99, score: 1, color: 'yellow' },
        { min: 110, max: 160.99, score: 0, color: 'white'  },
        { min: 161, max: 179.99, score: 1, color: 'yellow' },
        { min: 180, max: 999,    score: 4, color: 'pink'   },
      ],
      bloodPressureSystolic: [
        { min: 0,   max: 49.99,  score: 4, color: 'pink'   },
        { min: 50,  max: 59.99,  score: 2, color: 'orange' },
        { min: 60,  max: 69.99,  score: 1, color: 'yellow' },
        { min: 70,  max: 89.99,  score: 0, color: 'white'  },
        { min: 90,  max: 99.99,  score: 1, color: 'yellow' },
        { min: 100, max: 109.99, score: 2, color: 'orange' },
        { min: 110, max: 999,    score: 4, color: 'pink'   },
      ],
      oxygenSaturation: [
        { min: 0,   max: 91,    score: 4, color: 'pink'   },
        { min: 91.01, max: 94.99, score: 1, color: 'yellow' },
        { min: 95,  max: 100,   score: 0, color: 'white'   },
      ],
      temperature: [
        { min: 0,    max: 35.99, score: 0, color: 'white'  },
        { min: 36,   max: 37.99, score: 0, color: 'white'  },
        { min: 38,   max: 38.99, score: 1, color: 'yellow' },
        { min: 39,   max: 39.99, score: 2, color: 'orange' },
        { min: 40,   max: 999,   score: 4, color: 'pink'   },
      ],
      oxygenDeliveryPercent: [
        { min: 0,   max: 15.99,  score: 0, color: 'white'  },
        { min: 16,  max: 29.99,  score: 1, color: 'yellow' },
        { min: 30,  max: 49.99,  score: 2, color: 'orange' },
        { min: 50,  max: 100,    score: 4, color: 'pink'   },
      ],
      oxygenDeliveryLpm: [
        { min: 0,    max: 0.009, score: 0, color: 'white'  },
        { min: 0.01, max: 1.99,  score: 1, color: 'yellow' },
        { min: 2,    max: 5.99,  score: 2, color: 'orange' },
        { min: 6,    max: 20,    score: 4, color: 'pink'   },
      ],
    }
  },
  '1-4y': {
    label: '1-4 Years',
    headerColor: '#FFA500',  // orange header banner
    chartConfig: {
      respiratoryRate:      { label: 'Respiratory Rate',      unit: 'breaths/min', yMin: 0,  yMax: 45,  step: 5 },
      heartRate:            { label: 'Heart Rate',            unit: 'bpm',         yMin: 60, yMax: 160, step: 20 },
      bloodPressureSystolic:{ label: 'Blood Pressure (Sys)', unit: 'mmHg',        yMin: 40, yMax: 140, step: 20 },
      oxygenSaturation:     { label: 'O2 Saturation',         unit: '%',           yMin: 80, yMax: 100, step: 5  },
      temperature:          { label: 'Temperature',           unit: '°C',          yMin: 35, yMax: 41,  step: 1  },
      oxygenDelivery:       { label: 'O2 Delivery',           unit: '% / L/min',   yMin: 0,  yMax: 100, step: 20 },
    },
    scoringBands: {
      respiratoryRate: [
        { min: 0,   max: 14.99,  score: 4, color: 'pink'   },
        { min: 15,  max: 19.99,  score: 2, color: 'orange' },
        { min: 20,  max: 39.99,  score: 0, color: 'white'  },
        { min: 40,  max: 999,    score: 2, color: 'orange' },
      ],
      heartRate: [
        { min: 0,   max: 79.99,  score: 4, color: 'pink'   },
        { min: 80,  max: 89.99,  score: 2, color: 'orange' },
        { min: 90,  max: 99.99,  score: 1, color: 'yellow' },
        { min: 100, max: 140.99, score: 0, color: 'white'  },
        { min: 141, max: 159.99, score: 1, color: 'yellow' },
        { min: 160, max: 999,    score: 4, color: 'pink'   },
      ],
      bloodPressureSystolic: [
        { min: 0,   max: 59.99,  score: 4, color: 'pink'   },
        { min: 60,  max: 69.99,  score: 2, color: 'orange' },
        { min: 70,  max: 79.99,  score: 1, color: 'yellow' },
        { min: 80,  max: 99.99,  score: 0, color: 'white'  },
        { min: 100, max: 109.99, score: 1, color: 'yellow' },
        { min: 110, max: 119.99, score: 2, color: 'orange' },
        { min: 120, max: 999,    score: 4, color: 'pink'   },
      ],
      oxygenSaturation: [
        { min: 0,   max: 91,    score: 4, color: 'pink'   },
        { min: 91.01, max: 94.99, score: 1, color: 'yellow' },
        { min: 95,  max: 100,   score: 0, color: 'white'   },
      ],
      temperature: [
        { min: 0,    max: 35.99, score: 0, color: 'white'  },
        { min: 36,   max: 37.99, score: 0, color: 'white'  },
        { min: 38,   max: 38.99, score: 1, color: 'yellow' },
        { min: 39,   max: 39.99, score: 2, color: 'orange' },
        { min: 40,   max: 999,   score: 4, color: 'pink'   },
      ],
      oxygenDeliveryPercent: [
        { min: 0,   max: 15.99,  score: 0, color: 'white'  },
        { min: 16,  max: 29.99,  score: 1, color: 'yellow' },
        { min: 30,  max: 49.99,  score: 2, color: 'orange' },
        { min: 50,  max: 100,    score: 4, color: 'pink'   },
      ],
      oxygenDeliveryLpm: [
        { min: 0,    max: 0.009, score: 0, color: 'white'  },
        { min: 0.01, max: 1.99,  score: 1, color: 'yellow' },
        { min: 2,    max: 5.99,  score: 2, color: 'orange' },
        { min: 6,    max: 20,    score: 4, color: 'pink'   },
      ],
    }
  },
  '5-12y': {
    label: '5-12 Years',
    headerColor: '#FFFF00',  // yellow header banner
    chartConfig: {
      respiratoryRate:      { label: 'Respiratory Rate',      unit: 'breaths/min', yMin: 0,  yMax: 60,  step: 10 },
      heartRate:            { label: 'Heart Rate',            unit: 'bpm',         yMin: 40, yMax: 180, step: 20 },
      bloodPressureSystolic:{ label: 'Blood Pressure (Sys)', unit: 'mmHg',        yMin: 40, yMax: 160, step: 20 },
      oxygenSaturation:     { label: 'O2 Saturation',         unit: '%',           yMin: 80, yMax: 100, step: 5  },
      temperature:          { label: 'Temperature',           unit: '°C',          yMin: 35, yMax: 41,  step: 1  },
      oxygenDelivery:       { label: 'O2 Delivery',           unit: '% / L/min',   yMin: 0,  yMax: 100, step: 20 },
    },
    scoringBands: {
      respiratoryRate: [
        { min: 0,   max: 9.99,  score: 4, color: 'pink'   },
        { min: 10,  max: 14.99, score: 2, color: 'orange'  },
        { min: 15,  max: 19.99, score: 1, color: 'yellow'  },
        { min: 20,  max: 24.99, score: 0, color: 'white'   },
        { min: 25,  max: 39.99, score: 1, color: 'yellow'  },
        { min: 40,  max: 49.99, score: 2, color: 'orange'  },
        { min: 50,  max: 999,   score: 4, color: 'pink'    },
      ],
      heartRate: [
        { min: 0,   max: 59.99,  score: 4, color: 'pink'   },
        { min: 60,  max: 69.99,  score: 2, color: 'orange'  },
        { min: 70,  max: 79.99,  score: 1, color: 'yellow'  },
        { min: 80,  max: 119.99, score: 0, color: 'white'   },
        { min: 120, max: 139.99, score: 1, color: 'yellow'  },
        { min: 140, max: 159.99, score: 2, color: 'orange'  },
        { min: 160, max: 999,    score: 4, color: 'pink'    },
      ],
      bloodPressureSystolic: [
        { min: 0,   max: 69.99,  score: 4, color: 'pink'   },
        { min: 70,  max: 79.99,  score: 2, color: 'orange'  },
        { min: 80,  max: 89.99,  score: 1, color: 'yellow'  },
        { min: 90,  max: 109.99, score: 0, color: 'white'   },
        { min: 110, max: 119.99, score: 1, color: 'yellow'  },
        { min: 120, max: 129.99, score: 2, color: 'orange'  },
        { min: 130, max: 999,    score: 4, color: 'pink'    },
      ],
      oxygenSaturation: [
        { min: 0,   max: 91,    score: 4, color: 'pink'   },
        { min: 91.01, max: 94.99, score: 1, color: 'yellow' },
        { min: 95,  max: 100,   score: 0, color: 'white'   },
      ],
      temperature: [
        { min: 0,    max: 35.99, score: 0, color: 'white'  },
        { min: 36,   max: 37.99, score: 0, color: 'white'  },
        { min: 38,   max: 38.99, score: 1, color: 'yellow' },
        { min: 39,   max: 39.99, score: 2, color: 'orange' },
        { min: 40,   max: 999,   score: 4, color: 'pink'   },
      ],
      oxygenDeliveryPercent: [
        { min: 0,   max: 15.99,  score: 0, color: 'white'  },
        { min: 16,  max: 29.99,  score: 1, color: 'yellow' },
        { min: 30,  max: 49.99,  score: 2, color: 'orange' },
        { min: 50,  max: 100,    score: 4, color: 'pink'   },
      ],
      oxygenDeliveryLpm: [
        { min: 0,    max: 0.009, score: 0, color: 'white'  },
        { min: 0.01, max: 1.99,  score: 1, color: 'yellow' },
        { min: 2,    max: 5.99,  score: 2, color: 'orange' },
        { min: 6,    max: 20,    score: 4, color: 'pink'   },
      ],
    }
  },
  '13+y': {
    label: '≥13 Years',
    headerColor: '#A9A9A9',  // grey header banner
    chartConfig: {
      respiratoryRate:      { label: 'Respiratory Rate',      unit: 'breaths/min', yMin: 0,  yMax: 35,  step: 5 },
      heartRate:            { label: 'Heart Rate',            unit: 'bpm',         yMin: 40, yMax: 140, step: 20 },
      bloodPressureSystolic:{ label: 'Blood Pressure (Sys)', unit: 'mmHg',        yMin: 40, yMax: 180, step: 20 },
      oxygenSaturation:     { label: 'O2 Saturation',         unit: '%',           yMin: 80, yMax: 100, step: 5  },
      temperature:          { label: 'Temperature',           unit: '°C',          yMin: 35, yMax: 41,  step: 1  },
      oxygenDelivery:       { label: 'O2 Delivery',           unit: '% / L/min',   yMin: 0,  yMax: 100, step: 20 },
    },
    scoringBands: {
      respiratoryRate: [
        { min: 0,   max: 7.99,  score: 4, color: 'pink'   },
        { min: 8,   max: 11.99, score: 1, color: 'yellow' },
        { min: 12,  max: 20.99, score: 0, color: 'white'  },
        { min: 21,  max: 24.99, score: 1, color: 'yellow' },
        { min: 25,  max: 29.99, score: 2, color: 'orange' },
        { min: 30,  max: 999,   score: 4, color: 'pink'   },
      ],
      heartRate: [
        { min: 0,   max: 49.99,  score: 4, color: 'pink'   },
        { min: 50,  max: 59.99,  score: 2, color: 'orange' },
        { min: 60,  max: 69.99,  score: 1, color: 'yellow' },
        { min: 70,  max: 110.99, score: 0, color: 'white'  },
        { min: 111, max: 129.99, score: 1, color: 'yellow' },
        { min: 130, max: 139.99, score: 2, color: 'orange' },
        { min: 140, max: 999,    score: 4, color: 'pink'   },
      ],
      bloodPressureSystolic: [
        { min: 0,   max: 79.99,  score: 4, color: 'pink'   },
        { min: 80,  max: 89.99,  score: 2, color: 'orange' },
        { min: 90,  max: 99.99,  score: 1, color: 'yellow' },
        { min: 100, max: 119.99, score: 0, color: 'white'  },
        { min: 120, max: 129.99, score: 1, color: 'yellow' },
        { min: 130, max: 149.99, score: 2, color: 'orange' },
        { min: 150, max: 999,    score: 4, color: 'pink'   },
      ],
      oxygenSaturation: [
        { min: 0,   max: 91,    score: 4, color: 'pink'   },
        { min: 91.01, max: 94.99, score: 1, color: 'yellow' },
        { min: 95,  max: 100,   score: 0, color: 'white'   },
      ],
      temperature: [
        { min: 0,    max: 35.99, score: 0, color: 'white'  },
        { min: 36,   max: 37.99, score: 0, color: 'white'  },
        { min: 38,   max: 38.99, score: 1, color: 'yellow' },
        { min: 39,   max: 39.99, score: 2, color: 'orange' },
        { min: 40,   max: 999,   score: 4, color: 'pink'   },
      ],
      oxygenDeliveryPercent: [
        { min: 0,   max: 15.99,  score: 0, color: 'white'  },
        { min: 16,  max: 29.99,  score: 1, color: 'yellow' },
        { min: 30,  max: 49.99,  score: 2, color: 'orange' },
        { min: 50,  max: 100,    score: 4, color: 'pink'   },
      ],
      oxygenDeliveryLpm: [
        { min: 0,    max: 0.009, score: 0, color: 'white'  },
        { min: 0.01, max: 1.99,  score: 1, color: 'yellow' },
        { min: 2,    max: 5.99,  score: 2, color: 'orange' },
        { min: 6,    max: 20,    score: 4, color: 'pink'   },
      ],
    }
  },
};

// Escalation metadata
const ESCALATION_META = {
  low:       { label: 'Low',       color: '#1d70b8', textColor: '#fff', pewsRange: '1-4',   action: 'Reassess within 60 minutes. Inform Nurse in Charge.' },
  medium:    { label: 'Medium',    color: '#ffdd00', textColor: '#0b0c0c', pewsRange: '5-8',   action: 'Medical review within 30 minutes. Continuous SpO2 monitoring.' },
  high:      { label: 'High',      color: '#f47738', textColor: '#fff', pewsRange: '9-12',  action: 'Rapid Review within 15 minutes. Call Nurse in Charge immediately.' },
  emergency: { label: 'Emergency', color: '#d4351c', textColor: '#fff', pewsRange: '13+',   action: 'Call 2222 immediately: "Paediatric Medical Emergency". Inform consultant urgently.' },
};
