#!/usr/bin/env node
/**
 * Generate runtime artifacts from the canonical NPEWS scoring spec.
 *
 *   spec/npews-scoring-spec.json   (source of truth)
 *        |
 *        +--> pews-chart/npews-scoring-config.js   (SCORING_BANDS_BY_AGE region)
 *        +--> spec/npews-scoring-tables.generated.md (unified human table)
 *
 * Usage:
 *   npm run generate:scoring          # write the artifacts
 *   npm run generate:scoring -- --check   # fail (exit 1) if artifacts are stale
 */

import { readFileSync, writeFileSync } from 'node:fs';
import {
  loadSpec,
  spliceConfig,
  renderUnifiedMarkdown,
  CONFIG_PATH,
  TABLES_MD_PATH,
} from './scoring-spec.mjs';

const check = process.argv.includes('--check');

const spec = loadSpec();

const currentConfig = readFileSync(CONFIG_PATH, 'utf8');
const nextConfig = spliceConfig(currentConfig, spec);
const nextTables = renderUnifiedMarkdown(spec);

let currentTables = '';
try {
  currentTables = readFileSync(TABLES_MD_PATH, 'utf8');
} catch {
  currentTables = '';
}

const configStale = nextConfig !== currentConfig;
const tablesStale = nextTables !== currentTables;

if (check) {
  if (configStale || tablesStale) {
    console.error('Generated scoring artifacts are STALE. Run `npm run generate:scoring`.');
    if (configStale) console.error(' - pews-chart/npews-scoring-config.js');
    if (tablesStale) console.error(' - spec/npews-scoring-tables.generated.md');
    process.exit(1);
  }
  console.log('Generated scoring artifacts are up to date.');
  process.exit(0);
}

if (configStale) {
  writeFileSync(CONFIG_PATH, nextConfig);
  console.log('Wrote pews-chart/npews-scoring-config.js');
} else {
  console.log('pews-chart/npews-scoring-config.js already up to date');
}

if (tablesStale) {
  writeFileSync(TABLES_MD_PATH, nextTables);
  console.log('Wrote spec/npews-scoring-tables.generated.md');
} else {
  console.log('spec/npews-scoring-tables.generated.md already up to date');
}
