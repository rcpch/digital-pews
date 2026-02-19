# SPOT / NPEWS User Interface Specification V1.0

This document is the baseline user interface specification for SPOT NPEWS systems. This has been created based on solutions previously procured by Trusts and feedback from clinicians and technical colleagues.
This cover sheet will outline some of the guiding principles for the use of this document by ICSs and Trusts.

## Use of MOSCOW

We have used the MOSCOW rating system to assess the priority of each requirement. In an ideal situation a solution would meet or exceed every requirement but we recognise that this isn't practical and have used the rating method to reflect differing priorities. Different people may use the MOSCOW ratings in different ways so we have provided a definition of our usage to make things clearer for users of this document

- **Must** - Any SPOT / NPEWS solution **must** meet all of these requirements. When undergoing a procurement exercise no solution **should** be selected that fails one or more Musts.
- **Should** - Ideally a SPOT / NPEWS solution would have all the Shoulds as well as all the musts. There may be some shoulds that don't apply to certain solutions, or some suppliers may do the majority of the Shoulds but miss one or two. Missing a **should** is not a barrier to a successful procurement but would be a useful comparison to make between competing suppliers to pick the one best suited.
- **Could** - A **could** is a nice to have, these are often future looking or ideal features that it is understood many or most suppliers won't deliver yet, but may have on roadmaps. A lack of coulds **should** not be a barrier to supplier selection, but where several suppliers are similar in their ability to meet Musts and Shoulds whether they meet Coulds is a useful measure for differentiation.
- Won't - This is used to call out something we explicitly won't be doing. No solution **should** do this feature as to do so would be an error. We include some won'ts to avoid assumptions that might be made otherwise

## Use with other documents

This user interface (UI) specification is designed to complement the main technical specification for SPOT-NPEWS. These **should** be used together. A feature missing from this specification just means that we don't have specific UI concerns around the feature. It **should** still be implemented as per the technical specification but suppliers are free to make decisions on how best to implement it. To go with this document we have produced wireframes. These wireframes are designed to explain some of the concepts in this specification. The wireframes aren't designed to be a strict interpretation but to illustrate points raised.

## Usage of this document by Integrated Care Systems (ICSs) and Trusts

The purpose of this document is to form a baseline for the SPOT / NPEWS solution for any ICS or trust who needs to procure a SPOT / NPEWS solution. This document is intended to be the national baseline, so as such it would be expected that any solution procured **must** use all of the **Must** requirements that are included. Given that this is a national document it is understood that we will be unable to reflect any locally specific requirements. As such it is expected that the trust add these to the requirements list before going out to procurement. For example we can add generic statements about integration, but the Trust may want to add a list of systems that they have that the solution **must** integrate with. There may also be some of the Shoulds or Coulds that change locally, for instance we might have included a **could** that just isn't relevant in your local environment so you can take it out. Alternatively one of our Shoulds may be a **Must** in your local area, so you **should** feel free to upgrade it's status. This is a baseline so we are more than happy for Trusts to increase the classification of items and aim at a higher standard. In terms of downgrades, care **must** be given before downgrading a **Must**, as you may find that your system isn't compliant with national standards, however there may be limited situations where you need to replace a generic **must** with a more specific one reflecting local realities.
Requirements from this document are being shared with suppliers in the SPOT / NPEWS market for comment and review so using this baseline **should** assist your procurements as suppliers will already have sight of it. It is hoped that by including shoulds and coulds into this specification we can help to inform suppliers roadmaps to resolve those issues where they might be diverging from the expected standard.

## Key definitions

### The Solution

