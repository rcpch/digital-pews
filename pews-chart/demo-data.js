// Fictional test data for NPEWS chart UI
// Patient: 7-year-old (age bracket 5-12 years)
// 18 observation sets over 24 hours, showing normal -> deterioration -> escalation -> recovery

const PATIENT = {
  name: 'Alex Thompson',
  dob: '2017-03-14',
  age: '7 years',
  ageBracket: '5-12',
  ageBand: '5-12y',  // NEW: age band identifier for age-specific scoring/display
  nhsNumber: '943 476 5210',
  ward: 'Paediatric Ward B',
  bed: '12',
  consultant: 'Dr S. Patel',
  admittedAt: '2025-01-10T08:00:00',
};

// Each observation set has a timestamp and values for each parameter.
// null = skipped. skipReason codes from spec/observation-options.md
// O2 delivery uses { value, unit: '%' | 'L/min' } - a unit change causes a chart line break
// Data spans a full 24-hour admission day (00:00 - 23:00) to support the 24h default view.
// The first 8 observations (00:00 - 07:00) represent a stable overnight period.
// From 08:00 the patient deteriorates as documented in the original 8 obs.

const OBSERVATIONS = [
  {
    id: 'obs-n1',
    timestamp: '2025-01-10T00:00:00',
    respiratoryRate: 20,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 88,
    bloodPressureSystolic: 98,
    bloodPressureDiastolic: 62,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 36.8,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-n2',
    timestamp: '2025-01-10T01:00:00',
    respiratoryRate: 21,
    respiratoryDistress: 'none',
    oxygenSaturation: 98,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 86,
    bloodPressureSystolic: 99,
    bloodPressureDiastolic: 63,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 36.9,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-n3',
    timestamp: '2025-01-10T02:00:00',
    respiratoryRate: 20,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 84,
    bloodPressureSystolic: 97,
    bloodPressureDiastolic: 61,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 36.8,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-n4',
    timestamp: '2025-01-10T03:00:00',
    respiratoryRate: 19,
    respiratoryDistress: 'none',
    oxygenSaturation: 98,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 83,
    bloodPressureSystolic: 96,
    bloodPressureDiastolic: 60,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 36.7,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-n5',
    timestamp: '2025-01-10T04:00:00',
    respiratoryRate: 20,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 85,
    bloodPressureSystolic: 97,
    bloodPressureDiastolic: 61,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 36.8,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-n6',
    timestamp: '2025-01-10T05:00:00',
    respiratoryRate: 21,
    respiratoryDistress: 'none',
    oxygenSaturation: 98,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 87,
    bloodPressureSystolic: 99,
    bloodPressureDiastolic: 63,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 36.9,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-n7',
    timestamp: '2025-01-10T06:00:00',
    respiratoryRate: 22,
    respiratoryDistress: 'none',
    oxygenSaturation: 98,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 90,
    bloodPressureSystolic: 100,
    bloodPressureDiastolic: 64,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.0,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-n8',
    timestamp: '2025-01-10T07:00:00',
    respiratoryRate: 22,
    respiratoryDistress: 'none',
    oxygenSaturation: 98,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 92,
    bloodPressureSystolic: 100,
    bloodPressureDiastolic: 65,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.0,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-1',
    timestamp: '2025-01-10T08:00:00',
    respiratoryRate: 22,           // white (normal for 5-12: 20-24)
    respiratoryDistress: 'none',
    oxygenSaturation: 98,          // white
    oxygenDevice: 'air',           // air/no support
    oxygenDelivery: null,          // no supplemental O2
    heartRate: 95,                 // white (normal for 5-12: 80-119)
    bloodPressureSystolic: 100,    // white (normal for 5-12: 90-109)
    bloodPressureDiastolic: 65,
    capillaryRefill: 2,            // white (<= 2s)
    avpu: 'A',
    temperature: 37.1,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-2',
    timestamp: '2025-01-10T09:00:00',
    respiratoryRate: 25,           // yellow (25-39 for 5-12)
    respiratoryDistress: 'none',
    oxygenSaturation: 96,          // white
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 105,                // white
    bloodPressureSystolic: 102,    // white
    bloodPressureDiastolic: 68,
    capillaryRefill: 2,            // white
    avpu: 'A',
    temperature: 37.8,
    pewsTotal: 1,
    escalationLevel: null,
  },
  {
    id: 'obs-3',
    timestamp: '2025-01-10T10:00:00',
    respiratoryRate: 30,           // yellow
    respiratoryDistress: 'mild',   // yellow (+1)
    oxygenSaturation: 94,          // yellow (91.01-94.99)
    oxygenDevice: 'NP',            // nasal prongs (white device)
    oxygenDelivery: { value: 24, unit: '%' },  // yellow (16-29.99%)
    heartRate: 118,                // white
    bloodPressureSystolic: null,   // SKIPPED
    bloodPressureSystolic_skipReason: 'unable',
    bloodPressureDiastolic: null,
    capillaryRefill: 2,            // white
    avpu: 'A',
    temperature: 38.2,
    pewsTotal: 4,
    escalationLevel: null,
  },
  {
    id: 'obs-4',
    timestamp: '2025-01-10T11:00:00',
    respiratoryRate: 35,           // yellow
    respiratoryDistress: 'moderate', // orange (+2)
    oxygenSaturation: 93,          // yellow
    oxygenDevice: 'NP',
    oxygenDelivery: { value: 35, unit: '%' },  // orange (30-49.99%)
    heartRate: 128,                // yellow (120-139 for 5-12)
    bloodPressureSystolic: 96,     // white (90-109)
    bloodPressureDiastolic: 62,
    capillaryRefill: 3,            // orange (>= 3s)
    avpu: 'A',
    temperature: 38.6,
    pewsTotal: 7,
    escalationLevel: 'medium',
  },
  {
    id: 'obs-5',
    timestamp: '2025-01-10T11:30:00',
    respiratoryRate: 40,           // orange (40-49 for 5-12)
    respiratoryDistress: 'moderate', // orange
    oxygenSaturation: 91,          // pink (<= 91)
    oxygenDevice: 'FM',            // face mask (white device) - UNIT CHANGE from % to L/min
    oxygenDelivery: { value: 6, unit: 'L/min' }, // orange (2-5.99 L/min... actually 6 = pink)
    heartRate: 138,                // yellow
    bloodPressureSystolic: 92,     // white
    bloodPressureDiastolic: 58,
    capillaryRefill: 3,            // orange
    avpu: 'A',
    temperature: 39.0,
    pewsTotal: 9,
    escalationLevel: 'high',
  },
  {
    id: 'obs-6',
    timestamp: '2025-01-10T12:00:00',
    respiratoryRate: 42,           // orange
    respiratoryDistress: 'severe', // pink (+4)
    oxygenSaturation: 89,          // pink
    oxygenDevice: 'HF',            // high flow - pink device (+4)
    oxygenDelivery: { value: 10, unit: 'L/min' }, // pink (>= 6 L/min)
    heartRate: 148,                // orange (140-159 for 5-12)
    bloodPressureSystolic: 85,     // yellow (80-89 for 5-12)
    bloodPressureDiastolic: 52,
    capillaryRefill: 4,            // orange
    avpu: 'V',
    temperature: 39.4,
    pewsTotal: 13,
    escalationLevel: 'emergency',
  },
  {
    id: 'obs-7',
    timestamp: '2025-01-10T12:30:00',
    respiratoryRate: 38,           // yellow (25-39)
    respiratoryDistress: 'moderate', // orange
    oxygenSaturation: 92,          // yellow
    oxygenDevice: 'HF',
    oxygenDelivery: { value: 8, unit: 'L/min' }, // pink
    heartRate: 140,                // orange (140-159)
    bloodPressureSystolic: 88,     // yellow
    bloodPressureDiastolic: 55,
    capillaryRefill: 3,            // orange
    avpu: 'A',
    temperature: 38.9,
    pewsTotal: 10,
    escalationLevel: 'high',
  },
  {
    id: 'obs-8',
    timestamp: '2025-01-10T13:00:00',
    respiratoryRate: null,         // SKIPPED - patient in procedure
    respiratoryRate_skipReason: 'procedure',
    respiratoryDistress: null,
    respiratoryDistress_skipReason: 'procedure',
    oxygenSaturation: 94,          // yellow
    oxygenDevice: 'HF',
    oxygenDelivery: { value: 6, unit: 'L/min' }, // pink
    heartRate: 130,                // yellow (120-139)
    bloodPressureSystolic: 94,     // white
    bloodPressureDiastolic: 60,
    capillaryRefill: 2,            // white
    avpu: 'A',
    temperature: 38.5,
    pewsTotal: 6,
    escalationLevel: 'medium',
  },
  {
    id: 'obs-9',
    timestamp: '2025-01-10T14:00:00',
    respiratoryRate: 32,
    respiratoryDistress: 'mild',
    oxygenSaturation: 95,
    oxygenDevice: 'NP',
    oxygenDelivery: { value: 4, unit: 'L/min' },
    heartRate: 122,
    bloodPressureSystolic: 97,
    bloodPressureDiastolic: 61,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 38.3,
    pewsTotal: 5,
    escalationLevel: 'medium',
  },
  {
    id: 'obs-10',
    timestamp: '2025-01-10T15:00:00',
    respiratoryRate: 28,
    respiratoryDistress: 'mild',
    oxygenSaturation: 96,
    oxygenDevice: 'NP',
    oxygenDelivery: { value: 2, unit: 'L/min' },
    heartRate: 115,
    bloodPressureSystolic: 99,
    bloodPressureDiastolic: 63,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 38.0,
    pewsTotal: 3,
    escalationLevel: 'low',
  },
  {
    id: 'obs-11',
    timestamp: '2025-01-10T16:00:00',
    respiratoryRate: 26,
    respiratoryDistress: 'none',
    oxygenSaturation: 97,
    oxygenDevice: 'NP',
    oxygenDelivery: { value: 1, unit: 'L/min' },
    heartRate: 108,
    bloodPressureSystolic: 101,
    bloodPressureDiastolic: 64,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.8,
    pewsTotal: 2,
    escalationLevel: 'low',
  },
  {
    id: 'obs-12',
    timestamp: '2025-01-10T17:00:00',
    respiratoryRate: 24,
    respiratoryDistress: 'none',
    oxygenSaturation: 97,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 104,
    bloodPressureSystolic: 102,
    bloodPressureDiastolic: 65,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.6,
    pewsTotal: 1,
    escalationLevel: null,
  },
  {
    id: 'obs-13',
    timestamp: '2025-01-10T18:00:00',
    respiratoryRate: 22,
    respiratoryDistress: 'none',
    oxygenSaturation: 98,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 98,
    bloodPressureSystolic: 103,
    bloodPressureDiastolic: 66,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.4,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-14',
    timestamp: '2025-01-10T19:00:00',
    respiratoryRate: 22,
    respiratoryDistress: 'none',
    oxygenSaturation: 98,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 96,
    bloodPressureSystolic: 102,
    bloodPressureDiastolic: 65,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.3,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-15',
    timestamp: '2025-01-10T20:00:00',
    respiratoryRate: 21,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 93,
    bloodPressureSystolic: 101,
    bloodPressureDiastolic: 64,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.2,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-16',
    timestamp: '2025-01-10T21:00:00',
    respiratoryRate: 21,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 91,
    bloodPressureSystolic: 100,
    bloodPressureDiastolic: 63,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.1,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-17',
    timestamp: '2025-01-10T22:00:00',
    respiratoryRate: 20,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 89,
    bloodPressureSystolic: 99,
    bloodPressureDiastolic: 62,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.0,
    pewsTotal: 0,
    escalationLevel: null,
  },
  {
    id: 'obs-18',
    timestamp: '2025-01-10T23:00:00',
    respiratoryRate: 20,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 88,
    bloodPressureSystolic: 98,
    bloodPressureDiastolic: 62,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 36.9,
    pewsTotal: 0,
    escalationLevel: null,
  },
];
