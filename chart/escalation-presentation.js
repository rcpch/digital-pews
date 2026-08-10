/**
 * Select the prominent status label without turning warnings or incomplete raw
 * concern responses into escalation levels. An active escalation always wins.
 *
 * @param {object} observation
 * @param {object} escalationMeta
 * @returns {string}
 */
export function escalationStatusLabel(observation, escalationMeta) {
  const meta = escalationMeta[observation.escalationLevel];
  if (meta) return meta.label;
  if ((observation.pendingEscalationResponses || []).length > 0) return 'Level required';
  if ((observation.clinicalWarnings || []).length > 0) return 'Think sepsis';
  return 'Normal';
}
