// Main data file - loads modular components into global scope
// This file maintains backward compatibility by declaring all data as global variables
// Data is split across:
//   - npews-scoring-config.js: AGE_BANDS, ESCALATION_META
//   - demo-data.js: PATIENT, OBSERVATIONS

// Note: This file should be loaded AFTER npews-scoring-config.js and demo-data.js
// See index.html for proper load order

// Helper variables to get age-specific configs (backward compatibility with existing code)
// These fetch the correct configuration based on PATIENT.ageBand
const SCORING_BANDS = AGE_BANDS[PATIENT.ageBand]?.scoringBands || AGE_BANDS['5-12y'].scoringBands;
const CHART_CONFIG = AGE_BANDS[PATIENT.ageBand]?.chartConfig || AGE_BANDS['5-12y'].chartConfig;
