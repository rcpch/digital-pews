/* ============================================================
   NPEWS demo scenario catalogue - scenarios.js
   ES module. No build step.

   A single canonical list of demonstration scenarios, each a plain JSON-shaped
   object of { id, title, ageBand, description, patient, observations }. This is
   the data half of the "component takes props" split: the demo harness
   (demo.html / demo.js) renders this catalogue in the sidebar and passes the
   selected scenario straight into the chart via NPEWSChart.render({ patient,
   observations }). The same objects can feed tests or any other host.

   Observations carry raw vitals ONLY - no pewsTotal / escalationLevel. The chart
   computes scores from the vitals and the patient's date of birth.

   The two "full day" scenarios (5-12y default and the 0-11m febrile convulsion)
   are reused from demo-data.js so there is one home for that data. The remaining
   band scenarios and the birthday-crossing showcase are defined here.
   ============================================================ */

import {
  PATIENT,
  OBSERVATIONS,
  PATIENT_FEBRILE_CONVULSION,
  OBSERVATIONS_FEBRILE_CONVULSION,
} from './demo-data.js';

// -- 1-4 years: bronchiolitis-style deterioration and recovery ---------------
const PATIENT_1_4Y = {
  name: 'Jamie Osei',
  dob: '2022-09-22',
  age: '2 years',
  ageBracket: '1-4y',
  ageBand: '1-4y',
  nhsNumber: '748 203 6185',
  ward: 'Paediatric Ward C',
  bed: '7',
  consultant: 'Dr M. Eriksson',
  admittedAt: '2025-02-15T10:00:00',
};

const OBSERVATIONS_1_4Y = [
  { id: 'obs-n1', timestamp: '2025-02-15T00:00:00', respiratoryRate: 26, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 110, bloodPressureSystolic: 88, bloodPressureDiastolic: 56, capillaryRefill: 2, avpu: 'A', temperature: 36.9 },
  { id: 'obs-n2', timestamp: '2025-02-15T02:00:00', respiratoryRate: 24, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 108, bloodPressureSystolic: 86, bloodPressureDiastolic: 54, capillaryRefill: 2, avpu: 'A', temperature: 36.8 },
  { id: 'obs-n3', timestamp: '2025-02-15T04:00:00', respiratoryRate: 25, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 112, bloodPressureSystolic: 87, bloodPressureDiastolic: 55, capillaryRefill: 2, avpu: 'A', temperature: 36.9 },
  { id: 'obs-1',  timestamp: '2025-02-15T06:00:00', respiratoryRate: 26, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 115, bloodPressureSystolic: 90, bloodPressureDiastolic: 58, capillaryRefill: 2, avpu: 'A', temperature: 37.1 },
  { id: 'obs-2',  timestamp: '2025-02-15T08:00:00', respiratoryRate: 30, respiratoryDistress: 'none', oxygenSaturation: 96, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 122, bloodPressureSystolic: 93, bloodPressureDiastolic: 61, capillaryRefill: 2, avpu: 'A', temperature: 37.9 },
  { id: 'obs-3',  timestamp: '2025-02-15T09:00:00', respiratoryRate: 36, respiratoryDistress: 'mild', oxygenSaturation: 94, oxygenDevice: 'NP', oxygenDelivery: { value: 24, unit: '%' }, heartRate: 132, bloodPressureSystolic: 95, bloodPressureDiastolic: 63, capillaryRefill: 2, avpu: 'A', temperature: 38.4 },
  { id: 'obs-4',  timestamp: '2025-02-15T10:00:00', respiratoryRate: 40, respiratoryDistress: 'moderate', oxygenSaturation: 92, oxygenDevice: 'NP', oxygenDelivery: { value: 40, unit: '%' }, heartRate: 142, bloodPressureSystolic: 97, bloodPressureDiastolic: 65, capillaryRefill: 3, avpu: 'A', temperature: 38.9 },
  { id: 'obs-5',  timestamp: '2025-02-15T10:30:00', respiratoryRate: 42, respiratoryDistress: 'severe', oxygenSaturation: 89, oxygenDevice: 'HF', oxygenDelivery: { value: 8, unit: 'L/min' }, heartRate: 155, bloodPressureSystolic: 99, bloodPressureDiastolic: 67, capillaryRefill: 3, avpu: 'V', temperature: 39.2 },
  { id: 'obs-6',  timestamp: '2025-02-15T12:00:00', respiratoryRate: 38, respiratoryDistress: 'mild', oxygenSaturation: 93, oxygenDevice: 'NP', oxygenDelivery: { value: 4, unit: 'L/min' }, heartRate: 140, bloodPressureSystolic: 94, bloodPressureDiastolic: 62, capillaryRefill: 2, avpu: 'A', temperature: 38.6 },
  { id: 'obs-7',  timestamp: '2025-02-15T14:00:00', respiratoryRate: 30, respiratoryDistress: 'none', oxygenSaturation: 97, oxygenDevice: 'NP', oxygenDelivery: { value: 1, unit: 'L/min' }, heartRate: 125, bloodPressureSystolic: 91, bloodPressureDiastolic: 60, capillaryRefill: 2, avpu: 'A', temperature: 38.1 },
  { id: 'obs-8',  timestamp: '2025-02-15T16:00:00', respiratoryRate: 26, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 114, bloodPressureSystolic: 89, bloodPressureDiastolic: 57, capillaryRefill: 2, avpu: 'A', temperature: 37.6 },
  { id: 'obs-9',  timestamp: '2025-02-15T20:00:00', respiratoryRate: 24, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 108, bloodPressureSystolic: 86, bloodPressureDiastolic: 54, capillaryRefill: 2, avpu: 'A', temperature: 37.1 },
];

