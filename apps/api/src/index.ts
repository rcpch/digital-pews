import { computeEscalation, scoreObservations } from "@digital-pews/clinical-engine";
import type { EscalationDecision, ObservationScoreBreakdown } from "@digital-pews/types";

export interface ScoreAndEscalateResult {
  scoring: ObservationScoreBreakdown;
  escalation: EscalationDecision;
}

export function scoreAndEscalateDemo(): ScoreAndEscalateResult {
  const scoring = scoreObservations({
    ageMonths: 24,
    respiratoryRate: 42,
    respiratoryDistress: "mild",
    oxygenSaturation: 94,
    oxygenDevice: "NP",
    oxygenSupportMode: "percent",
    oxygenSupportValue: 25,
    heartRate: 145,
    systolicBloodPressure: 95,
    capillaryRefillSeconds: 2
  });

  return {
    scoring,
    escalation: computeEscalation({
      pewsTotal: scoring.total,
      specificConcern: "none",
      carerQuestionAnswer: "S"
    })
  };
}
