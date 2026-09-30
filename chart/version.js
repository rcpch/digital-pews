// SPDX-FileCopyrightText: 2026 The Royal College of Paediatrics and Child Health
// SPDX-License-Identifier: LGPL-3.0-or-later

/**
 * The chart component's version, displayed in the toolbar and available to
 * hosts (e.g. for SMART-on-FHIR response metadata).
 *
 * package.json is the canonical source (npm and the release process read it).
 * This constant mirrors it so the browser can read the version without a JSON
 * import or a build step, since chart/ loads as native ES modules only.
 * test/version.test.js fails if the two values drift apart.
 */
export const CHART_VERSION = '0.1.0';
