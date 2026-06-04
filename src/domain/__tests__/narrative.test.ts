import { describe, expect, it } from "vitest";
import { buildStatusSummary, buildTimelineImpactNote } from "@/domain/narrative";

describe("buildStatusSummary", () => {
  it("reports the stage, progress and outstanding enquiries", () => {
    const summary = buildStatusSummary({
      propertyAddressLine: "42 Willowmere Drive",
      currentPhaseLabel: "Enquiries",
      overallPercent: 47,
      enquiries: {
        totalRaised: 15,
        resolved: 13,
        outstanding: 2,
        outstandingTopics: ["a Japanese knotweed plan", "loft building-regs sign-off"],
        lastChased: "2024-12-13T09:30:00Z",
      },
    });
    expect(summary).toContain("42 Willowmere Drive");
    expect(summary).toContain("47%");
    expect(summary).toContain("13 of the 15");
    expect(summary).toContain("2 questions remain outstanding");
    expect(summary).toContain("move towards exchanging contracts");
  });

  it("says so plainly when nothing is outstanding", () => {
    const summary = buildStatusSummary({
      propertyAddressLine: "42 Willowmere Drive",
      currentPhaseLabel: "Completion",
      overallPercent: 90,
      enquiries: { totalRaised: 15, resolved: 15, outstanding: 0, outstandingTopics: [], lastChased: "" },
    });
    expect(summary).toContain("no questions outstanding");
  });
});

describe("buildTimelineImpactNote", () => {
  it("reassures on funding and mentions indemnity insurance when relevant", () => {
    const note = buildTimelineImpactNote({
      mortgageOfferExpiry: "2025-03-12T00:00:00Z",
      targetCompletionDate: "2025-01-10T00:00:00Z",
      hasBuildingRegsBlocker: true,
    });
    expect(note).toContain("12 March 2025");
    expect(note).toContain("indemnity insurance");
  });

  it("omits the indemnity note when there is no building-regs blocker", () => {
    const note = buildTimelineImpactNote({
      mortgageOfferExpiry: "2025-03-12T00:00:00Z",
      targetCompletionDate: "2025-01-10T00:00:00Z",
      hasBuildingRegsBlocker: false,
    });
    expect(note).not.toContain("indemnity insurance");
  });
});
