// Fictional test data for NPEWS chart UI
// Patient: 7-year-old (age bracket 5-12 years)
// 18 observation sets over 24 hours, showing normal -> deterioration -> escalation -> recovery
//
// NOTE: observations carry only raw vitals. PEWS totals and escalation levels are
// NEVER hand-typed here — chart.js computes them from these vitals via the scorer
// (npews-scorer.js), using the age band resolved from the patient's date of birth.
// The algorithm is the single source of truth.

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
// null = skipped. skipReason codes from spec/data-model.md (data-entry reference)
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
  },
];

// ---------------------------------------------------------------------------
// 0-11 months: 9-month-old admitted with febrile convulsion at 02:00
// 24-hour observation period covering two seizures and full recovery
// Clinical arc: Emergency → High → Medium → Low → Normal
// ---------------------------------------------------------------------------

const PATIENT_FEBRILE_CONVULSION = {
  name: 'Zara Okafor',
  dob: '2025-06-18',
  age: '9 months',
  ageBracket: '0-11m',
  ageBand: '0-11m',
  nhsNumber: '614 827 3059',
  ward: 'Paediatric Ward A',
  bed: '3',
  consultant: 'Dr A. Okafor',
  admittedAt: '2026-03-18T02:00:00',
};

// Scoring reference (0-11m band):
//   RR: <10=4, 10-19=2, 20-29=1, 30-49=0, 50-59=1, 60-69=2, 70+=4
//   HR: <80=4, 80-89=2, 90-109=1, 110-149=0, 150-169=1, 170-179=2, 180+=4
//   BP sys: <50=4, 50-59=2, 60-69=1, 70-89=0, 90-99=1, 100-109=2, 110+=4
//   SpO2: <=91=4, 91.01-94.99=1, >=95=0
//   Temp: <38=0, 38-38.99=1, 39-39.99=2, >=40=4
//   O2 device: HF/BiP/CP=4 (overrides level); NP/FM/HB/NRB=0 (use level score)
//   O2 level %: air/null=0, 16-29.99=1, 30-49.99=2, >=50=4
//   O2 level L/min: air/null=0, 0.01-1.99=1, 2-5.99=2, >=6=4
//   CRT: <=2=0, >=3=2
//   AVPU: A=0, V=2, P=4, U=4

