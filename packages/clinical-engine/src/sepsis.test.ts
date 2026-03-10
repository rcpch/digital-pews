import { describe, expect, it } from "vitest";

import { shouldTriggerSepsisPrompt } from "./sepsis.js";

describe("shouldTriggerSepsisPrompt", () => {
  it("returns false when no sepsis indicators are present", () => {
    expect(
      shouldTriggerSepsisPrompt({
        neutropeniaOrImmunocompromised: false,
        knownOrSuspectedInfection: false,
        increasingOxygenRequirement: false,
        unexplainedTachypnoeaOrTachycardia: false,
        alteredMentalState: false,
        prolongedCrtOrMottledOrAshen: false
      })
    ).toBe(false);
  });

  it("returns true for abnormal temperature", () => {
    expect(
      shouldTriggerSepsisPrompt({
        neutropeniaOrImmunocompromised: false,
        knownOrSuspectedInfection: false,
        temperatureCelsius: 38.2,
        increasingOxygenRequirement: false,
        unexplainedTachypnoeaOrTachycardia: false,
        alteredMentalState: false,
        prolongedCrtOrMottledOrAshen: false
      })
    ).toBe(true);
  });
});
