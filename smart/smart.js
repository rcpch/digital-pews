/* ============================================================
   SMART-on-FHIR shell — patient demographics only.

   This is intentionally minimal: it boots the SMART client, reads
   the launch patient, and renders their demographics. The NPEWS
   chart will be wired in later by feeding the same patient + their
   Observation resources into <npews-chart>.

   fhirclient.js (loaded via <script> in index.html) publishes a
   global `FHIR` object. We use it directly — no bundler, no build
   step, in keeping with the project's framework-neutral rule.
   ============================================================ */

const host = document.getElementById('patient-host');

/**
 * Render a status line into the host (loading or error states).
 * @param {string} message
 * @param {'loading'|'error'} [kind='loading']
 */
function setStatus(message, kind = 'loading') {
  host.innerHTML = `<p class="patient-status patient-status--${kind}">${escapeHtml(message)}</p>`;
}

/** Minimal HTML-escaper so we never inject raw FHIR strings as HTML. */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/**
 * Pull a single human-readable name out of a FHIR Patient.name array.
 * Prefers `text`, then a `usual`/`official` use, then the first entry.
 * @param {Array} names
 * @returns {string}
 */
function formatName(names) {
  if (!Array.isArray(names) || names.length === 0) return '—';
  const withText = names.find(n => n.text);
  if (withText) return withText.text;
  const n = names.find(x => x.use === 'usual') || names[0];
  const given = Array.isArray(n.given) ? n.given.join(' ') : (n.given || '');
  const family = n.family || '';
  const prefix = Array.isArray(n.prefix) ? n.prefix.join(' ') : (n.prefix || '');
  return [prefix, given, family].filter(Boolean).join(' ').trim() || '—';
}

/**
 * Render a Patient resource as a small demographics card.
 * @param {fhir.Patient} patient
 * @param {string} patientId  resolved launch patient id (Patient/<id>)
 */
function renderPatient(patient, patientId) {
  const name = formatName(patient.name);
  const dob = patient.birthDate || '—';
  const gender = patient.gender ? capitalise(patient.gender) : '—';
  const nhsNumber = findIdentifier(patient.identifier, 'https://fhir.nhs.uk/Id/nhs-number');
  const mrn = findIdentifier(patient.identifier, 'http://terminology.hl7.org/CodeSystem/v2-0208'); // MRN-ish

  host.innerHTML = `
    <article class="patient-card">
      <h2 class="patient-card__heading">${escapeHtml(name)}</h2>

      <div class="patient-card__label">Patient ID</div>
      <div class="patient-card__value">${escapeHtml(patientId)}</div>

      <div class="patient-card__label">Date of birth</div>
      <div class="patient-card__value">${escapeHtml(dob)}</div>

      <div class="patient-card__label">Sex</div>
      <div class="patient-card__value">${escapeHtml(gender)}</div>

      ${nhsNumber ? `
        <div class="patient-card__label">NHS number</div>
        <div class="patient-card__value">${escapeHtml(nhsNumber)}</div>
      ` : ''}

      ${mrn ? `
        <div class="patient-card__label">MRN</div>
        <div class="patient-card__value">${escapeHtml(mrn)}</div>
      ` : ''}
    </article>
  `;
}

/** Find the first identifier value matching a system URL. */
function findIdentifier(identifiers, system) {
  if (!Array.isArray(identifiers)) return null;
  const match = identifiers.find(i => i.system === system && i.value);
  return match ? match.value : null;
}

function capitalise(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

// --- Boot -----------------------------------------------------

/**
 * fhirclient's ready() resolves once the OAuth dance is complete and
 * a FhirClient instance is available. The client carries the launch
 * patient id (from the `patient/*.read` scope + `launch` context).
 */
FHIR.oauth2.ready()
  .then(client => {
    // The launch patient id is on client.patient.id (string) per the
    // SMART spec when the `launch/patient` context was used.
    const patientId = client.patient.id;

    if (!patientId) {
      setStatus('No launch patient in the SMART context. Open this app from an EHR patient launch.', 'error');
      return null;
    }

    setStatus(`Loading patient ${patientId}…`);
    // client.patient.read() is a convenience for `Patient/{client.patient.id}`.
    return client.patient.read().then(patient => ({ patient, patientId: `Patient/${patientId}` }));
  })
  .then(result => {
    if (!result) return;
    renderPatient(result.patient, result.patientId);
  })
  .catch(err => {
    console.error('SMART on FHIR boot failed:', err);
    const msg = (err && err.message) ? err.message : 'Unknown error initialising the SMART session.';
    setStatus(`Failed to initialise: ${msg}`, 'error');
  });
