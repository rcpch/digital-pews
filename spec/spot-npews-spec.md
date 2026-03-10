# SPOT / NPEWS Specification V1.0

This document is the baseline specification for SPOT NPEWS systems. This has been created based on solutions previously procured by Trusts and feedback from clinicians and technical colleagues.
This cover sheet will outline some of the guiding principles for the use of this document by ICSs and Trusts.

## Use of MOSCOW

We have used the MOSCOW rating system to assess the priority of each requirement. In an ideal situation a solution would meet or exceed every requirement but we recognise that this isn't practical and have used the rating method to reflect differing priorities. Different people may use the MOSCOW ratings in different ways so we have provided a definition of our usage to make things clearer for users of this document
- **Must** - Any SPOT / NPEWS solution **must** meet all of these requirements. When undergoing a procurement exercise no solution **should** be selected that fails one or more Musts.
- **Should** - Ideally a SPOT / NPEWS solution would have all the Shoulds as well as all the musts. There may be some shoulds that don't apply to certain solutions, or some suppliers may do the majority of the Shoulds but miss one or two. Missing a **should** is not a barrier to a successful procurement but would be a useful comparison to make between competing suppliers to pick the one best suited.
- **Could** - A **could** is a nice to have, these are often future looking or ideal features that it is understood many or most suppliers won't deliver yet, but may have on roadmaps. A lack of coulds **should** not be a barrier to supplier selection, but where several suppliers are similar in their ability to meet Musts and Shoulds whether they meet Coulds is a useful measure for differentiation.
- Won't - This is used to call out something we explicitly won't be doing. No solution **should** do this feature as to do so would be an error. We include some won'ts to avoid assumptions that might be made otherwise

## Breakdown by clinical and technical requirements

Owing to the differing nature of and review process for these requirements, we've broken apart the requirements into a clinical section (identified by IDs beginning with C) and a technical section (identified by IDs beginning with T). This has been done to help trusts assign the right areas to the right members of staff when they're assessing bids and to help suppliers with the focus of their responses. The designation of an item as either clinical or technical doesn't affect its importance, both sides have equal weighting. Due to the nature of the system there are some requirements that **could** sit in either side of the specification. For ease of use we have just selected one or the other to place them in, but you may as a result see a few requirements that straddle the two sides. The format used for assessment has been the same regardless of the requirements categorisation so either side **should** be readable in the same way.

## Usage of this document by Integrated Care Systems (ICSs) and Trusts

The purpose of this document is to form a baseline for the SPOT / NPEWS solution for any ICS or trust who needs to procure a SPOT / NPEWS solution. This document is intended to be the national baseline, so as such it would be expected that any solution procured **must** meet all of the **Must** requirements that are included.   Given that this is a national document it is understood that we will be unable to reflect any locally specific requirements. As such it is expected that the trust add these to the requirements list before going out to procurement. For example we can add generic statements about integration, but the Trust may want to add a list of systems that they have that the solution **must** integrate with. There may also be some of the Shoulds or Coulds that change locally, for instance we might have included a **could** that just isn't relevant in your local environment so you can take it out. Alternatively one of our Shoulds may be a **Must** in your local area, so you **should** feel free to upgrade its status. This is a baseline so we are more than happy for Trusts to increase the classification of items and aim at a higher standard. In terms of downgrades, care **must** be given before downgrading a **Must**, as you may find that your system isn't compliant with national standards, however there may be limited situations where you need to replace a generic **must** with a more specific one reflecting local realities.
Requirements from this document are being shared with suppliers in the SPOT / NPEWS market for comment and review so using this baseline **should** assist your procurements as suppliers will already have sight of it. It is hoped that by including shoulds and coulds into this specification we can help to inform suppliers roadmaps to resolve those issues where they might be diverging from the expected standard.

## Key definitions

### The Solution

When we use the term "the solution" (typically in the format of "The solution **must** do X") we mean the full set of system or systems provided by the supplier. No judgement is made as to whether this needs to be one piece of software or several that are integrated. The integration is a key assumption that is made, it wouldn't be acceptable to have a solution that had bits of technology that didn't speak to each other so clinicians were required to double enter data. However as long as it's fully integrated any number of software/hardware items can be included as part of the solution. It can be worth reading this as meaning "As a whole the fully integrated solution **Must** do X", but we have left that wording out for the sake of space.    In terms of any requirements that refer to compliance (e.g. GDPR) this refers to each and every component part of the solution. So for a supplier to confirm that their solution meets this requirement they are confirming that all the related software they'll be deploying meets that requirement.

