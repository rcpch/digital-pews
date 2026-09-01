// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

import { describe, expect, it } from 'vitest';
import { nearestObservationIndex, observationTimelinePositions } from '../../demo/playback-math.js';

describe('demo playback timeline maths', () => {
  it('spaces observations according to elapsed time', () => {
    const positions = observationTimelinePositions([
      { timestamp: '2026-01-01T08:00:00Z' },
      { timestamp: '2026-01-01T09:00:00Z' },
      { timestamp: '2026-01-01T09:30:00Z' },
      { timestamp: '2026-01-01T12:00:00Z' },
    ]);
    expect(positions).toEqual([0, 0.25, 0.375, 1]);
  });

  it('selects the nearest observation on an irregular timeline', () => {
    const positions = [0, 0.25, 0.375, 1];
    expect(nearestObservationIndex(positions, 0.1)).toBe(0);
    expect(nearestObservationIndex(positions, 0.3)).toBe(1);
    expect(nearestObservationIndex(positions, 0.5)).toBe(2);
    expect(nearestObservationIndex(positions, 0.9)).toBe(3);
  });

  it('handles one observation and observations at the same instant', () => {
    expect(observationTimelinePositions([{ timestamp: '2026-01-01T08:00:00Z' }])).toEqual([0]);
    expect(observationTimelinePositions([
      { timestamp: '2026-01-01T08:00:00Z' },
      { timestamp: '2026-01-01T08:00:00Z' },
      { timestamp: '2026-01-01T08:00:00Z' },
    ])).toEqual([0, 0.5, 1]);
  });

  it('rejects invalid and out-of-order timestamps', () => {
    expect(() => observationTimelinePositions([{ timestamp: 'not-a-date' }])).toThrow(/valid timestamps/);
    expect(() => observationTimelinePositions([
      { timestamp: '2026-01-01T09:00:00Z' },
      { timestamp: '2026-01-01T08:00:00Z' },
    ])).toThrow(/timestamp order/);
  });
});
