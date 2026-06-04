import { describe, expect, it } from "vitest";
import { assembleCaseView } from "@/domain/index";
import { loadCaseData } from "@/domain/loadCase";
import { tasksFileSchema } from "@/domain/schema";

describe("schema validation", () => {
  it("rejects a malformed feed with a helpful error", () => {
    const result = tasksFileSchema.safeParse({ tasks: [{ id: "TASK-001" }] });
    expect(result.success).toBe(false);
  });

  it("accepts the provided data files", async () => {
    const data = await loadCaseData();
    expect(data.tasks).toHaveLength(17);
    expect(data.events.length).toBeGreaterThan(0);
    expect(data.caseFile.case.id).toBe("CASE-2024-0847");
  });
});

describe("assembleCaseView", () => {
  it("produces a complete, internally consistent view", async () => {
    const data = await loadCaseData();
    const view = assembleCaseView(data, "2024-12-13T09:30:00Z");

    expect(view.currentPhaseLabel).toBe("Enquiries");
    expect(view.overallPercent).toBe(41);
    expect(view.phases).toHaveLength(7);
    expect(view.blockers).toHaveLength(2);
    expect(view.property.addressLine).toContain("Willowmere");
    expect(view.conveyancer.handler).toBe("David Chen");
    expect(view.timeline.length).toBeGreaterThan(0);
  });
});
