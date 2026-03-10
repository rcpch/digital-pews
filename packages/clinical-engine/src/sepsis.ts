export interface SepsisChecklistInput {
  neutropeniaOrImmunocompromised: boolean;
  knownOrSuspectedInfection: boolean;
  temperatureCelsius?: number;
  increasingOxygenRequirement: boolean;
  unexplainedTachypnoeaOrTachycardia: boolean;
  alteredMentalState: boolean;
  prolongedCrtOrMottledOrAshen: boolean;
}

export function shouldTriggerSepsisPrompt(input: SepsisChecklistInput): boolean {
  const temperatureFlag =
    input.temperatureCelsius !== undefined &&
    (input.temperatureCelsius >= 38 || input.temperatureCelsius < 36);

  return (
    input.neutropeniaOrImmunocompromised ||
    input.knownOrSuspectedInfection ||
    temperatureFlag ||
    input.increasingOxygenRequirement ||
    input.unexplainedTachypnoeaOrTachycardia ||
    input.alteredMentalState ||
    input.prolongedCrtOrMottledOrAshen
  );
}
