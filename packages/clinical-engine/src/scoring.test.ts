import { describe, expect, it } from "vitest";

import { ageBracketFromMonths, scoreObservations } from "./scoring.js";

describe("ageBracketFromMonths", () => {
  it("maps boundaries correctly", () => {
    expect(ageBracketFromMonths(0)).toBe("0-11m");
    expect(ageBracketFromMonths(11)).toBe("0-11m");
    expect(ageBracketFromMonths(12)).toBe("1-4y");
    expect(ageBracketFromMonths(59)).toBe("1-4y");
    expect(ageBracketFromMonths(60)).toBe("5-12y");
    expect(ageBracketFromMonths(155)).toBe("5-12y");
    expect(ageBracketFromMonths(156)).toBe("13-18y");
    expect(ageBracketFromMonths(228)).toBe("13-18y");
  });
});

describe("scoreObservations", () => {
  it("calculates 0-11m scores including oxygen device override", () => {
    const result = scoreObservations({
      ageMonths: 8,
      respiratoryRate: 30,
      respiratoryDistress: "none",
      oxygenSaturation: 95,
      oxygenDevice: "HF",
      oxygenSupportMode: "percent",
      oxygenSupportValue: 21,
      heartRate: 120,
      systolicBloodPressure: 80,
      capillaryRefillSeconds: 1
    });

    expect(result.respiratoryRate.score).toBe(0);
    expect(result.oxygenSupport.score).toBe(4);
    expect(result.total).toBe(4);
  });

  it("scores blood pressure skipped with concern as 4", () => {
    const result = scoreObservations({
      ageMonths: 140,
      respiratoryRate: 21,
      respiratoryDistress: "mild",
      oxygenSaturation: 94,
      oxygenDevice: "NP",
      oxygenSupportMode: "air",
      heartRate: 100,
      bloodPressureSkip: {
        reason: "unsuccessful-concern"
      },
      capillaryRefillSeconds: 3
    });

    expect(result.bloodPressure.score).toBe(4);
    expect(result.capillaryRefill.score).toBe(2);
  });

  it("requires explicit score and text for blood pressure other skip", () => {
    expect(() =>
      scoreObservations({
        ageMonths: 140,
        respiratoryRate: 21,
        respiratoryDistress: "none",
        oxygenSaturation: 95,
        oxygenDevice: "NP",
        oxygenSupportMode: "air",
        heartRate: 90,
        bloodPressureSkip: {
          reason: "other",
          otherScore: 4
        },
        capillaryRefillSeconds: 2
      })
    ).toThrowError(/free text/i);
  });

  it("scores oxygen under 16 percent as 1", () => {
    const result = scoreObservations({
      ageMonths: 100,
      respiratoryRate: 23,
      respiratoryDistress: "none",
      oxygenSaturation: 95,
      oxygenDevice: "FM",
      oxygenSupportMode: "percent",
      oxygenSupportValue: 15,
      heartRate: 95,
      systolicBloodPressure: 95,
      capillaryRefillSeconds: 2
    });

    expect(result.oxygenSupport.score).toBe(1);
  });
});
