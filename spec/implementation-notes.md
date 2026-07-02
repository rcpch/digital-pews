# Implementation notes

Clarifications of ambiguities discovered during implementation and testing; a living doc.

## Decisions and clarifications

<a id="RCPCH1.1"></a>
### U1.1 / RCPCH 1.1 — Colour-blindness friendly design

The SPOT NPEWS specification requires a colour-blindness friendly design, but does not prescribe exactly how to implement it. [GOV.UK accessibility guidance](https://www.gov.uk/service-manual/helping-people-to-use-your-service/understanding-wcag) points to [WCAG version 2.2](https://www.w3.org/TR/wcag/). This project follows WCAG 2.2 where it does not conflict with the purpose and standards surrounding PEWS.

### RCPCH 1.1 — Zoom must not affect PEWS score display

The degree of zoom **must not** affect calculation or display of the PEWS score. The escalation banner and sticky footer must always use the globally latest observation set, not the latest observation visible in the current zoom window. This was not stated in the earlier spec text and was a bug in an initial implementation.

## Visual verification checklist

Use this as a manual QA checklist when comparing the rendered chart with the PDF/image references. See `README.md` for how to run the chart and demonstration harness; keep the current render beside the reference image, especially `reference-sources/images/chart-5-12-years-1.png`.

### Header and patient context

- [ ] Age-band banner is visible at the top of the header; for the 5–12 years reference it is the yellow header band.
- [ ] Patient details are populated correctly from data.
- [ ] Header remains sticky while scrolling.

### Chart layout and sidebars

- [ ] All chart rows rendered by `pews-chart/chart.js` are visible and can be compared against the PDF row order: Respiratory Rate, Respiratory Distress, O₂ Saturation, O₂ Delivery / Respiratory Support, Heart Rate, Blood Pressure, Capillary Refill Time, AVPU / Neurological, Temperature.
- [ ] Parameter panels are stacked vertically with no visible gaps between panels.
- [ ] Categorical rows (Respiratory Distress, Capillary Refill Time, AVPU / Neurological) render as compact coloured-cell bands.
- [ ] Categorical sidebar entries remain compact and align to their panel heights.
- [ ] The left section sidebar uses NHS navy for section labels and vertical text.
- [ ] The parameter sidebar uses NHS blue, with parameter names, units and descriptions aligned to the matching canvas rows.
- [ ] A single shared legend appears above the charts; per-panel legends are absent.
- [ ] Chart border/frame treatment is checked against the PDF reference.

### Axes, gridlines and time spacing

- [ ] Y-axis ranges match the 5–12 years reference: RR 0–60 step 10; HR 40–180 step 20; BP 40–160 step 20; O₂ Saturation 80–100 step 5; Temperature 35–41 step 1; O₂ Delivery 0–100 step 20.
- [ ] Y-axis labels sit outside the plot area on the left.
- [ ] O₂ Delivery / Respiratory Support shows dual labelling: FiO₂ percentage on the left and support / L/min labels on the right.
- [ ] Subtle horizontal gridlines appear at y-axis ticks.
- [ ] Prominent vertical gridlines create the observation/time column structure and align across numeric rows, categorical rows, the PEWS row and the time axis.
- [ ] The time axis shows clock times in `HH:MM` format.
- [ ] Time spacing is proportional to timestamps, not forced into equal-width columns.

### PEWS bands and plotted observations

- [ ] PEWS band colours match the mandated tokens and reference image: `--band-white` `#ffffff`, `--band-yellow` `#ffeda0`, `--band-orange` `#ffb366`, `--band-pink` `#ffb3d9`.
- [ ] Colour-blind mode remains usable and higher contrast without changing the mandated default palette.
- [ ] 5–12 years RR thresholds match the reference: pink 0–9 and 50+; orange 10–14 and 40–49; yellow 15–19 and 25–39; white 20–24 breaths/min.
- [ ] 5–12 years HR thresholds match the reference: pink 0–59 and 160+; orange 60–69 and 140–159; yellow 70–79 and 120–139; white 80–119 bpm.
- [ ] Observation dots and trend lines are visible at the correct plotted positions.
- [ ] Trend lines break over skipped observations.
- [ ] O₂ Delivery trend lines break when modality changes between percentage and L/min.
- [ ] Blood pressure renders as the expected systolic/diastolic marker pair rather than an ordinary trend line.
- [ ] Value labels and hover tooltips show the underlying observation values accurately.
- [ ] Categorical-cell hover tooltips show the label and observation time.

### PEWS row, escalation and controls

- [ ] PEWS Total row appears at the bottom of the chart grid and aligns with observation columns.
- [ ] PEWS scores in the row match the scorer output for each observation.
- [ ] PEWS row cell colours match the escalation level for the observation.
- [ ] Escalation banner appears when an escalation level exists.
- [ ] Escalation banner displays the correct level, PEWS score, action text and colour.
- [ ] Zoom and quick-range controls do not change the banner or sticky-footer score; both use the globally latest observation set.
- [ ] Toolbar controls work: zoom, quick ranges, show values, colour-blind mode and layout mode.
- [ ] Landscape, portrait and mobile layouts remain visually coherent.
