# RCPCH PEWS User Interface Implementation Specification

This document clarifies any ambiguities in the implementation which we discovered during the process of implementation and testing. It is intended to be a living document which can be updated as needed to reflect any changes or decisions made during the implementation process.


## UI Requirements

### General Requirements

#### U1.1 Colour Blindness Friendly Design (RCPCH 1.1)

The SPOT NPEWS specification does not specify exactly how such a colour blindness friendly design should be implemented. GOV.UK guidelines on accessibility from 2023 explicitly mention [WCAG version 2.2](https://www.w3.org/TR/wcag/) which is the latest at the time of writing. This project will aim to implement WCAG guidelines where they do not conflict with the purpose and standards surrounding PEWS.

### Zoom implementation (RCPCH 1.1)

The degree of zoom **must** not affect the calculation of the PEWS score. both the banner and the footer should always use the globally latest observation set to calculate PEWS. (This detail is not stated in existing Spec and was a bug in an initial implementation.)


* demo harness: show the raw input observation data alongside the resulting PEWS score and the chart (currently the sidebar shows the scenario + chart + computed scores, but not the underlying vitals table)
* nhs logo
* obs don't happen on the exact hour - need plausible variation
* resp support codes
* visual regression: pin the canvas render and capture PNG baselines (browser automation, e.g. Playwright `toHaveScreenshot`) rather than a hosted SaaS

## Demonstration harness

Storybook was removed in favour of a dependency-free harness (`pews-chart/demo.html` +
`demo.js`) that better fits an NHS-positioned, vendor-neutral tool. Scenarios live in
`pews-chart/scenarios.js` as plain `{ id, title, ageBand, description, patient, observations }`
objects and are rendered as a left-sidebar picker.

### Scenarios (`SCENARIOS`)
- **5-12 Years** - "Alex Thompson" deterioration and recovery (default).
- **0-11 months** - "Zara Okafor" febrile convulsion.
- **1-4 Years** - "Jamie Osei" bronchiolitis-style deterioration and recovery.
- **13+ Years** - "Morgan Clarke" deterioration and recovery.
- **Birthday crossing** - "Sam Rivera" turns 5 mid-admission; the chart seamlessly joins the
  `1-4y` and `5-12y` bands (unified y-scale, time-segmented scoring bands, boundary divider).

## Aims

### For Clinical Users:
1. **Side-by-side age band comparison** - can see how thresholds differ across ages
2. **Interactive demos** - can explore without touching code
3. **Shareable URL** - scenarios are deep-linkable via the URL hash (e.g. `demo.html#birthday-crossing`)

### For QA Staff:
1. **Visual regression testing** - PNG baselines captured via browser automation (no SaaS lock-in)
2. **Edge case coverage** - can add a scenario object for every edge case
3. **Automated testing** - the same scenario objects feed unit tests and any browser-driven checks

