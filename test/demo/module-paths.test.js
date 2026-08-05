import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const demoFiles = [
  'demo/index.html',
  'demo/demo.html',
  'demo/demo.js',
  'demo/embed-example.html',
  'demo/_probe_nhs.html',
  'demo/_probe_rcpch.html',
  'demo/_probe_slate.html',
  'demo/_probe_midnight.html',
];

describe('demo module paths', () => {
  it('retain the GitHub Pages project base when resolving chart modules', async () => {
    const chartUrl = new URL('chart/npews-chart.js', 'https://rcpch.github.io/digital-pews/');
    expect(chartUrl.href).toBe('https://rcpch.github.io/digital-pews/chart/npews-chart.js');

    for (const file of demoFiles) {
      const contents = await readFile(file, 'utf8');
      expect(contents).not.toContain('../chart/');
    }
  });
});
