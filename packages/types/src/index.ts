export type AgeBracket = "0-11m" | "1-4y" | "5-12y" | "13-18y";

export type ScoreBand = "white" | "yellow" | "orange" | "pink";

export type RespiratoryDistressLevel = "none" | "mild" | "moderate" | "severe";

export type OxygenDeviceCode = "HF" | "BiP" | "CP" | "NP" | "FM" | "HB" | "NRB";

export type OxygenSupportMode = "air" | "percent" | "litres";

export type BloodPressureSkipReason =
  | "not-attempted-no-concern"
  | "unsuccessful-no-concern"
  | "unsuccessful-concern"
  | "other";

export interface BloodPressureSkip {
  reason: BloodPressureSkipReason;
  otherText?: string;
  otherScore?: 0 | 4;
}

export interface ObservationInput {
  ageMonths: number;
  respiratoryRate: number;
  respiratoryDistress: RespiratoryDistressLevel;
  oxygenSaturation: number;
  oxygenDevice: OxygenDeviceCode;
  oxygenSupportMode: OxygenSupportMode;
  oxygenSupportValue?: number;
  heartRate: number;
  systolicBloodPressure?: number;
  bloodPressureSkip?: BloodPressureSkip;
  capillaryRefillSeconds: number;
}

export interface ObservationScore {
  score: 0 | 1 | 2 | 4;
  band: ScoreBand;
}

export interface ObservationScoreBreakdown {
  ageBracket: AgeBracket;
  respiratoryRate: ObservationScore;
  respiratoryDistress: ObservationScore;
  oxygenSaturation: ObservationScore;
  oxygenSupport: ObservationScore;
  heartRate: ObservationScore;
  bloodPressure: ObservationScore;
  capillaryRefill: ObservationScore;
  total: number;
}

export type EscalationLevel = "none" | "low" | "medium" | "high" | "emergency";

export type CarerQuestionAnswer = "W" | "S" | "B" | "A" | "U";

export type SpecificConcern =
  | "none"
  | "sepsis"
  | "septic-shock"
  | "avpu-v"
  | "avpu-p-u"
  | "abnormal-pupillary-response";

export interface EscalationInput {
  pewsTotal: number;
  specificConcern: SpecificConcern;
  clinicalIntuitionEscalation?: EscalationLevel;
  carerQuestionAnswer: CarerQuestionAnswer;
  carerEscalation?: EscalationLevel;
}

export type EscalationReasonCode = "SC" | "CQ" | "CI" | "P" | "0";

export interface EscalationDecision {
  level: EscalationLevel;
  reasonCode: EscalationReasonCode;
}

// ---------------------------------------------------------------------------
// SMART-on-FHIR types
// ---------------------------------------------------------------------------

/** SMART launch modes supported by the app. */
export type SmartLaunchMode = "ehr" | "standalone";

/** Scopes the app may request during the SMART authorize step. */
export type SmartScope =
  | "openid"
  | "fhirUser"
  | "launch"
  | "launch/patient"
  | "launch/encounter"
  | "patient/*.read"
  | "patient/*.write"
  | "offline_access"
  | (string & {});

/** Configuration required to initiate a SMART launch. */
export interface SmartClientConfig {
  clientId: string;
  redirectUri: string;
  scope: readonly SmartScope[];
  fhirBaseUrl: string;
  launchMode: SmartLaunchMode;
  /**
   * The opaque `launch` parameter provided by the EHR in an EHR-launch flow.
   * Required when `launchMode` is `"ehr"`, ignored for standalone.
   */
  launchToken?: string | undefined;
}

/** Endpoints discovered from the FHIR server's CapabilityStatement or .well-known. */
export interface SmartEndpoints {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  registrationEndpoint?: string | undefined;
  managementEndpoint?: string | undefined;
  introspectionEndpoint?: string | undefined;
  revocationEndpoint?: string | undefined;
}

/** The token response returned after a successful code exchange or refresh. */
export interface SmartTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  scope: string;
  refreshToken?: string | undefined;
  idToken?: string | undefined;
  /** UNIX ms timestamp when this token was received (used for expiry calc). */
  issuedAt: number;
}

/** Launch context extracted from the token response or launch parameters. */
export interface SmartLaunchContext {
  patient?: string | undefined;
  encounter?: string | undefined;
  practitioner?: string | undefined;
  fhirUser?: string | undefined;
}

/** Full session state after a successful SMART launch. */
export interface SmartSession {
  fhirBaseUrl: string;
  tokenResponse: SmartTokenResponse;
  launchContext: SmartLaunchContext;
  launchMode: SmartLaunchMode;
}
