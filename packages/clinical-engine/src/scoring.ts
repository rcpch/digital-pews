import { DomainError } from "@digital-pews/errors";
import type {
  AgeBracket,
  BloodPressureSkip,
  ObservationInput,
  ObservationScore,
  ObservationScoreBreakdown,
  RespiratoryDistressLevel,
  ScoreBand
} from "@digital-pews/types";

interface Threshold {
  min: number;
  max: number;
  score: 0 | 1 | 2 | 4;
}

type AgeThresholds = Record<AgeBracket, Threshold[]>;

const respiratoryRateThresholds: AgeThresholds = {
  "0-11m": [
    { min: Number.NEGATIVE_INFINITY, max: 9.99, score: 4 },
    { min: 10, max: 19.99, score: 2 },
    { min: 20, max: 29.99, score: 1 },
    { min: 30, max: 49.99, score: 0 },
    { min: 50, max: 59.99, score: 1 },
    { min: 60, max: 69.99, score: 2 },
    { min: 70, max: Number.POSITIVE_INFINITY, score: 4 }
  ],
  "1-4y": [
    { min: Number.NEGATIVE_INFINITY, max: 9.99, score: 4 },
    { min: 10, max: 19.99, score: 2 },
    { min: 20, max: 39.99, score: 0 },
    { min: 40, max: 49.99, score: 1 },
    { min: 50, max: 59.99, score: 2 },
    { min: 60, max: Number.POSITIVE_INFINITY, score: 4 }
  ],
  "5-12y": [
    { min: Number.NEGATIVE_INFINITY, max: 9.99, score: 4 },
    { min: 10, max: 14.99, score: 2 },
    { min: 15, max: 19.99, score: 1 },
    { min: 20, max: 24.99, score: 0 },
    { min: 25, max: 39.99, score: 1 },
    { min: 40, max: 49.99, score: 2 },
    { min: 50, max: Number.POSITIVE_INFINITY, score: 4 }
  ],
  "13-18y": [
    { min: Number.NEGATIVE_INFINITY, max: 9.99, score: 4 },
    { min: 10, max: 14.99, score: 1 },
    { min: 15, max: 24.99, score: 0 },
    { min: 25, max: 29.99, score: 1 },
    { min: 30, max: 39.99, score: 2 },
    { min: 40, max: Number.POSITIVE_INFINITY, score: 4 }
  ]
};

const heartRateThresholds: AgeThresholds = {
  "0-11m": [
    { min: Number.NEGATIVE_INFINITY, max: 79.99, score: 4 },
    { min: 80, max: 89.99, score: 2 },
    { min: 90, max: 109.99, score: 1 },
    { min: 110, max: 149.99, score: 0 },
    { min: 150, max: 169.99, score: 1 },
    { min: 170, max: 179.99, score: 2 },
    { min: 180, max: Number.POSITIVE_INFINITY, score: 4 }
  ],
  "1-4y": [
    { min: Number.NEGATIVE_INFINITY, max: 59.99, score: 4 },
    { min: 60, max: 69.99, score: 2 },
    { min: 70, max: 89.99, score: 1 },
    { min: 90, max: 139.99, score: 0 },
    { min: 140, max: 149.99, score: 1 },
    { min: 150, max: 169.99, score: 2 },
    { min: 170, max: Number.POSITIVE_INFINITY, score: 4 }
  ],
  "5-12y": [
    { min: Number.NEGATIVE_INFINITY, max: 59.99, score: 4 },
    { min: 60, max: 69.99, score: 2 },
    { min: 70, max: 79.99, score: 1 },
    { min: 80, max: 119.99, score: 0 },
    { min: 120, max: 139.99, score: 1 },
    { min: 140, max: 159.99, score: 2 },
    { min: 160, max: Number.POSITIVE_INFINITY, score: 4 }
  ],
  "13-18y": [
    { min: Number.NEGATIVE_INFINITY, max: 49.99, score: 4 },
    { min: 50, max: 59.99, score: 2 },
    { min: 60, max: 69.99, score: 1 },
    { min: 70, max: 99.99, score: 0 },
    { min: 100, max: 119.99, score: 1 },
    { min: 120, max: 129.99, score: 2 },
    { min: 130, max: Number.POSITIVE_INFINITY, score: 4 }
  ]
};

