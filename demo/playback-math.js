// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

/**
 * Map observation timestamps onto a normalized 0..1 timeline so range-input
 * geometry represents elapsed time rather than observation count.
 *
 * @param {Array<{timestamp:string}>} observations
 * @returns {number[]}
 */
export function observationTimelinePositions(observations) {
  const times = observations.map(observation => new Date(observation.timestamp).getTime());
  if (times.some(time => !Number.isFinite(time))) {
    throw new TypeError('playback observations require valid timestamps');
  }
  if (times.some((time, index) => index > 0 && time < times[index - 1])) {
    throw new TypeError('playback observations must be in timestamp order');
  }
  if (times.length <= 1) return times.map(() => 0);

  const start = times[0];
  const span = times[times.length - 1] - start;
  if (span === 0) return times.map((_, index) => index / (times.length - 1));
  return times.map(time => (time - start) / span);
}

/**
 * Select the observation nearest to a normalized pointer position.
 *
 * @param {number[]} positions
 * @param {number} target
 * @returns {number}
 */
export function nearestObservationIndex(positions, target) {
  if (positions.length === 0) return -1;
  let nearestIndex = 0;
  let nearestDistance = Math.abs(positions[0] - target);
  for (let index = 1; index < positions.length; index += 1) {
    const distance = Math.abs(positions[index] - target);
    if (distance < nearestDistance) {
      nearestIndex = index;
      nearestDistance = distance;
    }
  }
  return nearestIndex;
}
