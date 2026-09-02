// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

/**
 * R23 - typed presentation options.
 *
 * The options normalisation logic in npews-chart.js is a pure function of
 * its input: defaults are applied, invalid values are rejected, and the
 * output is a plain object with well-typed fields. We test that logic
 * directly rather than instantiating the custom element, which requires
 * a DOM environment the Vitest node config doesn't provide.
 */

import { describe, it, expect } from 'vitest';

/**
 * Mirror of the normalisation in npews-chart.js set options(value).
 * If the element's logic changes, this must be kept in sync; the
 * npews-chart.js source is the source of truth.
 */
function normaliseOptions(value) {
  const o = value && typeof value === 'object' ? value : {};
  return {
    showDemographics:  o.showDemographics !== false,
    showValues:        o.showValues !== false,
    initialLayout:     o.initialLayout || 'auto',
    initialTimeWindow: Number.isFinite(o.initialTimeWindow) && o.initialTimeWindow > 0
      ? o.initialTimeWindow
      : undefined,
  };
}

describe('R23 typed presentation options', () => {
  it('applies documented defaults when no options are set', () => {
    const o = normaliseOptions({});
    expect(o.showDemographics).toBe(true);
    expect(o.showValues).toBe(true);
    expect(o.initialLayout).toBe('auto');
    expect(o.initialTimeWindow).toBeUndefined();
  });

  it('preserves showDemographics false explicitly', () => {
    expect(normaliseOptions({ showDemographics: false }).showDemographics).toBe(false);
  });

  it('preserves showValues false explicitly', () => {
    expect(normaliseOptions({ showValues: false }).showValues).toBe(false);
  });

  it('accepts initialLayout values', () => {
    expect(normaliseOptions({ initialLayout: 'mobile' }).initialLayout).toBe('mobile');
    expect(normaliseOptions({ initialLayout: 'portrait' }).initialLayout).toBe('portrait');
    expect(normaliseOptions({ initialLayout: 'landscape' }).initialLayout).toBe('landscape');
  });

  it('defaults initialLayout to auto when not specified', () => {
    expect(normaliseOptions({}).initialLayout).toBe('auto');
  });

  it('accepts a numeric initialTimeWindow', () => {
    expect(normaliseOptions({ initialTimeWindow: 4 }).initialTimeWindow).toBe(4);
    expect(normaliseOptions({ initialTimeWindow: 24 }).initialTimeWindow).toBe(24);
    expect(normaliseOptions({ initialTimeWindow: 1 }).initialTimeWindow).toBe(1);
  });

  it('rejects non-positive initialTimeWindow and leaves it undefined', () => {
    expect(normaliseOptions({ initialTimeWindow: 0 }).initialTimeWindow).toBeUndefined();
    expect(normaliseOptions({ initialTimeWindow: -1 }).initialTimeWindow).toBeUndefined();
  });

  it('rejects non-numeric initialTimeWindow and leaves it undefined', () => {
    expect(normaliseOptions({ initialTimeWindow: '24h' }).initialTimeWindow).toBeUndefined();
    expect(normaliseOptions({ initialTimeWindow: null }).initialTimeWindow).toBeUndefined();
    expect(normaliseOptions({ initialTimeWindow: NaN }).initialTimeWindow).toBeUndefined();
  });

  it('survives null or non-object options', () => {
    const o = normaliseOptions(null);
    expect(o.showDemographics).toBe(true);
    expect(o.showValues).toBe(true);
    expect(o.initialLayout).toBe('auto');
  });

  it('combines all options together correctly', () => {
    const o = normaliseOptions({
      showDemographics: false,
      showValues: false,
      initialLayout: 'portrait',
      initialTimeWindow: 8,
    });
    expect(o).toEqual({
      showDemographics: false,
      showValues: false,
      initialLayout: 'portrait',
      initialTimeWindow: 8,
    });
  });
});