// -- 13+ years: adolescent sepsis-style deterioration and recovery -----------
const PATIENT_13_PLUS = {
  name: 'Morgan Clarke',
  dob: '2010-11-05',
  age: '15 years',
  ageBracket: '13+y',
  ageBand: '13+y',
  nhsNumber: '371 920 8456',
  ward: 'Adolescent Ward',
  bed: '3',
  consultant: 'Dr P. Nguyen',
  admittedAt: '2025-03-05T14:00:00',
};

const OBSERVATIONS_13_PLUS = [
  { id: 'obs-n1', timestamp: '2025-03-05T00:00:00', respiratoryRate: 14, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 72, bloodPressureSystolic: 108, bloodPressureDiastolic: 68, capillaryRefill: 2, avpu: 'A', temperature: 36.8 },
  { id: 'obs-n2', timestamp: '2025-03-05T02:00:00', respiratoryRate: 13, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 70, bloodPressureSystolic: 106, bloodPressureDiastolic: 66, capillaryRefill: 2, avpu: 'A', temperature: 36.7 },
  { id: 'obs-n3', timestamp: '2025-03-05T04:00:00', respiratoryRate: 14, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 71, bloodPressureSystolic: 107, bloodPressureDiastolic: 67, capillaryRefill: 2, avpu: 'A', temperature: 36.8 },
  { id: 'obs-1',  timestamp: '2025-03-05T06:00:00', respiratoryRate: 15, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 74, bloodPressureSystolic: 110, bloodPressureDiastolic: 70, capillaryRefill: 2, avpu: 'A', temperature: 37.0 },
  { id: 'obs-2',  timestamp: '2025-03-05T08:00:00', respiratoryRate: 18, respiratoryDistress: 'none', oxygenSaturation: 97, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 82, bloodPressureSystolic: 114, bloodPressureDiastolic: 74, capillaryRefill: 2, avpu: 'A', temperature: 37.6 },
  { id: 'obs-3',  timestamp: '2025-03-05T09:00:00', respiratoryRate: 22, respiratoryDistress: 'mild', oxygenSaturation: 95, oxygenDevice: 'NP', oxygenDelivery: { value: 24, unit: '%' }, heartRate: 95, bloodPressureSystolic: 116, bloodPressureDiastolic: 76, capillaryRefill: 2, avpu: 'A', temperature: 38.1 },
  { id: 'obs-4',  timestamp: '2025-03-05T10:00:00', respiratoryRate: 26, respiratoryDistress: 'moderate', oxygenSaturation: 93, oxygenDevice: 'NP', oxygenDelivery: { value: 40, unit: '%' }, heartRate: 108, bloodPressureSystolic: 118, bloodPressureDiastolic: 78, capillaryRefill: 3, avpu: 'A', temperature: 38.7 },
  { id: 'obs-5',  timestamp: '2025-03-05T10:30:00', respiratoryRate: 28, respiratoryDistress: 'severe', oxygenSaturation: 90, oxygenDevice: 'FM', oxygenDelivery: { value: 8, unit: 'L/min' }, heartRate: 126, bloodPressureSystolic: 120, bloodPressureDiastolic: 80, capillaryRefill: 3, avpu: 'V', temperature: 39.1 },
  { id: 'obs-6',  timestamp: '2025-03-05T12:00:00', respiratoryRate: 24, respiratoryDistress: 'mild', oxygenSaturation: 94, oxygenDevice: 'NP', oxygenDelivery: { value: 4, unit: 'L/min' }, heartRate: 115, bloodPressureSystolic: 117, bloodPressureDiastolic: 77, capillaryRefill: 2, avpu: 'A', temperature: 38.8 },
  { id: 'obs-7',  timestamp: '2025-03-05T14:00:00', respiratoryRate: 20, respiratoryDistress: 'none', oxygenSaturation: 96, oxygenDevice: 'NP', oxygenDelivery: { value: 1, unit: 'L/min' }, heartRate: 98, bloodPressureSystolic: 113, bloodPressureDiastolic: 73, capillaryRefill: 2, avpu: 'A', temperature: 38.2 },
  { id: 'obs-8',  timestamp: '2025-03-05T16:00:00', respiratoryRate: 16, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 82, bloodPressureSystolic: 110, bloodPressureDiastolic: 70, capillaryRefill: 2, avpu: 'A', temperature: 37.5 },
  { id: 'obs-9',  timestamp: '2025-03-05T20:00:00', respiratoryRate: 14, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 74, bloodPressureSystolic: 108, bloodPressureDiastolic: 68, capillaryRefill: 2, avpu: 'A', temperature: 36.9 },
];