### MOSCOW within requirements

When writing a requirement the relevant MOSCOW term will be used throughout the requirement (e.g. The solution **should** do X and it **should** also do Y and it **should** output in the format of z). Even though the less mandatory terms of **Should** and **Could** are used in this way, if a supplier is answering that they meet the requirement they are saying that they meet all of it. If they are in a situation where they meet some of the requirement but not all of it they need to make this clear in their submission. This can then be taken into account by the trust when assessing suppliers. For shoulds and coulds it isn't an automatic barrier if a supplier is only partially compliant, but if they just say that they are compliant and don't outline the areas that they are deficient then this **could** become an issue with any contract signed based on the supplier appearing fully compliant with a requirement. It is also worth noting that sometimes the phrase "**must** allow" or equivalent is used. This means that the option **must** be there for the clinician to use, not that it is expected that they use it every time. A good example of this is the ability to skip the entry of an observation

### Clinicians

Clinicians is our generally used term to refer to staff working with the SPOT / NPEWS system. For some requirements specific jobs are called out but otherwise clinicians is used as a generic term. Occasionally users is used as well, this means all users of the system both clinicians and others (e.g. technical administration staff). When clinicians is used it **should** not be taken to imply any particular job role, if the supplier needs clarification of which are or are not included locally they **should** seek this from the trust, as in some areas this will change depending on local needs.

### ICS/Trust

The Integrated Care Systems (ICSs) and Trusts are used interchangeably through this document. Depending on the area purchasing of systems may be done at the ICS or at the Trust level and so both are used throughout. If the procurement is being done at ICS level requirements that refer to the Trust **should** be seen to refer to the ICS and vice versa.

### Standards and datasets

When standards and datasets are listed it is assumed that the current version as of the date of procurement publication is to be used. Version numbers have not been used in this document to avoid creating an overhead in terms of updating them, but trusts are welcome to include them in their procurement documents. Any new datasets will be included as part of the regular updates to this document.

### Patient

We've used patient to refer to the child or young person accessing medical services and having observations taken by clinicians

### Carer

We've used carer to refer to the carer or parent responsible for the child or young person receiving medical care

### Form

We've used Form generically to describe the interface used to input observation data on the PEWS system, in a similar way to the paper version being called a form. We understand that different supplier solutions may use different terms like interface, app or workflow, and in their systems "form" may mean something different. For our purposes we are using the term in its generic plain English form and do not preclude different ways that suppliers may implement the described interface in their systems

### Training Requirements

This specification refers to supplier led training (typically expected to be of the train the trainer format) to be delivered as part of implementation. This will need to be supplier specific training by it's nature, as each supplier's system will be different. NHS England has designed training on the paper form which even in digital trusts **should** be used as a business continuity backup, so this training will be useful for the general principles of PEWS, however trusts will need supplier training to understand each system.

### Compliance with the standard

For a trust or a supplier to claim that they are compliant with the National PEWS standard in communications or advertising their solution **must** meet all of the **must** requirements in the specifications. A failure to meet any **must-have** requirement will mean that the trust or supplier will not be allowed to claim to be compliant with PEWS.

## Clinical Requirements

