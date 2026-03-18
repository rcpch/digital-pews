## Roadmap

### Priority 1: Create Fictional Data for All Age Bands
Currently only the 5-12y age band has a full data scenario. Need to create:
- **0-11 months** - infant patient with age-appropriate vital signs
- **1-4 years** - toddler patient
- **13+ years** - adolescent patient

Each should show:
- Normal observations (PEWS 0)
- Mild deterioration (PEWS 1-4, Low escalation)
- Moderate deterioration (PEWS 5-8, Medium escalation)
- Severe deterioration (PEWS 9-12, High escalation)
- Emergency (PEWS 13+, Emergency escalation)

### Priority 2: Add Interactive Controls
Use Storybook's `argTypes` to add controls for:
- Layout mode (landscape/portrait/mobile)
- Color-blind mode toggle
- Show values toggle
- Zoom level
- Time range

### Priority 3: Add Edge Case Stories
Create stories demonstrating:
- Skipped observations (unable to measure)
- Oxygen modality changes (% → L/min)
- Missing data patterns
- Rapid deterioration (multiple obs sets in short time)
- Recovery scenarios

### Priority 4: Visual Regression Testing
Integrate with Chromatic or Percy to:
- Capture screenshots of each story
- Detect visual changes in PRs
- Compare against reference PDFs