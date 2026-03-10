# Visual Comparison Checklist

Compare the current implementation (http://localhost:8765) against the reference PDFs.

## Age Band: 5-12 Years

Reference: `reference-sources/images/chart-5-12-years-1.png`

### Header
- [ ] Yellow age band banner visible at top (8px height, #FFFF00)
- [ ] Patient details displayed correctly
- [ ] Header is sticky on scroll

### Charts Layout
- [ ] All parameter charts visible (RR, Resp Distress, HR, BP, O2 Sat, O2 Delivery, CRT, Temp, AVPU) in PDF row order
- [x] Charts arranged vertically with zero gap between panels
- [x] Categorical rows (Respiratory Distress, Capillary Refill, AVPU) rendered as thin coloured-cell bands
- [ ] Y-axis ranges match PDF:
  - RR: 0-60 breaths/min (step 10)
  - HR: 40-180 bpm (step 20)
  - BP: 40-160 mmHg (step 20)
  - O2 Sat: 80-100% (step 5)
  - Temp: 35-41°C (step 1)
  - O2: 0-100% (step 20)

### Band Colors (compare to PDF)
- [ ] Pink bands (#FFB6D9 or similar) - score 4 zones
- [ ] Orange bands (#FFD6A5 or similar) - score 2 zones
- [ ] Yellow bands (#FFFFCC or similar) - score 1 zones
- [ ] White bands (#FFFFFF) - score 0 zones

### Specific RR Thresholds (5-12y)
- [ ] Pink: 0-9, 50+ breaths/min
- [ ] Orange: 10-14, 40-49 breaths/min
- [ ] Yellow: 15-19, 25-39 breaths/min
- [ ] White: 20-24 breaths/min

### Specific HR Thresholds (5-12y)
- [ ] Pink: 0-59, 160+ bpm
- [ ] Orange: 60-69, 140-159 bpm
- [ ] Yellow: 70-79, 120-139 bpm
- [ ] White: 80-119 bpm

### Visual Details to Match
- [x] Grid lines at every Y-axis tick (subtle grey)
- [x] Prominent vertical grid lines at each observation time creating columnar structure
- [x] Y-axis labels positioned outside chart area (left margin)
- [x] Blue left sidebar with parameter names and descriptions
- [x] Dual Y-axis labels for oxygen delivery (FiO2 % left, support codes right)
- [ ] Chart border style matches PDF (deferred)
- [x] Time axis shows times in HH:MM format
- [x] Dots and trend lines visible
- [x] Line breaks on skipped values
- [x] Line breaks on O2 modality changes (% to L/min)
- [x] Proportional time spacing maintained (not equal-width columns)

### PEWS Row
- [ ] PEWS score row at bottom of chart area
- [ ] Scores match expected values for observations
- [ ] Color-coded cells match escalation level

### Escalation Banner
- [ ] Banner appears when PEWS >=1
- [ ] Correct escalation level displayed (Low/Medium/High/Emergency)
- [ ] Correct color coding
- [ ] Action text displayed

### Toolbar
- [ ] Zoom buttons work
- [ ] Quick range buttons work
- [ ] Show values toggle works
- [ ] Color-blind mode toggle works
- [ ] Layout toggle buttons work (landscape/portrait/mobile)

## Next Steps

1. Open http://localhost:8765 in browser
2. Open `reference-sources/images/chart-5-12-years-1.png` side-by-side
3. Go through checklist and note discrepancies
4. Prioritize visual fixes based on severity
5. Implement fixes iteratively

## Known Issues to Address

### ✅ Completed
1. **Grid lines**: ✅ Added horizontal grid lines at every Y-axis tick (lighter) and labeled ticks (darker)
2. **Y-axis labels**: ✅ Moved outside chart area to left margin (PAD_LEFT increased to 55px, labels at -8px)
3. **Time axis**: ✅ Shows clock times (HH:MM format)
4. **Band colors**: ✅ Adjusted saturation to match PDF (#ffeda0, #ffb366, #ffb3d9)
5. **Vertical grid lines**: ✅ Added prominent vertical grid lines at each observation time point
6. **Blue sidebar**: ✅ Added NHS blue sidebar with parameter names and descriptions
7. **Dual Y-axis**: ✅ Added support for right-side labels (e.g., respiratory support codes)
8. **Age band banner**: ✅ Added colored banner at top of header
9. **Chart panel gaps**: ✅ Collapsed to zero (`gap: 0`, `margin-top: -1px`)
10. **Per-panel legend removed**: ✅ Replaced with a single shared legend bar above charts
11. **Sidebar content**: ✅ Clinical descriptions updated (device codes, BP position, probe sites, AVPU)
12. **Categorical rows**: ✅ Respiratory Distress, Capillary Refill, AVPU rendered as thin coloured-cell canvas rows
13. **Sidebar categorical entries**: ✅ Compact sidebar items for categorical rows aligned to panel heights
14. **Categorical tooltips**: ✅ Hover on categorical cells shows label and time

### 🔄 In Progress
- Visual verification against PDF in browser

### ⏳ Pending
- Chart border/frame (deferred per Q3 answer)
- Fine-tuning of sidebar content to exactly match PDF descriptions
- Responsive layout testing across different screen sizes