const systolicBpThresholds: AgeThresholds = {
  "0-11m": [
    { min: Number.NEGATIVE_INFINITY, max: 49.99, score: 4 },
    { min: 50, max: 59.99, score: 2 },
    { min: 60, max: 69.99, score: 1 },
    { min: 70, max: 89.99, score: 0 },
    { min: 90, max: 99.99, score: 1 },
    { min: 100, max: 109.99, score: 2 },
    { min: 110, max: Number.POSITIVE_INFINITY, score: 4 }
  ],
  "1-4y": [
    { min: Number.NEGATIVE_INFINITY, max: 49.99, score: 4 },
    { min: 50, max: 59.99, score: 2 },
    { min: 60, max: 79.99, score: 1 },
    { min: 80, max: 99.99, score: 0 },
    { min: 100, max: 119.99, score: 1 },
    { min: 120, max: 129.99, score: 2 },
    { min: 130, max: Number.POSITIVE_INFINITY, score: 4 }
  ],
  "5-12y": [
    { min: Number.NEGATIVE_INFINITY, max: 69.99, score: 4 },
    { min: 70, max: 79.99, score: 2 },
    { min: 80, max: 89.99, score: 1 },
    { min: 90, max: 109.99, score: 0 },
    { min: 110, max: 119.99, score: 1 },
    { min: 120, max: 129.99, score: 2 },
    { min: 130, max: Number.POSITIVE_INFINITY, score: 4 }
  ],
  "13-18y": [
    { min: Number.NEGATIVE_INFINITY, max: 79.99, score: 4 },
    { min: 80, max: 89.99, score: 2 },
    { min: 90, max: 99.99, score: 1 },
    { min: 100, max: 119.99, score: 0 },
    { min: 120, max: 129.99, score: 1 },
    { min: 130, max: 139.99, score: 2 },
    { min: 140, max: Number.POSITIVE_INFINITY, score: 4 }
  ]
};

function scoreToBand(score: 0 | 1 | 2 | 4): ScoreBand {
  if (score === 0) {
    return "white";
  }
  if (score === 1) {
    return "yellow";
  }
  if (score === 2) {
    return "orange";
  }
  return "pink";
}

function wrapScore(score: 0 | 1 | 2 | 4): ObservationScore {
  return {
    score,
    band: scoreToBand(score)
  };
}

function scoreFromThresholds(value: number, thresholds: Threshold[]): 0 | 1 | 2 | 4 {
  for (const threshold of thresholds) {
    if (value >= threshold.min && value <= threshold.max) {
      return threshold.score;
    }
  }

  throw new DomainError("SCORING_THRESHOLD_NOT_FOUND", `No threshold found for value ${value}`);
}

function scoreDistress(level: RespiratoryDistressLevel): 0 | 1 | 2 | 4 {
  if (level === "none") {
    return 0;
  }
  if (level === "mild") {
    return 1;
  }
  if (level === "moderate") {
    return 2;
  }
  return 4;
}

function scoreOxygenSaturation(oxygenSaturation: number): 0 | 1 | 2 | 4 {
  if (oxygenSaturation <= 91) {
    return 4;
  }
  if (oxygenSaturation < 95) {
    return 1;
  }
  return 0;
}

function scoreOxygenSupport(oxygenDevice: ObservationInput["oxygenDevice"], oxygenSupportMode: ObservationInput["oxygenSupportMode"], oxygenSupportValue?: number): 0 | 1 | 2 | 4 {
  if (oxygenDevice === "HF" || oxygenDevice === "BiP" || oxygenDevice === "CP") {
    return 4;
  }

  if (oxygenSupportMode === "air") {
    return 0;
  }

  if (oxygenSupportValue === undefined) {
    throw new DomainError("OXYGEN_SUPPORT_VALUE_REQUIRED", "Oxygen support value is required when mode is not air");
  }

  if (oxygenSupportMode === "percent") {
    if (oxygenSupportValue > 0 && oxygenSupportValue < 16) {
      return 1;
    }
    if (oxygenSupportValue < 30) {
      return 1;
    }
    if (oxygenSupportValue < 50) {
      return 2;
    }
    return 4;
  }

  if (oxygenSupportValue > 0 && oxygenSupportValue < 0.01) {
    return 1;
  }
  if (oxygenSupportValue < 2) {
    return 1;
  }
  if (oxygenSupportValue < 6) {
    return 2;
  }
  return 4;
}

