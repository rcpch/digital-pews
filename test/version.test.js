// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

/**
 * chart/version.js mirrors package.json's version because native ES modules
 * cannot import JSON without a build step. This guards against the two
 * drifting apart after a release bump.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CHART_VERSION } from '../chart/version.js';

describe('chart/version.js matches package.json', () => {
  it('mirrors the canonical npm package version', () => {
    const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
    expect(CHART_VERSION).toBe(pkg.version);
  });
});