When we use the term "the solution" (typically in the format of "The solution **must** do X") we mean the full set of system or systems provided by the supplier. No judgement is made as to whether this needs to be one piece of software or several that are integrated. The integration is a key assumption that is made, it wouldn't be acceptable to have a solution that had bits of technology that didn't speak to each other so clinicians were required to double enter data. However as long as it's fully integrated any number of software/hardware items can be included as part of the solution. It can be worth reading this as meaning "As a whole the fully integrated solution **Must** do X", but we have left that wording out for the sake of space. In terms of any requirements that refer to compliance (e.g. GDPR) this refers to each and every component part of the solution. So for a supplier to confirm that their solution meets this requirement they are confirming that all the related software they'll be deploying meets that requirement.

### MOSCOW within requirements

When writing a requirement the relevant MOSCOW term will be used throughout the requirement (e.g. The solution **should** do X and it **should** also do Y and it **should** output in the format of z). Even though the less mandatory terms of **Should** and **Could** are used in this way, if a supplier is answering that they meet the requirement they are saying that they meet all of it. If they are in a situation where they meet some of the requirement but not all of it they need to make this clear in their submission. This can then be taken into account by the trust when assessing suppliers. For shoulds and coulds it isn't an automatic barrier if a supplier is only partially compliant, but if they just say that they are compliant and don't outline the areas that they are deficient then this **could** become an issue with any contract signed based on the supplier appearing fully compliant with a requirement.

### Clinicians

Clinicians is our generally used term to refer to staff working with the SPOT / NPEWS system. For some requirements specific jobs are called out but otherwise clinicians is used as a generic term. Occasionally users is used as well, this means all users of the system both clinicians and others (e.g. technical administration staff). When clinicians is used it **should** not be taken to imply any particular job role, if the supplier needs clarification of which are or are not included locally they **should** seek this from the trust, as in some areas this will change depending on local needs.

### ICS/Trust

The Integrated Care Systems (ICSs) and Trusts are used interchangeably through this document. Depending on the area purchasing of systems may be done at the ICS or at the Trust level and so both are used throughout. If the procurement is being done at ICS level requirements that refer to the Trust **should** be seen to refer to the ICS and visa versa.

### Standards and datasets

When standards and datasets are listed it is assumed that the current version as of the date of procurement publication is to be used. Version numbers have not be used in this document to avoid creating an overhead in terms of updating them, but trusts are welcome to include them in their procurement documents. Any new datasets will be included as part of the regular updates to this document.

### Patient

We've used patient to refer to the child or young person accessing medical services and having observations taken by clinicians

### Carer

We've used carer to refer to the carer or parent responsible for the child or young person receiving medical care

### Form

We've used Form generically to describe the interface used to input observation data on the PEWS system, in a similar way to the paper version being called a form. We understand that different supplier solutions may use different terms like interface, app or workflow, and in their systems "form" may mean something different. For our purposes we are using the term in it's generic plain English form and do not preclude different ways that suppliers may implement the described interface in their systems

### Compliance with the standard

For a trust or a supplier to claim that they are compliant with the National PEWS standard in communications or advertising their solution **must** meet all of the **must** requirements in the specifications. A failure to meet any **must** have requirement will mean that the trust or supplier will not be allowed to claim to be compliant with PEWS.

## Requirements

### General Requirements

- [ ] **U1.1**: The solution **must** be able to support a colour blindness friendly mode for clinicians that have issues seeing colour. This **must** still make it clear which level applies so that the PEWS form can still be easily interpreted.

### Form Creation and Selection Requirements

- [ ] **U2.1** (MOSCOW: ): No requirements in this section

### Viewing and Recording Observations Requirements

