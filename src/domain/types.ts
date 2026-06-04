import type { TaskStatus } from "@/domain/schema";

/**
 * Customer-facing view model. These types describe what the buyer sees, not how
 * the firm operates internally. The domain layer's whole job is to turn the raw
 * tasks/events into this shape; the UI renders it without further logic.
 */

export type PhaseKey =
  | "getting_started"
  | "searches_and_legal"
  | "enquiries"
  | "exchange_preparation"
  | "exchange"
  | "completion"
  | "after_completion";

export type PhaseStatus = "completed" | "in_progress" | "blocked" | "upcoming";

export type PhaseProgress = {
  key: PhaseKey;
  label: string;
  plainSummary: string;
  status: PhaseStatus;
  isCurrent: boolean;
  completedTaskCount: number;
  totalTaskCount: number;
};

export type NextStep = {
  taskId: string;
  title: string;
  plainDescription: string;
};

export type Blocker = {
  topic: string;
  whatItMeans: string;
  whatHappensIfUnresolved: string;
};

export type EnquirySummary = {
  totalRaised: number;
  resolved: number;
  outstanding: number;
  outstandingTopics: string[];
  lastChased: string;
};

export type TimelineCategory =
  | "milestone"
  | "documents"
  | "searches"
  | "enquiries"
  | "communication"
  | "review"
  | "case";

export type TimelineIconKey =
  | "flag"
  | "file"
  | "search"
  | "message"
  | "sparkles"
  | "shield"
  | "milestone";

export type TimelineEntry = {
  id: string;
  timestamp: string;
  title: string;
  body: string;
  category: TimelineCategory;
  iconKey: TimelineIconKey;
  actorLabel: string;
};

export type KeyDate = {
  label: string;
  value: string;
  helpText: string;
};

export type MoneyFact = {
  label: string;
  amount: number;
  helpText: string;
};

export type Conveyancer = {
  firm: string;
  handler: string;
  email: string;
  phone: string;
  caseReference: string;
};

export type PropertySummary = {
  addressLine: string;
  postcode: string;
  description: string;
};

/** The complete, ready-to-render view of a case. */
export type CaseView = {
  asOf: string;
  property: PropertySummary;
  conveyancer: Conveyancer;
  overallPercent: number;
  currentPhaseLabel: string;
  statusSummary: string;
  timelineImpactNote: string;
  phases: PhaseProgress[];
  nextSteps: NextStep[];
  blockers: Blocker[];
  enquiries: EnquirySummary | null;
  keyDates: KeyDate[];
  moneyFacts: MoneyFact[];
  timeline: TimelineEntry[];
};

/** Status labels shown to the customer (never the raw enum values). */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  not_started: "Not started yet",
  in_progress: "In progress",
  in_review: "Being reviewed",
  blocked: "Waiting on someone else",
  completed: "Done",
};
