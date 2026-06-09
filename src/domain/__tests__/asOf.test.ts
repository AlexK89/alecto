import { describe, expect, it } from "vitest";
import { assembleCaseView } from "@/domain/index";
import { reconstructEnquiryTracker, reconstructTasksAsOf } from "@/domain/asOf";
import { DEMO_FUTURE_EVENTS } from "@/domain/demo/futureEvents";
import { loadCaseData } from "@/domain/loadCase";

const data = await loadCaseData();
const allEvents = [...data.events, ...DEMO_FUTURE_EVENTS].sort((a, b) =>
  a.timestamp.localeCompare(b.timestamp),
);
const fullData = { ...data, events: allEvents };

const eventsUpTo = (now: string) => allEvents.filter((event) => event.timestamp <= now);

describe("reconstructTasksAsOf", () => {
  it("reproduces the real snapshot at 'today'", () => {
    const tasks = reconstructTasksAsOf(data.tasks, eventsUpTo("2024-12-13T09:30:00Z"));
    const statusById = Object.fromEntries(tasks.map((task) => [task.id, task.status]));
    expect(statusById["TASK-007"]).toBe("completed");
    expect(statusById["TASK-008"]).toBe("in_progress");
    expect(statusById["TASK-009"]).toBe("blocked");
    expect(statusById["TASK-010"]).toBe("not_started");
  });

  it("shows no work started at the very beginning", () => {
    const tasks = reconstructTasksAsOf(data.tasks, eventsUpTo("2024-09-12T09:15:00Z"));
    expect(tasks.every((task) => task.status === "not_started")).toBe(true);
  });

  it("shows everything completed at the end of the projected journey", () => {
    const tasks = reconstructTasksAsOf(data.tasks, eventsUpTo("2025-01-20T12:00:00Z"));
    expect(tasks.every((task) => task.status === "completed")).toBe(true);
  });
});

describe("reconstructEnquiryTracker", () => {
  it("is null before any enquiries are raised", () => {
    expect(reconstructEnquiryTracker(eventsUpTo("2024-09-14T00:00:00Z"))).toBeNull();
  });

  it("nets off replies against the total raised", () => {
    const tracker = reconstructEnquiryTracker(eventsUpTo("2024-12-13T09:30:00Z"));
    expect(tracker).toMatchObject({ total_raised: 15, resolved: 13, outstanding: 2 });
  });

  it("reaches zero outstanding once the final replies arrive", () => {
    const tracker = reconstructEnquiryTracker(eventsUpTo("2024-12-16T12:00:00Z"));
    expect(tracker?.outstanding).toBe(0);
  });
});

describe("assembleCaseView progression", () => {
  it("ends fully complete at the final checkpoint", () => {
    const view = assembleCaseView(fullData, "2025-01-20T12:00:00Z");
    expect(view.overallPercent).toBe(100);
    expect(view.blockers).toHaveLength(0);
    expect(view.currentPhaseLabel).toBe("Complete");
    expect(view.statusSummary).toMatch(/Congratulations/);
  });

  it("clears the blockers once enquiries are resolved", () => {
    const view = assembleCaseView(fullData, "2024-12-16T12:00:00Z");
    expect(view.blockers).toHaveLength(0);
    expect(view.enquiries?.outstanding).toBe(0);
  });
});
