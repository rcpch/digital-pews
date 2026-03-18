# RCPCH PEWS User Interface Implementation Specification

This document clarifies any ambiguities in the implementation which we discovered during the process of implementation and testing. It is intended to be a living document which can be updated as needed to reflect any changes or decisions made during the implementation process.


## UI Requirements

### General Requirements

#### U1.1 Colour Blindness Friendly Design (RCPCH 1.1)

The SPOT NPEWS specification does not specify exactly how such a colour blindness friendly design should be implemented. GOV.UK guidelines on accessibility from 2023 explicitly mention [WCAG version 2.2](https://www.w3.org/TR/wcag/) which is the latest at the time of writing. This project will aim to implement WCAG guidelines where they do not conflict with the purpose and standards surrounding PEWS.

### Zoom implementation (RCPCH 1.1)

The degree of zoom **must** not affect the calculation of the PEWS score. both the banner and the footer should always use the globally latest observation set to calculate PEWS. (This detail is not stated in existing Spec and was a bug in an initial implementation.)


* storybook next with plausible screnarios than demonstrate spec rules in action (should show input data as well as the resulting PEWS score and the chart)
* nhs logo
* obs don't happen on the exact hour - need plausible variation
* resp support codes
* chromatic 

## Storybook

### 1. Age Band Stories (`NPEWS/Age Bands`)
- **Age Band 5-12 Years** - Working demo with full fictional patient "Alex Thompson" showing deterioration scenario
- **Age Bands 0-11m, 1-4y, 13+y** - Placeholder stories (data scenarios need to be created)

### 2. Documentation Stories (`NPEWS/Documentation`)
- **Specifications** - Full specs including age bands, escalation levels, layout modes, scoring bands
- **Data Model** - Complete data model documentation with code examples

## Aims

### For Clinical Users:
1. **Side-by-side age band comparison** - can see how thresholds differ across ages
2. **Interactive demos** - can explore without touching code
3. **Documentation embedded** - specs are visible alongside working examples
4. **Shareable URL** - can send links to stakeholders for review

### For QA Staff:
1. **Visual regression testing** - can be integrated with Chromatic/Percy
2. **Spec adherence** - documentation stories show what's implemented vs spec
3. **Edge case coverage** - can add stories for every edge case scenario
4. **Automated testing** - can write tests against stories using Playwright

