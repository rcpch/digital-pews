/**
 * Generated-artifacts freshness guard.
 *
 * Ensures the committed generated artifacts are in sync with the canonical spec
 * (spec/npews-scoring-spec.json). If someone edits the JSON but forgets to run
 * `npm run generate:scoring`, these tests fail.
 *
 *   - pews-chart/npews-scoring-config.js   (SCORING_BANDS_BY_AGE block)
 *   - spec/npews-scoring-tables.generated.md
 */

import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import {
  loadSpec,
  spliceConfig,
  renderUnifiedMarkdown,
  CONFIG_PATH,
  TABLES_MD_PATH,
} from '../../scripts/scoring-spec.mjs';

const spec = loadSpec();

describe('generated artifacts are up to date with the canonical spec', () => {
  it('npews-scoring-config.js generated block is current', () => {
    const current = readFileSync(CONFIG_PATH, 'utf8');
    expect(spliceConfig(current, spec)).toBe(current);
  });

  it('npews-scoring-tables.generated.md is current', () => {
    const current = readFileSync(TABLES_MD_PATH, 'utf8');
    expect(renderUnifiedMarkdown(spec)).toBe(current);
  });
});