// -- Birthday crossing: charted across an age-band boundary ------------------
// Sam Rivera turns 5 at midnight part-way through a 24-hour admission. Vitals
// are held roughly constant across the boundary so the score change (PEWS 1 in
// 1-4y -> 0 in 5-12y) is driven purely by the moving age-band thresholds. This
// is the case a paper chart cannot represent: the chart JOINS the two age bands.
const PATIENT_BIRTHDAY_CROSSING = {
  name: 'Sam Rivera',
  dob: '2020-01-11',
  age: '4 years (turns 5 during admission)',
  ageBracket: '1-4',
  ageBand: '1-4y',
  nhsNumber: '725 318 6042',
  ward: 'Paediatric Ward C',
  bed: '7',
  consultant: 'Dr L. Mbeki',
  admittedAt: '2025-01-10T12:00:00',
};

const OBSERVATIONS_BIRTHDAY_CROSSING = [
  { id: 'obs-1', timestamp: '2025-01-10T12:00:00', respiratoryRate: 24, respiratoryDistress: 'none', oxygenSaturation: 97, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 95, bloodPressureSystolic: 100, bloodPressureDiastolic: 64, capillaryRefill: 2, avpu: 'A', temperature: 37.4 },
  { id: 'obs-2', timestamp: '2025-01-10T15:00:00', respiratoryRate: 24, respiratoryDistress: 'none', oxygenSaturation: 97, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 96, bloodPressureSystolic: 101, bloodPressureDiastolic: 65, capillaryRefill: 2, avpu: 'A', temperature: 37.5 },
  { id: 'obs-3', timestamp: '2025-01-10T18:00:00', respiratoryRate: 23, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 94, bloodPressureSystolic: 100, bloodPressureDiastolic: 64, capillaryRefill: 2, avpu: 'A', temperature: 37.3 },
  { id: 'obs-4', timestamp: '2025-01-10T21:00:00', respiratoryRate: 24, respiratoryDistress: 'none', oxygenSaturation: 97, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 95, bloodPressureSystolic: 100, bloodPressureDiastolic: 64, capillaryRefill: 2, avpu: 'A', temperature: 37.4 },
  { id: 'obs-5', timestamp: '2025-01-11T00:00:00', respiratoryRate: 24, respiratoryDistress: 'none', oxygenSaturation: 97, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 95, bloodPressureSystolic: 100, bloodPressureDiastolic: 64, capillaryRefill: 2, avpu: 'A', temperature: 37.4 },
  { id: 'obs-6', timestamp: '2025-01-11T03:00:00', respiratoryRate: 23, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 94, bloodPressureSystolic: 101, bloodPressureDiastolic: 65, capillaryRefill: 2, avpu: 'A', temperature: 37.2 },
  { id: 'obs-7', timestamp: '2025-01-11T06:00:00', respiratoryRate: 22, respiratoryDistress: 'none', oxygenSaturation: 98, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 92, bloodPressureSystolic: 102, bloodPressureDiastolic: 66, capillaryRefill: 2, avpu: 'A', temperature: 37.1 },
  { id: 'obs-8', timestamp: '2025-01-11T09:00:00', respiratoryRate: 22, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 90, bloodPressureSystolic: 103, bloodPressureDiastolic: 66, capillaryRefill: 2, avpu: 'A', temperature: 37.0 },
  { id: 'obs-9', timestamp: '2025-01-11T12:00:00', respiratoryRate: 21, respiratoryDistress: 'none', oxygenSaturation: 99, oxygenDevice: 'air', oxygenDelivery: null, heartRate: 89, bloodPressureSystolic: 103, bloodPressureDiastolic: 66, capillaryRefill: 2, avpu: 'A', temperature: 36.9 },
];

