import { type CaseEvent, type EnquiryTracker, type Task, taskStatusSchema } from "@/domain/schema";
import { readNumber, readString } from "@/domain/payload";

/**
 * Time-travel: reconstruct the state of the case as of a point in time by
 * replaying the event log. Because the feed is event-sourced, "what did the case
 * look like on date X" is just a fold over the events up to X — which is exactly
 * what powers the demo stepper.
 *
 * Task status is driven entirely by `task.status_changed` events (the provided
 * data emits one for every real transition), and the enquiry tracker is summed
 * from the enquiry events, so no hand-maintained snapshot is needed.
 */

export const eventsUpTo = (events: CaseEvent[], now: string): CaseEvent[] =>
  events.filter((event) => event.timestamp <= now);

const latestStatusFor = (taskId: string, events: CaseEvent[]): Task["status"] | undefined => {
  const transitions = events.filter(
    (event) =>
      event.type === "task.status_changed" && readString(event.payload, "task_id") === taskId,
  );
  const lastTransition = transitions.at(-1);
  if (!lastTransition) return undefined;

  const parsed = taskStatusSchema.safeParse(readString(lastTransition.payload, "to_status"));
  return parsed.success ? parsed.data : undefined;
};

export const reconstructEnquiryTracker = (events: CaseEvent[]): EnquiryTracker | null => {
  const sumPayload = (type: string, key: string): number =>
    events
      .filter((event) => event.type === type)
      .reduce((total, event) => total + (readNumber(event.payload, key) ?? 0), 0);

  const totalRaised = sumPayload("enquiry.raised", "enquiry_count");
  if (totalRaised === 0) return null;

  const resolved = sumPayload("enquiry.reply_received", "replies_received");
  const chaseTimestamps = events
    .filter((event) => event.type === "enquiry.chased" || event.type === "enquiry.raised")
    .map((event) => event.timestamp)
    .sort();

  return {
    total_raised: totalRaised,
    resolved,
    outstanding: Math.max(0, totalRaised - resolved),
    last_chased: chaseTimestamps.at(-1) ?? "",
  };
};

/** Returns the tasks with their status (and enquiry tracker) as of `events`. */
export const reconstructTasksAsOf = (tasks: Task[], events: CaseEvent[]): Task[] => {
  const enquiryTracker = reconstructEnquiryTracker(events);

  return tasks.map((task) => ({
    ...task,
    status: latestStatusFor(task.id, events) ?? "not_started",
    enquiries: task.enquiries ? (enquiryTracker ?? undefined) : undefined,
  }));
};
