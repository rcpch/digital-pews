/**
 * Age-band selection tests
 *
 * Verifies that the applicable NPEWS chart is chosen from a date of birth with
 * calendar exactitude — boundaries land precisely on the 1st / 5th / 13th
 * birthday — and that a window spanning a birthday is split into joinable
 * segments for seamless boundary-crossing rendering.
 */

import { describe, it, expect } from 'vitest';
import {
  completedYears,
  ageBandForCompletedYears,
  ageBandAt,
  resolveAgeBand,
  ageBandBoundariesInRange,
  ageBandSegments,
} from '../../pews-chart/age-band.js';

describe('completedYears (calendar exact)', () => {
  it('is 0 on the day of birth', () => {
    expect(completedYears('2020-06-15', '2020-06-15T09:00:00')).toBe(0);
  });

  it('ticks to 1 exactly on the first birthday', () => {
    expect(completedYears('2020-06-15', '2021-06-15T00:00:00')).toBe(1);
  });

  it('is still 0 the day before the first birthday', () => {
    expect(completedYears('2020-06-15', '2021-06-14T23:59:59')).toBe(0);
  });

  it('is negative before birth', () => {
    expect(completedYears('2020-06-15', '2020-06-14T12:00:00')).toBe(-1);
  });

  // The reason for calendar arithmetic rather than days / 365.25: a child born
  // on a non-leap date can be a hair under N "day-years" on their Nth birthday.
  it('reaches 5 exactly on the 5th birthday across leap years', () => {
    expect(completedYears('2021-01-01', '2026-01-01T00:00:00')).toBe(5);
    expect(completedYears('2021-01-01', '2025-12-31T23:59:59')).toBe(4);
  });
});

describe('ageBandForCompletedYears', () => {
  it('maps each completed-year value to the canonical band', () => {
    expect(ageBandForCompletedYears(0)).toBe('0-11m');
    expect(ageBandForCompletedYears(1)).toBe('1-4y');
    expect(ageBandForCompletedYears(4)).toBe('1-4y');
    expect(ageBandForCompletedYears(5)).toBe('5-12y');
    expect(ageBandForCompletedYears(12)).toBe('5-12y');
    expect(ageBandForCompletedYears(13)).toBe('13+y');
    expect(ageBandForCompletedYears(40)).toBe('13+y');
  });

  it('returns null for a negative age', () => {
    expect(ageBandForCompletedYears(-1)).toBeNull();
  });
});

describe('ageBandAt: band boundaries fall exactly on birthdays', () => {
  const dob = '2019-03-14';
  it('11 months old → 0-11m', () => expect(ageBandAt(dob, '2020-02-14T10:00:00')).toBe('0-11m'));
  it('1st birthday → 1-4y', () => expect(ageBandAt(dob, '2020-03-14T00:00:00')).toBe('1-4y'));
  it('day before 5th birthday → 1-4y', () => expect(ageBandAt(dob, '2024-03-13T23:59:00')).toBe('1-4y'));
  it('5th birthday → 5-12y', () => expect(ageBandAt(dob, '2024-03-14T00:00:00')).toBe('5-12y'));
  it('day before 13th birthday → 5-12y', () => expect(ageBandAt(dob, '2032-03-13T23:59:00')).toBe('5-12y'));
  it('13th birthday → 13+y', () => expect(ageBandAt(dob, '2032-03-14T08:00:00')).toBe('13+y'));
});

describe('resolveAgeBand', () => {
  it('prefers an exact calculation from dob', () => {
    expect(resolveAgeBand({ dob: '2019-03-14', ageBand: '13+y' }, '2024-03-14T00:00:00')).toBe('5-12y');
  });

  it('falls back to a stored ageBand when no dob is present', () => {
    expect(resolveAgeBand({ ageBand: '5-12y' }, '2024-03-14T00:00:00')).toBe('5-12y');
  });

  it('returns null when neither dob nor ageBand is available', () => {
    expect(resolveAgeBand({}, '2024-03-14T00:00:00')).toBeNull();
  });
});

describe('ageBandBoundariesInRange', () => {
  it('finds the 5th-birthday boundary inside a charting window', () => {
    const boundaries = ageBandBoundariesInRange('2019-03-14', '2024-03-13T08:00:00', '2024-03-15T08:00:00');
    expect(boundaries).toHaveLength(1);
    expect(boundaries[0].fromBand).toBe('1-4y');
    expect(boundaries[0].toBand).toBe('5-12y');
    expect(boundaries[0].ts.getFullYear()).toBe(2024);
    expect(boundaries[0].ts.getMonth()).toBe(2); // March
    expect(boundaries[0].ts.getDate()).toBe(14);
  });

  it('returns none when no birthday falls in the window', () => {
    expect(ageBandBoundariesInRange('2019-03-14', '2024-04-01T00:00:00', '2024-05-01T00:00:00')).toHaveLength(0);
  });
});

describe('ageBandSegments (seamless boundary crossing)', () => {
  it('splits a window crossing the 5th birthday into two joinable segments', () => {
    const patient = { dob: '2019-03-14' };
    const segments = ageBandSegments(patient, '2024-03-13T08:00:00', '2024-03-15T08:00:00');
    expect(segments).toHaveLength(2);
    expect(segments[0].ageBand).toBe('1-4y');
    expect(segments[1].ageBand).toBe('5-12y');
    // The segments meet exactly at the birthday instant (no gap, no overlap).
    expect(segments[0].endTs.getTime()).toBe(segments[1].startTs.getTime());
    expect(segments[0].endTs.getDate()).toBe(14);
  });

  it('returns a single segment when no boundary is crossed', () => {
    const patient = { dob: '2019-03-14' };
    const segments = ageBandSegments(patient, '2024-04-01T00:00:00', '2024-04-02T00:00:00');
    expect(segments).toHaveLength(1);
    expect(segments[0].ageBand).toBe('5-12y');
  });

  it('uses the stored age band when no dob is present', () => {
    const segments = ageBandSegments({ ageBand: '0-11m' }, '2024-04-01T00:00:00', '2024-04-02T00:00:00');
    expect(segments).toHaveLength(1);
    expect(segments[0].ageBand).toBe('0-11m');
  });
});