/**
 * Ordered catalogue of demonstration scenarios. Each entry is passed straight to
 * the chart as props: NPEWSChart.render({ patient, observations }).
 * @type {{ id:string, title:string, ageBand:string, description:string,
 *          patient:object, observations:object[] }[]}
 */
export const SCENARIOS = [
  {
    id: '5-12y-deterioration',
    title: 'Alex Thompson',
    ageBand: '5-12y',
    description: '7-year-old, 24-hour admission. Normal \u2192 deterioration to Emergency \u2192 recovery.',
    patient: PATIENT,
    observations: OBSERVATIONS,
  },
  {
    id: '0-11m-febrile-convulsion',
    title: 'Zara Okafor',
    ageBand: '0-11m',
    description: '9-month-old admitted with febrile convulsions. Two seizures, full recovery over 24 hours.',
    patient: PATIENT_FEBRILE_CONVULSION,
    observations: OBSERVATIONS_FEBRILE_CONVULSION,
  },
  {
    id: '1-4y-deterioration',
    title: 'Jamie Osei',
    ageBand: '1-4y',
    description: '2-year-old with respiratory distress. Deterioration to High/Emergency then recovery.',
    patient: PATIENT_1_4Y,
    observations: OBSERVATIONS_1_4Y,
  },
  {
    id: '13y-deterioration',
    title: 'Morgan Clarke',
    ageBand: '13+y',
    description: '15-year-old, sepsis-style deterioration and recovery over an admission day.',
    patient: PATIENT_13_PLUS,
    observations: OBSERVATIONS_13_PLUS,
  },
  {
    id: 'birthday-crossing',
    title: 'Sam Rivera \u2014 birthday crossing',
    ageBand: '1-4y \u2192 5-12y',
    description: 'Turns 5 at midnight mid-admission. The chart joins the 1-4y and 5-12y charts seamlessly; identical vitals score 1 then 0 across the seam.',
    patient: PATIENT_BIRTHDAY_CROSSING,
    observations: OBSERVATIONS_BIRTHDAY_CROSSING,
  },
];

/** Look up a scenario by id. */
export function scenarioById(id) {
  return SCENARIOS.find(s => s.id === id) || null;
}