const OBSERVATIONS_FEBRILE_CONVULSION = [
  {
    // Admission. Post-ictal following 1st tonic-clonic seizure (duration ~2 min, 01:45).
    // Unresponsive to voice (AVPU=V). Moderate respiratory distress. SpO2 94% on NP 20%.
    // Febrile 39.2°C. HR 165 (tachycardic). BP normal for age.
    // Scoring: RR 48=0, distress moderate=2, SpO2 94=1, NP/20%=1, HR 165=1, BP 74=0, CRT 2=0, AVPU V=2, Temp 39.2=2 → PEWS 9
    id: 'obs-1',
    timestamp: '2026-03-18T02:00:00',
    respiratoryRate: 48,
    respiratoryDistress: 'moderate',
    oxygenSaturation: 94,
    oxygenDevice: 'NP',
    oxygenDelivery: { value: 20, unit: '%' },
    heartRate: 165,
    bloodPressureSystolic: 74,
    bloodPressureDiastolic: 48,
    capillaryRefill: 2,
    avpu: 'V',
    temperature: 39.2,
  },
  {
    // 30 min post-admission. Still postictal but responding to name.
    // Mild respiratory distress. SpO2 95% on NP 20%. HR improving slightly.
    // Scoring: RR 44=0, distress mild=1, SpO2 95=0, NP/20%=1, HR 162=1, BP 72=0, CRT 2=0, AVPU V=2, Temp 39.0=2 → PEWS 7
    id: 'obs-2',
    timestamp: '2026-03-18T02:30:00',
    respiratoryRate: 44,
    respiratoryDistress: 'mild',
    oxygenSaturation: 95,
    oxygenDevice: 'NP',
    oxygenDelivery: { value: 20, unit: '%' },
    heartRate: 162,
    bloodPressureDiastolic: 47,
    bloodPressureSystolic: 72,
    capillaryRefill: 2,
    avpu: 'V',
    temperature: 39.0,
  },
  {
    // 03:00. Alert (AVPU A). Recognises mother. Mild distress ongoing. SpO2 96%.
    // NP 20% continued. Temp 39.0°C, tachycardic.
    // Scoring: RR 40=0, distress mild=1, SpO2 96=0, NP/20%=1, HR 158=1, BP 74=0, CRT 2=0, AVPU A=0, Temp 39.0=2 → PEWS 5
    id: 'obs-3',
    timestamp: '2026-03-18T03:00:00',
    respiratoryRate: 40,
    respiratoryDistress: 'mild',
    oxygenSaturation: 96,
    oxygenDevice: 'NP',
    oxygenDelivery: { value: 20, unit: '%' },
    heartRate: 158,
    bloodPressureSystolic: 74,
    bloodPressureDiastolic: 47,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 39.0,
  },
  {
    // 04:00. 2nd seizure begins (focal → generalised, duration ~90 sec).
    // AVPU=P (no response to pain during ictal phase). SpO2 dips to 91% despite face mask 40%.
    // HR 170, CRT 3s (peripheral shutdown during seizure). Temp 39.6°C.
    // Scoring: RR 52=1, distress moderate=2, SpO2 91=4, FM/40%=2, HR 170=2, BP 70=0, CRT 3=2, AVPU P=4, Temp 39.6=2 → PEWS 19 (Emergency)
    id: 'obs-4',
    timestamp: '2026-03-18T04:00:00',
    respiratoryRate: 52,
    respiratoryDistress: 'moderate',
    oxygenSaturation: 91,
    oxygenDevice: 'FM',
    oxygenDelivery: { value: 40, unit: '%' },
    heartRate: 170,
    bloodPressureSystolic: 70,
    bloodPressureDiastolic: 45,
    capillaryRefill: 3,
    avpu: 'P',
    temperature: 39.6,
  },
  {
    // 04:30. Post-ictal. AVPU=V. Seizure self-terminated; buccal midazolam not required.
    // Face mask maintained. SpO2 recovering to 93%. CRT now 2s. Still febrile.
    // Scoring: RR 46=0, distress moderate=2, SpO2 93=1, FM/24%=1, HR 168=1, BP 72=0, CRT 2=0, AVPU V=2, Temp 39.4=2 → PEWS 9
    id: 'obs-5',
    timestamp: '2026-03-18T04:30:00',
    respiratoryRate: 46,
    respiratoryDistress: 'moderate',
    oxygenSaturation: 93,
    oxygenDevice: 'FM',
    oxygenDelivery: { value: 24, unit: '%' },
    heartRate: 168,
    bloodPressureSystolic: 72,
    bloodPressureDiastolic: 46,
    capillaryRefill: 2,
    avpu: 'V',
    temperature: 39.4,
  },
  {
    // 05:00. Alert again. Crying — good sign of neurological recovery.
    // IV paracetamol running. O2 stepped down to NP 20%. SpO2 93% (persistent mild hypoxia).
    // Scoring: RR 44=0, distress mild=1, SpO2 93=1, NP/20%=1, HR 156=1, BP 74=0, CRT 2=0, AVPU A=0, Temp 38.9=1 → PEWS 5
    id: 'obs-6',
    timestamp: '2026-03-18T05:00:00',
    respiratoryRate: 44,
    respiratoryDistress: 'mild',
    oxygenSaturation: 93,
    oxygenDevice: 'NP',
    oxygenDelivery: { value: 20, unit: '%' },
    heartRate: 156,
    bloodPressureSystolic: 74,
    bloodPressureDiastolic: 47,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 38.9,
  },
  {
    // 06:00. Temperature beginning to respond to paracetamol. SpO2 improved to 95%.
    // Less distressed. HR still elevated.
    // Scoring: RR 42=0, distress mild=1, SpO2 95=0, NP/20%=1, HR 150=1, BP 74=0, CRT 2=0, AVPU A=0, Temp 38.7=1 → PEWS 4
    id: 'obs-7',
    timestamp: '2026-03-18T06:00:00',
    respiratoryRate: 42,
    respiratoryDistress: 'mild',
    oxygenSaturation: 95,
    oxygenDevice: 'NP',
    oxygenDelivery: { value: 20, unit: '%' },
    heartRate: 150,
    bloodPressureSystolic: 74,
    bloodPressureDiastolic: 47,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 38.7,
  },
  {
    // 07:00. Temp 38.4°C. Tolerating NP 15%. SpO2 96%. Less irritable.
    // Scoring: RR 40=0, distress mild=1, SpO2 96=0, NP/15%=0, HR 148=0, BP 76=0, CRT 2=0, AVPU A=0, Temp 38.4=1 → PEWS 2
    id: 'obs-8',
    timestamp: '2026-03-18T07:00:00',
    respiratoryRate: 40,
    respiratoryDistress: 'mild',
    oxygenSaturation: 96,
    oxygenDevice: 'NP',
    oxygenDelivery: { value: 15, unit: '%' },
    heartRate: 148,
    bloodPressureSystolic: 76,
    bloodPressureDiastolic: 49,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 38.4,
  },
  {
    // 08:00. Temp 38.2°C. Now on air — NP removed after SpO2 stable >97% on room air.
    // Playful, accepting milk feed.
    // Scoring: RR 38=0, distress none=0, SpO2 97=0, air=0, HR 142=0, BP 76=0, CRT 2=0, AVPU A=0, Temp 38.2=1 → PEWS 1
    id: 'obs-9',
    timestamp: '2026-03-18T08:00:00',
    respiratoryRate: 38,
    respiratoryDistress: 'none',
    oxygenSaturation: 97,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 142,
    bloodPressureSystolic: 76,
    bloodPressureDiastolic: 49,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 38.2,
  },
  {
    // 09:00. Temp 37.9°C. Ibuprofen given orally at 08:30. HR settling.
    // Scoring: RR 36=0, distress none=0, SpO2 98=0, air=0, HR 138=0, BP 76=0, CRT 2=0, AVPU A=0, Temp 37.9=0 → PEWS 0
    id: 'obs-10',
    timestamp: '2026-03-18T09:00:00',
    respiratoryRate: 36,
    respiratoryDistress: 'none',
    oxygenSaturation: 98,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 138,
    bloodPressureSystolic: 76,
    bloodPressureDiastolic: 49,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.9,
  },
  {
    // 10:00. Temperature 37.6°C. Fully settled, sleeping between obs.
    // Scoring: RR 34=0, distress none=0, SpO2 98=0, air=0, HR 130=0, BP 78=0, CRT 2=0, AVPU A=0, Temp 37.6=0 → PEWS 0
    id: 'obs-11',
    timestamp: '2026-03-18T10:00:00',
    respiratoryRate: 34,
    respiratoryDistress: 'none',
    oxygenSaturation: 98,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 130,
    bloodPressureSystolic: 78,
    bloodPressureDiastolic: 50,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.6,
  },
  {
    // 11:00. EEG completed. No further seizure activity. Parents reassured.
    // Scoring: RR 34=0, distress none=0, SpO2 99=0, air=0, HR 128=0, BP 78=0, CRT 2=0, AVPU A=0, Temp 37.4=0 → PEWS 0
    id: 'obs-12',
    timestamp: '2026-03-18T11:00:00',
    respiratoryRate: 34,
    respiratoryRate_skipReason: null,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 128,
    bloodPressureSystolic: null,
    bloodPressureSystolic_skipReason: 'procedure',
    bloodPressureDiastolic: null,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.4,
  },
  {
    // 12:00. Resting comfortably. Good urine output.
    // Scoring: RR 32=0, distress none=0, SpO2 99=0, air=0, HR 126=0, BP 78=0, CRT 2=0, AVPU A=0, Temp 37.3=0 → PEWS 0
    id: 'obs-13',
    timestamp: '2026-03-18T12:00:00',
    respiratoryRate: 32,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 126,
    bloodPressureSystolic: 78,
    bloodPressureDiastolic: 50,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.3,
  },
  {
    // 14:00. Paediatric neurology reviewed. Diagnosis: simple febrile seizure (x2).
    // Scoring: RR 32=0, distress none=0, SpO2 99=0, air=0, HR 124=0, BP 78=0, CRT 2=0, AVPU A=0, Temp 37.2=0 → PEWS 0
    id: 'obs-14',
    timestamp: '2026-03-18T14:00:00',
    respiratoryRate: 32,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 124,
    bloodPressureSystolic: 78,
    bloodPressureDiastolic: 50,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.2,
  },
  {
    // 16:00. Ready for discharge planning. Feeding and sleeping normally.
    // Scoring: RR 30=0, distress none=0, SpO2 99=0, air=0, HR 120=0, BP 78=0, CRT 2=0, AVPU A=0, Temp 37.1=0 → PEWS 0
    id: 'obs-15',
    timestamp: '2026-03-18T16:00:00',
    respiratoryRate: 30,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 120,
    bloodPressureSystolic: 78,
    bloodPressureDiastolic: 50,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.1,
  },
  {
    // 18:00. Overnight observation plan confirmed — hourly obs until 06:00.
    // Scoring: RR 30=0, distress none=0, SpO2 99=0, air=0, HR 118=0, BP 76=0, CRT 2=0, AVPU A=0, Temp 37.0=0 → PEWS 0
    id: 'obs-16',
    timestamp: '2026-03-18T18:00:00',
    respiratoryRate: 30,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 118,
    bloodPressureSystolic: 76,
    bloodPressureDiastolic: 49,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.0,
  },
  {
    // 20:00. Sleeping. Mum staying overnight.
    // Scoring: PEWS 0
    id: 'obs-17',
    timestamp: '2026-03-18T20:00:00',
    respiratoryRate: 30,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 118,
    bloodPressureSystolic: 76,
    bloodPressureDiastolic: 49,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 37.0,
  },
  {
    // 22:00. Sleeping, settled.
    // Scoring: PEWS 0
    id: 'obs-18',
    timestamp: '2026-03-18T22:00:00',
    respiratoryRate: 30,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 116,
    bloodPressureSystolic: 76,
    bloodPressureDiastolic: 48,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 36.9,
  },
  {
    // 00:00. Overnight check. Sleeping. No concerns.
    // Scoring: PEWS 0
    id: 'obs-19',
    timestamp: '2026-03-19T00:00:00',
    respiratoryRate: 30,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 114,
    bloodPressureSystolic: 76,
    bloodPressureDiastolic: 48,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 36.9,
  },
  {
    // 02:00. 24-hour mark since admission. Stable and well. Discharge planned for morning.
    // Scoring: PEWS 0
    id: 'obs-20',
    timestamp: '2026-03-19T02:00:00',
    respiratoryRate: 30,
    respiratoryDistress: 'none',
    oxygenSaturation: 99,
    oxygenDevice: 'air',
    oxygenDelivery: null,
    heartRate: 112,
    bloodPressureSystolic: 76,
    bloodPressureDiastolic: 48,
    capillaryRefill: 2,
    avpu: 'A',
    temperature: 36.8,
  },
];

// ---------------------------------------------------------------------------
// Module / browser interop
// index.html loads this as an ES module and reads window.PATIENT / window.OBSERVATIONS
// (the default 5-12y demo). chart.js (also a module) imports nothing from here; it
// reads the window globals on auto-init. Tests/stories import the named exports.
// ---------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.PATIENT = PATIENT;
  window.OBSERVATIONS = OBSERVATIONS;
  window.PATIENT_FEBRILE_CONVULSION = PATIENT_FEBRILE_CONVULSION;
  window.OBSERVATIONS_FEBRILE_CONVULSION = OBSERVATIONS_FEBRILE_CONVULSION;
}

export {
  PATIENT,
  OBSERVATIONS,
  PATIENT_FEBRILE_CONVULSION,
  OBSERVATIONS_FEBRILE_CONVULSION,
};