- [ ] **U3.1**: The solution **must** allow the clinician to zoom in and out when viewing charts to see them in more or less detail as needed. This is to let them see fewer observations in more detail, or more observations in less detail.
- [ ] **U3.2**: The solution **must** default to a clear view that shows recent trends. The amount of results shown may need to vary depending on how many observations have been recently conducted
- [ ] **U3.3**: The solution **should** have some quick view options to change what is shown without manual scrolling by the clinician. These **should** include "Today" "This Week" "This Month".
- [ ] **U3.4**: The solution **should** have the option to show the values of the current observations to the clinician without charting / trends. This might be an alternative screen, but **should** allow a clinician to see most recent values for each of the observations taken (without the previous values and trending)
- [ ] **U3.5**: The solution **must** always be able to show the exact value of the observation to the viewing clinician
- [ ] **U3.6**: The solution **should** show the exact value of the observation in an easy to see way. This **should** be either on a separate chart line for "value", or next to the dot, or on an interaction (like click/press/hover)
- [ ] **U3.7**: The solution **must** arrange the y axis values from highest numeric values at the top to lowest numeric value at the bottom for each observation measure. For those measures without numeric values the solution **must** show these from most severe/highest scoring to least severe/lowest scoring
- [ ] **U3.8**: The solution **could** present a visual indicator that the patient has been moved to theatre, scans or other care locations to explain why observations have paused
- [ ] **U3.9**: The solution **must** make it obvious when any observation is skipped when a clinician is reviewing observations
- [ ] **U3.10** (MOSCOW: Won't): The solution won't draw a line over a skipped observation when graphing. Any skipped observation **must** cause a break in the line. If a set of observations is conducted but one is skipped (e.g. Blood Pressure) no line **should** be dawn over the two closest values, as this would imply a trend that might not be the case. The wireframes have an example of the break in the line.
- [ ] **U3.11**: The solution **must** ensure the clinician can always see the date/time of the observation(s) they're looking at so they always know which one(s) they're reviewing.
- [ ] **U3.12**: The solution **should** have a jump to present option to quickly allow the clinician to return to the present set of observations
- [ ] **U3.13**: The solution **must** distinguish between trend lines and observations so it is clear where an observation has been taken. Typically these are plotted as a dot, but any appropriate symbology is acceptable. The wireframes give examples of how this can be seen.
- [ ] **U3.14**: The solution **must** plot the observation exactly in the box, this means that even if two values would fall in the same box if one is higher than the other this **must** be shown. For example both 41 and 49 would fall in the 40-50 box, but one **should** be at the bottom of the box and one at the top.

### Correcting and Deleting Observations Requirements

- [ ] **U4.1** (MOSCOW: ): No requirements in this section

### Respiratory Rate Requirements

- [ ] **U5.1**: The solution **must** allow a numeric value to be input for Respiratory Rate
- [ ] **U5.2**: The solution **could** allow a clinician to input Respiratory Rate via an easy to use input method, e.g. a scroll, a value picker, auto dication or a number pad
- [ ] **U5.3**: The solution **must** limit values for Respiratory Rate to exact numbers (integers)
- [ ] **U5.4**: The solution **must** plot the exact point on the chart for the Respiratory Rate and show this via a marker on the chart that this is an observation not a trend, for example by plotting a dot
- [ ] **U5.5**: The solution **must** plot a line between observations of Respiratory Rate to create a graph
- [ ] **U5.6**: The solution **must** be able to show the reason an observation was skipped when requested by the clinician for Respiratory Rate
- [ ] **U5.7**: The solution **could** limit the values of respiratory rate to possible results. The lowest possible value **could** be 0 and the highest possible value **could** be 150.

### Respiratory Distress Requirements

- [ ] **U6.1**: The solution **must** present the different options for Respiratory Distress and allow the clinician to pick from them
- [ ] **U6.2**: The solution **should** offer visible distinction (e.g. colour or sections) to show which types of Respiratory Distress will trigger which category
- [ ] **U6.3**: The solution **must** either present the selected category of respiratory distress in the box and show the colour graded, or present a scale of categories of respiratory distress and mark which was selected.
- [ ] **U6.4**: The supplier **must** be able to adapt to either respiratory distress option if one or the other is selected as the standard in future by NHS England
- [ ] **U6.5**: The solution **must** allow the clinician to see the exact types of respiratory distress observed by interacting with the recorded category
- [ ] **U6.6**: The solution **must** allow the clinician to easily record that no respiratory distress was observed. This **must** be distinct from any option to skip the observation. This **must** be the first option at the top of any input interface
- [ ] **U6.7**: The solution **must** present the selection options for respiratory distress from None to Mild to Moderate to Severe so that it is easy for the clinician to find what they're looking for
- [ ] **U6.8**: The solution **must** be able to show the reason an observation was skipped when requested by the clinician for Respiratory Distress

### Oxygen Saturation Requirements

- [ ] **U7.1**: The solution **must** allow a numeric value to be input for Oxygen Saturation
- [ ] **U7.2**: The solution **could** allow a clinician to input Oxygen Saturation via an easy to use input method, e.g. a scroll, a value picker, auto dication or a number pad
- [ ] **U7.3**: The solution **must** present oxygen saturation in one of the following options: show the recorded value of oxygen saturation in the box and show the colour graded, OR present a scale of ranges of oxygen saturation and mark which was selected OR present a graph of oxygen saturation and plot points and graph it
- [ ] **U7.4**: The solution **could** have an option to expand and contract between the full graph and the range based options
- [ ] **U7.5**: The supplier **must** be able to adapt to any one of the oxygen saturation options if one of them is selected as the standard in future by NHS England
- [ ] **U7.6**: The solution **must** limit values for Oxygen Saturation to exact percentages (integers)
- [ ] **U7.7**: The solution **must** be able to show the reason an observation was skipped when requested by the clinician for Oxygen Saturation
- [ ] **U7.8**: The solution **could** limit the values of oxygen saturation to possible results. The lowest possible value **must** be 20% and the highest possible value **must** be 100%.

### Respiratory Support Device Requirements

- [ ] **U8.1**: The solution **must** present the different options for Respiratory Support and allow the clinician to pick from them
- [ ] **U8.2**: The solution **should** offer visible distinction (e.g. colour or sections) to show which types of Respiratory Support will trigger which category
- [ ] **U8.3**: The solution **must** present the category of respiratory support in the box and show the colour graded.
- [ ] **U8.4**: The solution **must** allow the clinician to see the exact types of respiratory support recorded by interacting with the recorded category
- [ ] **U8.5**: The solution **must** allow the clinician to easily record that no respiratory support was being offered. This **must** be distinct from any option to skip the observation. This **must** be the last option at the bottom of any input interface
- [ ] **U8.6**: The solution **must** be able to show the reason an observation was skipped when requested by the clinician for Respiratory Support

### Oxygen Delivery Requirements

- [ ] **U9.1**: The solution **must** allow a numeric value to be input for Oxygen Delivery. It **must** allow this to be either a percentage or a litres per minute value and identified as such
- [ ] **U9.2**: The solution **could** allow a clinician to input Oxygen Delivery via an easy to use input method, e.g. a scroll, a value picker, auto dication or a number pad
- [ ] **U9.3**: The solution **must** limit inputs for Oxygen Delivery using a litres per minute measure to two decimal places
- [ ] **U9.4**: The solution **should** limit values for Oxygen Delivery using a oxygen percentage measure to exact numbers (integers)
- [ ] **U9.5**: The solution **must** plot the exact point on the chart for the Oxygen Delivery and show this via a marker on the chart that this is an observation not a trend, for example by plotting a dot
- [ ] **U9.6**: The solution **must** plot a line between observations of Oxygen Delivery to create a graph
- [ ] **U9.7**: The solution **must** recognise when the measure for Oxygen Delivery changes between percentage and litres per minute and create a break in the line plotted on the graph
- [ ] **U9.8**: The solution **must** be able to show the reason an observation was skipped when requested by the clinician for Oxygen Delivery
- [ ] **U9.9**: The solution **could** limit the values of oxygen delivery to possible results. The lowest possible value when using percentages **could** be 16% and the highest possible value **could** be 100%. The lowest possible value when using litres per minute **could** be 0.02 and the highest possible value **could** be 16.

### Heart Rate Requirements

- [ ] **U10.1**: The solution **must** allow a numeric value to be input for Heart Rate
- [ ] **U10.2**: The solution **could** allow a clinician to input Heart Rate via an easy to use input method, e.g. a scroll, a value picker, auto dication or a number pad
- [ ] **U10.3**: The solution **should** limit values for Heart Rate to exact numbers (integers)
- [ ] **U10.4**: The solution **must** plot the exact point on the chart for the Heart Rate and show this via a marker on the chart that this is an observation not a trend, for example by plotting a dot
- [ ] **U10.5**: The solution **must** plot a line between observations of Heart Rate to create a graph
- [ ] **U10.6**: The solution **must** be able to show the reason an observation was skipped when requested by the clinician for Heart Rate
- [ ] **U10.7**: The solution **could** limit the values of heart rate to possible results. The lowest possible value **could** be 0 and the highest possible value **could** be 300.

### Blood Pressure Requirements

- [ ] **U11.1**: The solution **must** allow a numeric value to be input for both Systolic and diastolic Blood Pressure
- [ ] **U11.2**: The solution **could** allow a clinician to input Blood Pressure via an easy to use input method, e.g. a scroll, a value picker, auto dication or a number pad
- [ ] **U11.3**: The solution **should** allow a numeric value to be input for the Mean Blood Pressure
- [ ] **U11.4**: The solution **should** limit values for Blood pressure to exact numbers (integers)
- [ ] **U11.5**: The solution **must** plot the exact point on the chart for the systolic and diastolic Blood Pressure. This **must** use either the standard outward pointing arrow marking or the standard inward pointing arrow marking and have a line joining the systolic and diastolic values.
- [ ] **U11.6**: The solution **should** plot the mean Blood Pressure with a dot on the line if a mean blood pressure is input
- [ ] **U11.7** (MOSCOW: Won't): The solution won't plot a horizontal graph line between different observations of systolic and diastolic Blood Pressure
- [ ] **U11.8**: The solution **could** plot a line between the mean Blood Pressure values to show trends
- [ ] **U11.9**: The solution **must** be able to show the reason an observation was skipped when requested by the clinician for Blood Pressure
- [ ] **U11.10**: The solution **could** limit the values of blood pressure to possible results. The lowest possible systolic value **could** be 0 and the highest possible value **could** be 400. The lowest possible diastolic value **could** be 0 and the highest possible value **could** be 400.

### Capillary Refill Time Requirements

- [ ] **U12.1**: The solution **must** allow a numeric value to be input for Capillary Refill time
- [ ] **U12.2**: The solution **could** allow a clinician to input Capillary Refill time via an easy to use input method, e.g. a scroll, a value picker, auto dication or a number pad
- [ ] **U12.3**: The solution **should** limit values for Capillary Refill time to whole numbers (integers)
- [ ] **U12.4**: The solution **must** either present the recorded value of Capillary Refill time in the box and show the colour graded, or present a scale of ranges of Capillary Refill time and mark which was selected.
- [ ] **U12.5**: The supplier **must** be able to adapt to either Capillary Refill time option if one or the other is selected as the standard in future by NHS England
- [ ] **U12.6**: The solution **must** be able to show the reason an observation was skipped when requested by the clinician for Capillary Refill time
- [ ] **U12.7**: The solution **could** limit the values of Capillary Refill time to possible results. The lowest possible value **could** be 1 and the highest possible value **could** be 10.

### Carer Question Requirements

- [ ] **U13.1**: The solution **must** allow a clinician to pick which escalation to trigger in response to a worse response to the carer question
- [ ] **U13.2**: The solution **must** allow a clinician to record if the carer was asleep or unavailable. This **must** be distinct from skipping the observation

### Disability and Exposure Requirements

- [ ] **U14.1**: The solution **should** remind the user to complete a Glasgow Coma Score sheet when AVPU indicates it. This may either be a text prompt or if a digital solution exists in that trust a direct link to it.
- [ ] **U14.2**: The solution **should** allow the clinician to input a numerical value or pick from a visual scale for the pain score
- [ ] **U14.3**: The solution **could** allow a clinician to input the pain score via an easy to use input method, e.g. a scroll, a value picker, auto dication or a number pad
- [ ] **U14.4**: The solution **should** allow a trust to define the range for pain scores and present this to clinicians accordingly. This **could** be a numeric value or a locally defined set of images
- [ ] **U14.5**: The solution **must** allow a new instance of sepsis to be recorded on it's own line, but also trigger the specific concern process if sepsis is recorded

### Temperature Requirements

- [ ] **U15.1**: The solution **must** allow a numeric value to be input for Temperature
- [ ] **U15.2**: The solution **could** allow a clinician to input Temperature via an easy to use input method, e.g. a scroll, a value picker, auto dication or a number pad
- [ ] **U15.3**: The solution **must** limit values for Temperature to numbers with one decimal place
- [ ] **U15.4**: The solution **must** plot the exact point on the chart for the Temperature and show this via a marker on the chart that this is an observation not a trend, for example by plotting a dot
- [ ] **U15.5**: The solution **must** plot a line between observations of Temperature to create a graph
- [ ] **U15.6**: The solution **must** be able to show the reason an observation was skipped when requested by the clinician for Temperature
- [ ] **U15.7**: The solution **could** limit the values of temperature to possible results. The lowest possible value **could** be 0 and the highest possible value **could** be 45.

### Clinical Intuition Requirements

- [ ] **U16.1**: The solution **must** allow a clinician to pick which escalation to trigger in response to a "Yes" response to the clinical intuition question
- [ ] **U16.2**: The solution **must** allow the clinician to skip the clinician intuition question if they wish to
- [ ] **U16.3**: The solution **could** treat an "I'm not sure" option the same as a skip but record it differently for reporting purposes

### Scoring and Escalation Requirements

- [ ] **U17.1**: The solution **must** allow a clinician to pick which escalation to trigger in response to a specific concern being logged
- [ ] **U17.2**: The solution **must** allow the clinician to break out of conducting observations at any point to trigger an escalation
- [ ] **U17.3**: The solution **must** present the option to break out of observations to escalate in an obvious manner that is easy for a clinician to spot
- [ ] **U17.4**: The solution **must** allow the clinician to select the reason they are escalating (e.g. Clinical intuition, Carer concern, specific concern) and then pick the escalation level. This **must** default to the highest level triggered by inputs to the various questions and observations but allow the clinician to override
- [ ] **U17.5**: The solution **must** allow the observations to be continued after the patient has been escalated if needed
- [ ] **U17.6**: The solution **must** present an alert at the end of the observation process letting the clinician know what level the patient has come out as, and what the guidance is for that level
- [ ] **U17.7**: The solution **should** present a visually distinct warning if the escalation category increases (for whatever reason; PEWS, Specific Concern, Carer Concern, Clinical Intuition) rather than just remaining at the same level (e.g. moved from Medium to High, rather than staying at Medium).
- [ ] **U17.8**: The solution **must** present a visual indicator that the patient has been escalated during/after a specific set of observations in addition to completing those sections of the form
- [ ] **U17.9**: The solution **must** always have the option to present escalation guidance whenever an escalation is being offered to the clinician regardless of where they are in the process

### Comments Requirements

- [ ] **U18.1** (MOSCOW: ): No requirements in this section

### Alarms Parameters and Risks Requirements

- [ ] **U19.1** (MOSCOW: ): No requirements in this section

### Guidance Requirements

- [ ] **U20.1**: The solution **must** show escalation guidance using the same colour codes as the form uses (with Red for emergency) so that it is clear to users what each escalation corresponds to.