### General Clinical Requirements
- [ ] **C1.1**: The solution **must** support bidirectional integration with Electronic Patient Records so that the patient's details can be pulled into the form, and the form be attached to the record when used. This **must** ensure entries are only made once.
- [ ] **C1.2**: The solution **must** include banding for the different levels of each measure of observation. These bandings **must** score for PEWS and be coloured coded. The colours and scores **must** be White - 0 Points, Yellow - 1 Point, Orange - 2 Points, Pink - 4 Points.
- [ ] **C1.3**: The solution **must** allow the banding levels for each observation to change as new guidance is issued by NHSE
- [ ] **C1.4**: The solution **must** use the higher of two possible bandings if due to an unexpected level of specificity a score would fall between them on the scale outlined as part of configuration
- [ ] **C1.5**: The solution **should** interface with other hospital communication systems to create wider alerts in an emergency
- [ ] **C1.6**: The solution **should** allow a clinician to mark the periods when a patient is absent for theatre or scans and highlight this on the form
- [ ] **C1.7**: The solution **must** be developed in such a way that requirements can be fulfilled and updates implemented as directed by this specification and any updates to it. Suppliers will not be able to use the implementation of other early warning systems (e.g. NEWS, MEWS) as an excuse to deviate from requirements contained in this specification. While suppliers are welcome to develop systems in such a way that permit reuse of assets this **must** not be at the expense of being able to implement core PEWS features.
- [ ] **C1.8** (MOSCOW: Won't): The solution won't stop a clinician inputting a single observation into an overarching system (like an EPR). The full set will only be expected when doing a PEWS observation that would then score

### Form Creation and Selection Requirements

- [ ] **C2.1**: The solution **must** allow a new NPEWS form to be created for a patient
- [ ] **C2.2**: The solution **must** present the form appropriate for the age of the patient. Where the patient is on the border between two age brackets it **must** allow the clinician to select the alternate form (but not one further away).
- [ ] **C2.3**: The solution **must** allow different forms to be configured in the system. While these forms will capture the same data the solution **must** allow the bands and scoring to be different for each age range. The graphical display **should** update to show the bandings for that age range.
- [ ] **C2.4**: The solution **should** prompt a clinician when a patient has moved age brackets to recommend they change to the new form, but also it **should** allow the clinician to stay on the current form if they wished. It **should** only offer this prompt once (per age change) not repeatedly.

### Viewing and Recording Observations Requirements

- [ ] **C3.1**: The solution **must** show at least the previous 24 hours' observations, unless there is less than 24 hours recorded then it **must** show all the observations. This can use scrolling, but may not be implemented by having to load a different non-continuous view
- [ ] **C3.2**: The solution **should** show more than 24 hours observations. The solution **should** be able to show the previous 96 hours observations on one screen. This can use scrolling, but may not be implemented by having to load a different non-continuous view
- [ ] **C3.3**: The solution **must** show at least 12 observations when they are infrequent enough that there have been less than ten in a 24 hour period.
- [ ] **C3.4**: The solution **must** allow regular observations to take place and expand to allow as many observations as take place in a rolling 24 hour period. This can use scrolling, but may not be implemented by having to load a different non-continuous view
- [ ] **C3.5**: The solution **should** allow regular observations to take place and expand to allow as many observations as take place in a rolling 96 hour period. This can use scrolling, but may not be implemented by having to load a different non-continuous view
- [ ] **C3.6**: The solution **must** allow a clinician to start observations at whatever time the patient is admitted to the ward
- [ ] **C3.7**: The solution **must** allow the clinician to record the date time and frequency of observations, the date and time **must** default to the current date and time
- [ ] **C3.8**: The solution **must** allow a clinician to record observations up to ten minutes in the past and still incur a PEWS score and escalate appropriately
- [ ] **C3.9**: The solution **should** when recording observations in the past offer the option of "already escalated" to show times where an escalation has already taken place and observations are being put in afterwards. This option would suppress any implemented automatic alerts
- [ ] **C3.10**: The solution **must** be able to report on retroactive observations so that trends on when observations are input can be detected
- [ ] **C3.11** (MOSCOW: Won't): The solution won't interfere with the ability for a wider system (e.g. an EPR) to take one or more observations at whatever time they are input (according to that system's rules). The restriction on time for input only applies to observations that incur a PEWS score.
- [ ] **C3.12**: The solution **must** allow a clinician to go back and view older observations or previous forms and admissions for the history of the patient
- [ ] **C3.13**: The solution **must** make it clear to clinicians that they are viewing older observations to ensure that clinicians are clear what they are observing
- [ ] **C3.14**: The solution **should** take automated observations from monitoring systems
- [ ] **C3.15**: The solution **should** take automated observations from wireless monitoring systems
- [ ] **C3.16**: The solution **must** prompt the user to confirm a value if it is far beyond expected results
- [ ] **C3.17**: The solution **must** allow a clinician to decline to record an observation and still progress, but **must** prompt for a reason
- [ ] **C3.18**: The solution **must** use a codified list of reasons to decline to record an observation. These will vary for each type of observation, but will be set centrally as a part of the SPOT programme
- [ ] **C3.19**: The solution **must** allow an "Other" option for each codified list of reasons to decline to record an observation. When selecting "Other" the clinician **must** input free text to explain the reason
- [ ] **C3.20**: The solution **must** allow a clinician viewing observations to see a reason that the previous observation was declined so that they can see if a pattern is developing
- [ ] **C3.21**: The solution **must** allow certain reasons to decline an observation to attract scoring contributing to the PEWS score for that measure. E.g. on blood pressure you **could** score when unable to take blood pressure but it causes concern
- [ ] **C3.22**: The solution **must** allow exports and reports on observations that have been declined so that analysis can be made. This **must** include the reason given. This **must** be reportable by clinician, by clinical setting and by type of observation.

### Correcting and Deleting Observations Requirements

- [ ] **C4.1**: The solution **must** allow a user to correct observations as they are taking them in case of an error. This **must** have a limited time frame otherwise it will count as previous observations in other requirements. There **must** still be an audit trail of corrections
- [ ] **C4.2**: The solution **must** allow a previous observation to be updated to correct errors. The solution **must** record who made the correction on a previous observation and prompt them for a reason. It **must** also record a date/time stamp for any changes. The system **must** indicate that an observation has been changed.
- [ ] **C4.3**: The solution **must** allow a previous set of observations to be removed to correct errors. The solution **must** record who made the correction on a previous observation and prompt them for a reason. It **must** also record a date/time stamp for any changes.
- [ ] **C4.4**: The solution **must** show the history of any changed or removed observations so that data is not lost. It **must** also show a date/time stamp for any changes. This **must** either be on the chart itself or in a reporting function of the system
- [ ] **C4.5**: The solution **must** offer exports and reports on deleted or edited records so that analysis can be made

### Respiratory Rate Requirements

- [ ] **C5.1**: The solution **must** allow a respiratory rate to be recorded with each set of observations
- [ ] **C5.2**: The solution **must** capture and show the exact value of respiratory rate, as well as plotting the chart
- [ ] **C5.3**: The solution **must** allow different respiratory rates to attract different banding for the scoring of PEWS
- [ ] **C5.4**: The solution **must** allow graphing of respiratory rates between sets of observations so that trends can be seen

### Respiratory Distress Requirements

- [ ] **C6.1**: The solution **must** allow a respiratory distress rating to be recorded with each set of observations
- [ ] **C6.2**: The solution **must** allow a clinician to select which types of respiratory distress they are observing and then the solution **must** calculate which level of respiratory distress applies. The list of respiratory distress options will be set centrally by the SPOT programme
- [ ] **C6.3**: The solution **must** allow guidance on the possible types of respiratory distress to be shown
- [ ] **C6.4**: The solution **must** allow different types of respiratory distress to attract different banding for the scoring of PEWS
- [ ] **C6.5**: The solution **must** allow the guidance and banding for types of respiratory distress to be different for different age group form versions
- [ ] **C6.6**: The solution **should** allow graphing of types of respiratory distress between sets of observations so that trends can be seen

### Oxygen Saturation Requirements

- [ ] **C7.1**: The solution **must** allow oxygen saturation to be recorded with each set of observations
- [ ] **C7.2**: The solution **must** allow different values of oxygen saturation to attract different banding for the scoring of PEWS
- [ ] **C7.3**: The solution **must** show the actual numerical value of oxygen saturation on each set of observation
- [ ] **C7.4**: The solution **should** do graphing between observations of oxygen saturation

### Respiratory Support Device Requirements

- [ ] **C8.1**: The solution **must** allow the capture of the respiratory support device being used if applicable
- [ ] **C8.2**: The solution **must** be able to score some respiratory support devices higher than others to reflect their impact on PEWS scores
- [ ] **C8.3**: The solution **must** allow new devices to be set up and scored depending on updated guidance from NHS England
- [ ] **C8.4**: The solution **could** allow configuration to support research trials for new support devices
- [ ] **C8.5**: The solution **must** allow a clinician to select which types of respiratory support devices are being used and then link these to the correct scoring automatically
- [ ] **C8.6**: The solution **must** highlight when a respiratory support device is changed so that this can be easily detected

### Oxygen Delivery Requirements

- [ ] **C9.1**: The solution **must** allow the capture of Oxygen Delivery either as a percentage or as litres per minute. Both options **must** be available to clinicians to input when making observations, but for each round of observations they will only be able to input one or the other.
- [ ] **C9.2**: The solution **must** capture and show the exact value of Oxygen Delivery taking place, as well as plotting the chart. When delivering by percentage this **must** use integers, when delivering by litres per minute this **must** use up to two decimal places.
- [ ] **C9.3**: The solution **must** allow a clinician to record room air as an option for Oxygen Delivery
- [ ] **C9.4**: The solution **must** allow different rates of Oxygen Delivery to attract different banding for the scoring of PEWS
- [ ] **C9.5**: The solution **must** allow graphing of rates of Oxygen Delivery between sets of observations so that trends can be seen
- [ ] **C9.6**: The solution **must** create a break between the lines on the graph if the clinician switches between percentage or litres per minute for Oxygen Delivery
- [ ] **C9.7**: The solution **must** allow the different rates of banding to be set separately for oxygen percentage and oxygen litres per minute so that either method can be used for Oxygen Delivery. This **must** allow the clinician to switch back and forth between both methods.
- [ ] **C9.8**: The solution **should** allow the Trust to define whether percentage or litres per minute (or both) are appropriate inputs for each delivery device depending on local conditions

### Heart Rate Requirements

- [ ] **C10.1**: The solution **must** allow heart rate per minute to be recorded with each set of observations
- [ ] **C10.2**: The solution **must** capture and show the exact value of heart rate recorded (to the nearest integer), as well as plotting the chart
- [ ] **C10.3**: The solution **must** allow different values of heart rate per minute to attract different banding for the scoring of PEWS
- [ ] **C10.4**: The solution **must** allow graphing of rates of heart rate per minute between sets of observations so that trends can be seen

### Blood Pressure Requirements

- [ ] **C11.1**: The solution **must** allow a clinician to record the reason not done for the Blood Pressure observation and score them appropriately
- [ ] **C11.2**: The solution **must** capture and show the exact value of blood pressure recorded, as well as plotting the chart
- [ ] **C11.3**: The solution **must** allow the clinician to record blood pressure using both systolic and diastolic values
- [ ] **C11.4** (MOSCOW: **Must**): The solution **should** draw a vertical line between the systolic and diastolic values when both have been input
- [ ] **C11.5** (MOSCOW: Won't): The solution won't do any graphing between systolic and diastolic values of blood pressure
- [ ] **C11.6**: The solution **must** allow different values of blood pressure to attract different banding for the scoring of PEWS. For blood pressure the score **must** be using the systolic value
- [ ] **C11.7**: The solution **must** allow the mean blood pressure to be plotted on the chart as well.
- [ ] **C11.8**: The solution **should** allow graphing of the mean blood pressure to be plotted between observations
- [ ] **C11.9**: The solution **could** have extra logic to detect very high or very low diastolic values and score them as well. Data gathered from PEWS implementation will allow NHSE to set values that score in future updates.
- [ ] **C11.10**: The solution **must** allow a clinician to skip the input of diastolic blood pressure while still inputting a systolic value

### Capillary Refill Time Requirements

- [ ] **C12.1**: The solution **must** allow the clinician to record the capillary refill time in seconds when conducting observations
- [ ] **C12.2**: The solution **must** allow different values of capillary refill time to attract different banding for the scoring of PEWS.
- [ ] **C12.3**: The solution **must** capture and show the exact value of capillary refill time recorded

### Carer Question Requirements

- [ ] **C13.1**: The solution **must** allow the clinician to record the response to the carer question so that it can be used for triggering an escalation
- [ ] **C13.2**: The solution **should** allow the clinician to select options around carer questions and automatically calculate if an escalation is needed
- [ ] **C16.3**: The solution **must** include Worse, Same, Better, Parent/Carer Asleep, Unavailable, and Skip as options for the carer question
- [ ] **C16.4**: The solution **could** include "Parent/Carer is not sure" as an option for carer question

### Disability and Exposure Requirements

- [ ] **C14.1**: The solution **must** allow the clinician to record the AVPU response to allow for triggering, this **must** also include "Asleep" as an option
- [ ] **C14.2**: The solution **must** allow clinicians to record the blood glucose, this **must** allow numbers and text to cover when devices show "high" or "low" as the result
- [ ] **C14.3**: The solution **must** allow clinicians to record the pain score
- [ ] **C14.4**: The solution **must** allow clinicians to record which pain score category or method they used.
- [ ] **C14.5**: The solution **must** allow the Trust to set a default pain score category or method to save time for clinicians
- [ ] **C14.6**: The solution **must** allow the clinician to record if they have a suspicion of the patient having a new occurrence of sepsis or septic shock
- [ ] **C14.7**: The solution **must** allow the clinician to escalate on a new suspicion of sepsis or on a new suspicion of septic shock. These two conditions will have their own escalation levels under the specific concern section.
- [ ] **C14.8**: The solution **must** allow you to skip AVPU if you mark that a Glasgow Coma Score Sheet (GCS) is being completed

### Temperature Requirements

- [ ] **C15.1**: The solution **must** allow temperature to be recorded with each set of observations
- [ ] **C15.2**: The solution **must** capture and show the exact value of temperature to one decimal place, as well as plotting the chart. It **must** also show whether the reading taken was Axilla, Tympanic or Skin
- [ ] **C15.3**: The solution **must** allow graphing of rates of temperature between sets of observations so that trends can be seen
- [ ] **C15.4**: The solution **must** allow the graph to continue even if a clinician switches between different types of temperature measurement.

### Clinical Intuition Requirements

- [ ] **C16.1**: The solution **must** allow the clinician to record their clinical intuition to allow this to be used for triggering.
- [ ] **C16.2**: The solution **should** allow the clinician to select codified options around clinical intuition and automatically calculate if an escalation is needed
- [ ] **C16.3**: The solution **must** include Yes, No and Skip as options for Clinical intuition
- [ ] **C16.4**: The solution **could** include "I'm not sure" as an option for clinical intuition

### Scoring and Escalation Requirements

- [ ] **C17.1**: The solution **must** calculate a PEWS score based on the values filled in on the PEWS observations and display the calculated value on the form.
- [ ] **C17.2**: The solution **must** allow the escalation trigger criteria to be recorded when the patient is escalated. This **must** follow a series of short codes.
- [ ] **C17.3**: The solution **must** facilitate the guidance on the different escalation trigger criteria short codes to be displayed
- [ ] **C17.4**: The solution **must** allow the clinician to record whether a patient was escalated or whether a plan was already in place
- [ ] **C17.5**: The solution **must** allow the escalation level (e.g. Low, Medium, High, Emergency) to be recorded when the patient is escalated
- [ ] **C17.6**: The solution **must** calculate the escalation level based on the PEWS score or the other options, and auto populate this on the form
- [ ] **C17.7**: The solution **must** capture when various escalation routes are informed. This will be affected by local policy but **could** include Nurse in Charge (NIC), Medical Response team, Paediatric Intensive Care Unit (PICU), Transport Team to other setting, Other Hospital settings.
- [ ] **C17.8**: The solution **should** allow the time the medical response team arrived to be recorded when the patient is escalated and a medical response team escalation is part of local policy
- [ ] **C17.9**: The solution **must** record which clinician entered the observations
- [ ] **C17.10**: The solution **must** support alerts to be shown to the clinician when triggered by user interface interactions
- [ ] **C17.11**: The solution **must** score the higher of the two measures for Oxygen Delivery, namely Oxygen Delivery rate and Respiratory Support Device. Some devices will score towards the PEWS score, when they do although the level of support is recorded the score for oxygen level will be ignored. When the device doesn't score then the score for the level of support is used. In either situation both observations **should** be recorded.

### Comments Requirements

- [ ] **C18.1**: The solution **should** allow the clinician to add comments when completing observations
- [ ] **C18.2**: The solution **should** allow access to comments on observations when reviewing the chart

### Alarms Parameters and Risks Requirements

- [ ] **C19.1**: The solution **could** allow the capture of alarm limits directly from digital monitors.
- [ ] **C19.2**: The solution **should** allow the clinician to record any additional risk factors. This **should** allow the clinician to tick one or more options that apply and add comments to it. The default position **should** be "Not Applicable".
- [ ] **C19.3**: The solution **should** allow the clinician to record what the patient's normal value is for each of the life signs. At this stage these **should** not affect PEWS scoring.
- [ ] **C19.4** (MOSCOW: Won't): The solution won't change the PEWS scoring based on additional risk factors or patient normal levels
- [ ] **C19.5**: The solution **could** auto populate risk factors based on other EPR data where available.

### Guidance Requirements

- [ ] **C20.1**: The supplier **must** be able to implement updated guidance as regularly issued by NHS England
- [ ] **C20.2** (MOSCOW: Won't): The solution won't allow the local users or Trust to amend the guidance on escalations. This will be set centrally by NHS England
- [ ] **C20.3**: The solution **must** display guidance on the various PEWS escalation steps to the clinician so they can see which applies and use this to inform decision making.
- [ ] **C20.4**: The solution **must** show additional decision support guidance on the form relevant to clinical care
- [ ] **C20.5**: The solution **must** allow the additional decision support guidance to be updated based on new guidance from NHSE

## Technical Requirements

### Commercial Requirements

- [ ] **T1.1**: The supplier **must** be able to meet regular updates to the PEWS banding and scoring. These will happen no more frequently than every six months, and **must** be implemented by the supplier within a three month window
- [ ] **T1.2**: The supplier **must** either be able to include updates to the PEWS forms without additional charges Or the supplier **must** outline the expected costs associated with updates to the PEWS forms
- [ ] **T1.3**: The supplier **must** either be able to include updates to the Guidance without additional charges Or the supplier **must** outline the expected costs associated with updates to the Guidance
- [ ] **T1.4**: The supplier **must** either be able to include updates to the APIs without additional charges Or the supplier **must** outline the expected costs associated with updates to the APIs
- [ ] **T1.5**: The supplier **must** either be able to include emergency updates to the PEWS forms outside of the six monthly cycle without additional charges Or the supplier **must** outline the expected costs associated with emergency updates to the PEWS forms outside of the six monthly cycle
- [ ] **T1.6**: The supplier **must** confirm that if the proposed solution requires changes to third party software, the supplier shall be responsible for the ordering, payment, acceptance and delivery of such work
- [ ] **T1.7**: The supplier **must** either be able to include appropriate levels of staff training without additional charges Or the supplier **must** outline the expected costs associated with appropriate levels of staff training
- [ ] **T1.8**: The supplier **must** either be able to include technical support without additional charges Or the supplier **must** outline the expected costs associated with technical support
- [ ] **T1.9**: The supplier **must** explain if any feature in this specification is not included as standard and would incur additional costs. This **must** happen before the contract has begun.

### Cyber Security Requirements

- [ ] **T2.1**: The supplier **must** confirm that data in transit (including HL7 or similar messages) are encrypted and the server does not allow the use of outdated security protocols or ciphers. For example this means using TLS rather than SSLv3 and below.
- [ ] **T2.2**: The solution **should** have undergone a penetration test by an accredited 3rd party. Evidence of this will be provided to the Trust. This will be followed by a penetration test pre go live and annually thereafter. Please provide documentation to show the application has been Penetration Tested. This **should** include a report and a plan to mitigate risks.
- [ ] **T2.3**: The supplier **should** respond to any CareCert alerts sent by NHS Digital within the required timeframe

### Data Quality Requirements

- [ ] **T3.1**: The solution **must** be kept up to date with all mandatory information standard notice and standards issued by NHS Digital, NHSE or other central statutory authorities at no additional costs.
- [ ] **T3.2**: The solution **should** prompt a user to save any unsaved work or auto-save at defined points

### Environment Requirements

- [ ] **T4.1**: The supplier **must** supply training on the PEWS system for the clinical teams. The minimum standard for this **must** be train the trainer type training, though suppliers are encouraged to go beyond this where practical
- [ ] **T4.2**: The supplier **must** supply a training environment so that training can be conducted without risk to patient data
- [ ] **T4.3**: The supplier **must** equip the training environment with training patient data so that training can take place in the same way it would on real patients
- [ ] **T4.4**: The supplier **must** ensure that the training environment is kept up to date so that it is in line with the live environment. A change **could** be deployed to training first to allow training on an update, but the training environment **must** not be behind the live environment
- [ ] **T4.5**: The training environment **could** have the ability to roll back / refresh and Date Roll Forward functionality so that training sessions can be set up and repeated easily.
- [ ] **T4.6**: The solution **must** work within a restricted user environment and **must** not require the use of admin or power user permissions
- [ ] **T4.7**: The solution **should** be made compatible with future releases of modern Operating Systems and Internet Browsers.
- [ ] **T4.8**: The supplier **should** provide training materials to accompany upgrades. Downtime **should** be planned with the trust for least disruption. If any additional services are expected to be associated with an upgrade the trust **should** be made aware of these costs before the upgrade is scheduled.
- [ ] **T4.9** (MOSCOW: **Must**): The supplier **should** adopt a training approach that will enable the trust's users to be trained to a level where they can use the solution in the appropriate capacities without unexpected supervision or support. The supplier **should** outline its approach to training as part of the submission
- [ ] **T4.10**: The supplier **must** provide a help desk service staffed by technicians capable of dealing with all aspects of the supplied solution, excluding hardware and software that is provided by the Trust. The role of the supplier service desk will be to rectify faults and provide support with issues at a minimum. The supplier **must** provide the Trust with a documented Service support model, identifying the main procedures, including the procedures for passing calls on to other relevant parties. The supplier **must** supply information on the opening times of the helpdesk and if applicable any out of hours support cover.
- [ ] **T4.11**: The solution **must** support access from both desktop and mobile platforms.
- [ ] **T4.12**: The solution **must** support use from users with colour blindness.

### Governance Requirements

- [ ] **T5.1**: The supplier **must** comply with any recommendations, legislation or national standards as described in the following:  ~ General Data Protection Regulations (GDPR)  ~ Caldicott Guidelines  ~ HSCN Connection Agreement  ~ Data Security & Protection Toolkit (DSPT)  ~ Information Standard Notices as published by NHS Digital   The supplier **must** confirm whether they are registered with the ICO under GDPR/DPA18.  The supplier **must** ensure that their staff are adequately trained on their responsibilities under these regulations.
- [ ] **T5.2**: The supplier **must** ensure adequate security controls are in place and that they fully are compliant with General Data Protection Regulations (GDPR) if Trust data is stored with a 3rd party (i.e. cloud service)
- [ ] **T5.3**: The solution **must** ensure that data accessed on a mobile device is held securely, adhering to the Information Security Management: NHS Code of Practice
- [ ] **T5.4**: The solution **must** only host data within the UK, the European Economic Area (EEA), a country deemed adequate by the European Commission, or in the US where covered by Privacy Shield. (https://digital.nhs.uk/data-and-information/looking-after-information/data-security-and-information-governance/nhs-and-social-care-data-off-shoring-and-the-use-of-public-cloud-services)
- [ ] **T5.5**: The supplier **should** confirm that certification to ISO 9001 has been achieved and has been accredited towards ISO 27001 international security management standards for all its business operations with the system complying with all NHS security requirements.
- [ ] **T5.6**: Data **must** be retained as set out in the Records Management Code of Practice for Health and Social Care (2016) .  Those responsible for storing records **must** also ensure that disposal takes place in accordance with current retention schedules, and that disposals occur promptly and consistently.  Regular disposal of records (including electronic records) in accordance with the retention schedule is vital to ensure that information is not retained for longer than is necessary for the purpose for which it was recorded to comply with Data Protection requirements. These guidelines apply to NHS records, including records of NHS patients treated on behalf of the NHS in the private healthcare sector and public health records, regardless of the media on which they are held.  This includes records of staff, complaints, corporate records and any other records held in any format including both paper and digital records.  The guidelines also apply to Adult Social Care records where these are integrated with NHS patient records. The solution **must** be able to process a right to be forgotten where this would legally apply under the GDPR
- [ ] **T5.7**: The Supplier **must** confirm that the proposed system allows for the implementation of the NHS Digital National Opt Out.
- [ ] **T5.8**: The solution **must** be certified as a medical device (ISO134852016) and legally registered with the MHRA to allow it to offer guidance based on the observations and PEWS Scores.

### Interoperability Requirements

- [ ] **T6.1**: The solution **must** be able to share data with other hospitals and trusts systems, regardless of EPR supplier. This **must** ensure that if a patient is transferred their PEWS observations can be transmitted with the rest of the record. As well as automatic data sharing this **must** cover printing out records in an appropriate format for systems that aren't compatible or situations like court cases. This **must** mimic the PEWS paper form as closely as possible.
- [ ] **T6.2**: The solution **must** be able to share data with other care settings within the trust and with other trusts. This **must** include but is not limited to Primary Care settings and Ambulance Services
- [ ] **T6.3**: The solution **should** be able to share data with other NHS services that may take or need to view observations (e.g. NHS 111)
- [ ] **T6.4**: The solution **must** be able to share statistical data back to NHSE or another nominated body so that analysis of PEWS can take place.
- [ ] **T6.5**: The solution **must** be able to share data with other systems using a RESTful API. The supplier **must** be able to share at a minimum all observations captured during the PEWS process whether they inform the PEWS score or not and identifying patient information.
- [ ] **T6.6**: The supplier **must** be able to respond to a future API specification being issued by NHS England for data sharing and ensure that their solution is compatible with this.
- [ ] **T6.7**: The solution **must** be able to export PEWS data to PDF to support legal proceedings or case review boards.

### Reliability Requirements

- [ ] **T7.1**: The solution **must** be able to recover from major outages following a disaster recovery plan. The supplier **must** outline their approach to disaster recovery to cover a range of predicted types of outages. The priority **must** be to ensure that data is not lost while an outage is happening.
- [ ] **T7.2**: The supplier **must** measure the availability of the Service; it **must** be measured against a target to be agreed during contracting and will provide the results of such monitoring to the Trust via a mutually agreed time and format. The supplier **must** outline what monitoring systems they have for the solution and how they can be shared with the trust.