function scoreCapillaryRefill(capillaryRefillSeconds: number): 0 | 1 | 2 | 4 {
  if (capillaryRefillSeconds >= 3) {
    return 2;
  }
  return 0;
}

function scoreBloodPressureFromSkip(skip: BloodPressureSkip): 0 | 1 | 2 | 4 {
  if (skip.reason === "not-attempted-no-concern" || skip.reason === "unsuccessful-no-concern") {
    return 0;
  }

  if (skip.reason === "unsuccessful-concern") {
    return 4;
  }

  if (skip.otherScore === undefined) {
    throw new DomainError("BP_SKIP_OTHER_SCORE_REQUIRED", "Other blood pressure skip reason requires explicit score 0 or 4");
  }

  if (!skip.otherText || skip.otherText.trim().length === 0) {
    throw new DomainError("BP_SKIP_OTHER_TEXT_REQUIRED", "Other blood pressure skip reason requires free text");
  }

  return skip.otherScore;
}

export function ageBracketFromMonths(ageMonths: number): AgeBracket {
  if (ageMonths < 0) {
    throw new DomainError("AGE_INVALID", "Age in months must not be negative");
  }
  if (ageMonths <= 11) {
    return "0-11m";
  }
  if (ageMonths <= 59) {
    return "1-4y";
  }
  if (ageMonths <= 155) {
    return "5-12y";
  }
  if (ageMonths <= 228) {
    return "13-18y";
  }

  throw new DomainError("AGE_OUT_OF_RANGE", "NPEWS currently supports up to 18 years");
}

export function scoreObservations(input: ObservationInput): ObservationScoreBreakdown {
  const ageBracket = ageBracketFromMonths(input.ageMonths);

  const respiratoryRate = wrapScore(
    scoreFromThresholds(input.respiratoryRate, respiratoryRateThresholds[ageBracket])
  );
  const respiratoryDistress = wrapScore(scoreDistress(input.respiratoryDistress));
  const oxygenSaturation = wrapScore(scoreOxygenSaturation(input.oxygenSaturation));
  const oxygenSupport = wrapScore(
    scoreOxygenSupport(input.oxygenDevice, input.oxygenSupportMode, input.oxygenSupportValue)
  );
  const heartRate = wrapScore(scoreFromThresholds(input.heartRate, heartRateThresholds[ageBracket]));

  let bloodPressure: ObservationScore;
  if (input.bloodPressureSkip) {
    bloodPressure = wrapScore(scoreBloodPressureFromSkip(input.bloodPressureSkip));
  } else {
    const systolicBloodPressure = input.systolicBloodPressure;
    if (systolicBloodPressure === undefined) {
      throw new DomainError(
        "BP_REQUIRED",
        "Systolic blood pressure is required unless a blood pressure skip reason is supplied"
      );
    }

    bloodPressure = wrapScore(
      scoreFromThresholds(systolicBloodPressure, systolicBpThresholds[ageBracket])
    );
  }

  const capillaryRefill = wrapScore(scoreCapillaryRefill(input.capillaryRefillSeconds));

  const total =
    respiratoryRate.score +
    respiratoryDistress.score +
    oxygenSaturation.score +
    oxygenSupport.score +
    heartRate.score +
    bloodPressure.score +
    capillaryRefill.score;

  return {
    ageBracket,
    respiratoryRate,
    respiratoryDistress,
    oxygenSaturation,
    oxygenSupport,
    heartRate,
    bloodPressure,
    capillaryRefill,
    total
  };
}
