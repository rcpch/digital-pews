import { describe, expect, it } from "vitest";

import { computeEscalation } from "./escalation.js";

describe("computeEscalation", () => {
  it("derives escalation from PEWS score", () => {
    const result = computeEscalation({
      pewsTotal: 6,
      specificConcern: "none",
      carerQuestionAnswer: "S"
    });

    expect(result.level).toBe("medium");
    expect(result.reasonCode).toBe("P");
  });

  it("allows carer worsening to escalate level", () => {
    const result = computeEscalation({
      pewsTotal: 2,
      specificConcern: "none",
      carerQuestionAnswer: "W",
      carerEscalation: "high"
    });

    expect(result.level).toBe("high");
    expect(result.reasonCode).toBe("CQ");
  });

  it("applies specific concern as highest-priority reason", () => {
    const result = computeEscalation({
      pewsTotal: 10,
      specificConcern: "avpu-p-u",
      carerQuestionAnswer: "B"
    });

    expect(result.level).toBe("emergency");
    expect(result.reasonCode).toBe("SC");
  });
});
