import { describe, expect, it } from "vitest";
import { loadCaseData } from "@/domain/loadCase";
import {
  deriveBlockers,
  deriveEnquirySummary,
  deriveNextSteps,
  deriveOverallPercent,
  derivePhases,
} from "@/domain/progress";

const data = await loadCaseData();

describe("deriveOverallPercent", () => {
  it("is the share of completed tasks, rounded", () => {
    // 7 of 17 tasks are completed in the provided feed (7 / 17 ≈ 41%).
    expect(deriveOverallPercent(data.tasks)).toBe(41);
  });

  it("is 0 for an empty task list", () => {
    expect(deriveOverallPercent([])).toBe(0);
  });
});

describe("derivePhases", () => {
  it("marks Enquiries as the current phase", () => {
    const current = derivePhases(data.tasks).find((phase) => phase.isCurrent);
    expect(current?.key).toBe("enquiries");
  });

  it("reports earlier phases as completed and later ones as upcoming", () => {
    const phases = derivePhases(data.tasks);
    const byKey = Object.fromEntries(phases.map((phase) => [phase.key, phase]));
    expect(byKey.getting_started.status).toBe("completed");
    expect(byKey.searches_and_legal.status).toBe("completed");
    expect(byKey.exchange.status).toBe("upcoming");
    expect(byKey.after_completion.status).toBe("upcoming");
  });

  it("places the blocked finance task into the exchange-preparation phase", () => {
    const phases = derivePhases(data.tasks);
    const exchangePrep = phases.find((phase) => phase.key === "exchange_preparation");
    expect(exchangePrep?.status).toBe("blocked");
  });
});

describe("deriveNextSteps", () => {
  it("surfaces only work unlocked by the current step", () => {
    const nextSteps = deriveNextSteps(data.tasks);
    expect(nextSteps.map((step) => step.taskId)).toEqual(["TASK-010"]);
  });
});

describe("deriveEnquirySummary", () => {
  it("rolls up the enquiry tracker with the latest outstanding topics", () => {
    const summary = deriveEnquirySummary(data.tasks, data.events);
    expect(summary).not.toBeNull();
    expect(summary?.totalRaised).toBe(15);
    expect(summary?.resolved).toBe(13);
    expect(summary?.outstanding).toBe(2);
    expect(summary?.outstandingTopics).toHaveLength(2);
  });
});

describe("deriveBlockers", () => {
  it("explains each outstanding enquiry in plain English", () => {
    const blockers = deriveBlockers(data.events);
    expect(blockers).toHaveLength(2);
    const knotweed = blockers.find((blocker) => /knotweed/i.test(blocker.topic));
    expect(knotweed?.whatItMeans).toMatch(/invasive plant/i);
    const buildingRegs = blockers.find((blocker) => /building reg/i.test(blocker.topic));
    expect(buildingRegs?.whatHappensIfUnresolved).toMatch(/indemnity insurance/i);
  });
});
