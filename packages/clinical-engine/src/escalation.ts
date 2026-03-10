import type {
  EscalationDecision,
  EscalationInput,
  EscalationLevel,
  EscalationReasonCode
} from "@digital-pews/types";

const escalationWeight: Record<EscalationLevel, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  emergency: 4
};

function maxLevel(levels: EscalationLevel[]): EscalationLevel {
  let current: EscalationLevel = "none";
  for (const level of levels) {
    if (escalationWeight[level] > escalationWeight[current]) {
      current = level;
    }
  }
  return current;
}

function levelFromPews(pewsTotal: number): EscalationLevel {
  if (pewsTotal >= 13) {
    return "emergency";
  }
  if (pewsTotal >= 9) {
    return "high";
  }
  if (pewsTotal >= 5) {
    return "medium";
  }
  if (pewsTotal >= 1) {
    return "low";
  }
  return "none";
}

function levelFromSpecificConcern(input: EscalationInput["specificConcern"]): EscalationLevel {
  if (input === "sepsis") {
    return "medium";
  }

  if (input === "septic-shock" || input === "avpu-v") {
    return "high";
  }

  if (input === "avpu-p-u" || input === "abnormal-pupillary-response") {
    return "emergency";
  }

  return "none";
}

function reasonCode(input: EscalationInput, finalLevel: EscalationLevel): EscalationReasonCode {
  const specificConcernLevel = levelFromSpecificConcern(input.specificConcern);
  if (escalationWeight[specificConcernLevel] >= escalationWeight[finalLevel] && specificConcernLevel !== "none") {
    return "SC";
  }

  if (
    input.carerQuestionAnswer === "W" &&
    input.carerEscalation !== undefined &&
    escalationWeight[input.carerEscalation] >= escalationWeight[finalLevel]
  ) {
    return "CQ";
  }

  if (
    input.clinicalIntuitionEscalation !== undefined &&
    escalationWeight[input.clinicalIntuitionEscalation] >= escalationWeight[finalLevel]
  ) {
    return "CI";
  }

  if (input.pewsTotal > 0) {
    return "P";
  }

  return "0";
}

export function computeEscalation(input: EscalationInput): EscalationDecision {
  const candidateLevels: EscalationLevel[] = [
    levelFromPews(input.pewsTotal),
    levelFromSpecificConcern(input.specificConcern)
  ];

  if (input.clinicalIntuitionEscalation !== undefined) {
    candidateLevels.push(input.clinicalIntuitionEscalation);
  }

  if (input.carerQuestionAnswer === "W" && input.carerEscalation !== undefined) {
    candidateLevels.push(input.carerEscalation);
  }

  const level = maxLevel(candidateLevels);

  return {
    level,
    reasonCode: reasonCode(input, level)
  };
}
