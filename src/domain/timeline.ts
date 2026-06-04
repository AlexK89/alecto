import type { CaseEvent } from "@/domain/schema";
import { readString } from "@/domain/payload";
import type { TimelineCategory, TimelineEntry, TimelineIconKey } from "@/domain/types";

/**
 * Turns the raw operational event log into a customer-facing timeline.
 *
 * Two things happen here. First, internal-only noise is filtered out: raw
 * `task.status_changed` churn and `internal.note` file notes never reach the
 * customer. Second, every remaining event type is rewritten into a friendly
 * title + plain-English body, with the actor relabelled (e.g. "system" becomes
 * "Automated update", the seller's solicitor's firm name is kept as-is, and the
 * buyer becomes "You").
 */

export type HumaniseContext = {
  buyerName: string;
  conveyancerName: string;
};

type Humanised = {
  title: string;
  body: string;
  category: TimelineCategory;
  iconKey: TimelineIconKey;
};

type Humaniser = (event: CaseEvent) => Humanised;

const communicationSentTitle = (event: CaseEvent): string => {
  const subject = readString(event.payload, "subject");
  return subject ? `We sent you an update: ${subject}` : "We sent you an update";
};

const EVENT_HUMANISERS: Record<string, Humaniser> = {
  "case.created": (event) => ({
    title: "Your case was opened",
    body: event.description,
    category: "case",
    iconKey: "flag",
  }),
  "document.requested": (event) => ({
    title: "We requested documents",
    body: event.description,
    category: "documents",
    iconKey: "file",
  }),
  "document.received": (event) => ({
    title: "Documents received",
    body: event.description,
    category: "documents",
    iconKey: "file",
  }),
  "compliance.check_completed": (event) => ({
    title: "Identity & anti-money-laundering checks passed",
    body: event.description,
    category: "review",
    iconKey: "shield",
  }),
  "milestone.reached": (event) => ({
    title: readString(event.payload, "label") ?? "Milestone reached",
    body: event.description,
    category: "milestone",
    iconKey: "milestone",
  }),
  "searches.ordered": (event) => ({
    title: "Property searches ordered",
    body: event.description,
    category: "searches",
    iconKey: "search",
  }),
  "search.result_received": (event) => ({
    title: "Search results received",
    body: event.description,
    category: "searches",
    iconKey: "search",
  }),
  "enquiry.raised": (event) => ({
    title: "Enquiries raised with the seller's solicitor",
    body: event.description,
    category: "enquiries",
    iconKey: "message",
  }),
  "enquiry.reply_received": (event) => ({
    title: "Replies received from the seller's solicitor",
    body: event.description,
    category: "enquiries",
    iconKey: "message",
  }),
  "enquiry.chased": (event) => ({
    title: "We chased the seller's solicitor",
    body: event.description,
    category: "enquiries",
    iconKey: "message",
  }),
  "communication.sent": (event) => ({
    title: communicationSentTitle(event),
    body: readString(event.payload, "summary") ?? event.description,
    category: "communication",
    iconKey: "message",
  }),
  "communication.received": (event) => ({
    title: "You got in touch with us",
    body: readString(event.payload, "summary") ?? event.description,
    category: "communication",
    iconKey: "message",
  }),
  "ai.analysis_completed": (event) => ({
    title: "Our system reviewed your title documents",
    body: event.description,
    category: "review",
    iconKey: "sparkles",
  }),
  "ai.draft_produced": (event) => ({
    title: "Draft enquiries prepared for review",
    body: event.description,
    category: "review",
    iconKey: "sparkles",
  }),
  "ai.draft_reviewed": (event) => ({
    title: "Your conveyancer reviewed the draft enquiries",
    body: event.description,
    category: "review",
    iconKey: "sparkles",
  }),
};

const actorLabel = (actor: string, context: HumaniseContext): string => {
  if (actor === "system") return "Automated update";
  if (actor === "ai_assistant") return "Case assistant (AI)";
  if (actor === context.buyerName) return "You";
  if (actor === context.conveyancerName) return `${actor} (your conveyancer)`;
  return actor;
};

export const humaniseEvents = (
  events: CaseEvent[],
  context: HumaniseContext,
): TimelineEntry[] =>
  events
    .filter((event) => EVENT_HUMANISERS[event.type] !== undefined)
    .map((event) => {
      const humanised = EVENT_HUMANISERS[event.type](event);
      return {
        id: event.id,
        timestamp: event.timestamp,
        actorLabel: actorLabel(event.actor, context),
        ...humanised,
      };
    })
    .sort((earlier, later) => later.timestamp.localeCompare(earlier.timestamp));
