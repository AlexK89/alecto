import { describe, expect, it } from "vitest";
import { loadCaseData } from "@/domain/loadCase";
import { humaniseEvents } from "@/domain/timeline";

const data = await loadCaseData();
const context = { buyerName: "Sarah Mitchell", conveyancerName: "David Chen" };
const timeline = humaniseEvents(data.events, context);

describe("humaniseEvents", () => {
  it("drops internal-only event types from the customer view", () => {
    const sourceIds = new Set(timeline.map((entry) => entry.id));
    const internalNote = data.events.find((event) => event.type === "internal.note");
    const statusChange = data.events.find((event) => event.type === "task.status_changed");
    expect(internalNote && sourceIds.has(internalNote.id)).toBeFalsy();
    expect(statusChange && sourceIds.has(statusChange.id)).toBeFalsy();
  });

  it("orders entries newest-first", () => {
    const timestamps = timeline.map((entry) => entry.timestamp);
    const sortedDescending = [...timestamps].sort((a, b) => b.localeCompare(a));
    expect(timestamps).toEqual(sortedDescending);
  });

  it("relabels the buyer as 'You' and the system as a friendly label", () => {
    const buyerEntry = timeline.find((entry) => entry.actorLabel === "You");
    expect(buyerEntry).toBeDefined();
    const systemEntry = timeline.find((entry) => entry.actorLabel === "Automated update");
    expect(systemEntry).toBeDefined();
  });

  it("gives every visible event a customer-friendly title and body", () => {
    for (const entry of timeline) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.body.length).toBeGreaterThan(0);
    }
  });
});
