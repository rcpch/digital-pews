#!/usr/bin/env node
/**
 * Take screenshot of NPEWS chart UI for visual comparison
 * Usage: node scripts/screenshot-chart.mjs [options]
 * Options:
 *   --url <url>        URL to screenshot (default: http://localhost:8765)
 *   --output <path>    Output file path (default: test-output/screenshots/current.png)
 *   --viewport <WxH>   Viewport size (default: 1400x900)
 */

import puppeteer from 'puppeteer';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : null;
};

const url = getArg('--url') || 'http://localhost:8765';
const output = getArg('--output') || 'test-output/screenshots/current.png';
const viewportStr = getArg('--viewport') || '1400x900';
const [width, height] = viewportStr.split('x').map(Number);

async function takeScreenshot() {
  console.log(`Taking screenshot of ${url}`);
  console.log(`Viewport: ${width}x${height}`);
  
  // Ensure output directory exists
  await mkdir(dirname(output), { recursive: true });
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width, height });
  await page.goto(url, { waitUntil: 'networkidle2' });
  
  // Wait a bit for charts to render
  await page.waitForTimeout(500);
  
  // Take screenshot
  await page.screenshot({ 
    path: output,
    fullPage: true
  });
  
  console.log(`Screenshot saved to: ${output}`);
  await browser.close();
}

takeScreenshot().catch(err => {
  console.error('Error taking screenshot:', err);
  process.exit(1);
});
