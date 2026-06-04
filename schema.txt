// ============================================================================
// DATA SCHEMA REFERENCE
// ============================================================================
// These types describe the structure of the JSON data files provided with this
// challenge. They are here for reference so you can understand the shape of
// the data at a glance. You are free to use, modify, or ignore them entirely.
// ============================================================================

// --- case.json --------------------------------------------------------------
// Contains case details, property info, parties, and financials.
// The structure is self-explanatory from the JSON. No schema provided here
// as candidates should model the domain however they see fit.

// --- tasks.json -------------------------------------------------------------

export interface TasksFile {
  tasks: Task[];
}

export interface Task {
  id: string;                        // e.g. "TASK-001"
  case_id: string;
  title: string;
  description: string;
  category: string;                  // e.g. "compliance", "finance", "searches", "legal_review", "enquiries", "exchange_prep", "exchange", "completion", "post_completion"
  status: TaskStatus;
  assigned_to: string;
  created_at: string;                // ISO 8601
  started_at: string | null;
  completed_at: string | null;
  dependencies: string[];            // task IDs that must complete before this task can start
  notes: string;
  blocked_reason?: string;           // present when status is "blocked"
  enquiries?: EnquiryTracker;        // present on enquiry-type tasks
}

export type TaskStatus =
  | "not_started"
  | "in_progress"
  | "in_review"                      // awaiting human review of AI-produced work
  | "blocked"
  | "completed";

export interface EnquiryTracker {
  total_raised: number;
  resolved: number;
  outstanding: number;
  last_chased: string;               // ISO 8601
}

// --- events.json ------------------------------------------------------------

export interface EventsFile {
  events: CaseEvent[];
}

export interface CaseEvent {
  id: string;                        // e.g. "EVT-001"
  case_id: string;
  type: EventType;
  timestamp: string;                 // ISO 8601, events are ordered chronologically
  actor: Actor;
  payload: Record<string, unknown>;  // structure varies by event type
  description: string;               // human-readable summary of what happened
}

// The actor indicates who or what triggered the event.
// "system"       - deterministic system automation (e.g. search result arrived, task auto-assigned)
// "ai_assistant" - AI-generated analysis or content (e.g. title review, draft enquiries)
// Any other string is a named person or organisation (e.g. "David Chen", "Blackwood & Associates")
export type Actor = "system" | "ai_assistant" | string;

// Event types observed in the data. This is not an exhaustive list; a real
// system would emit many more.
export type EventType =
  | "case.created"
  | "task.status_changed"
  | "document.requested"
  | "document.received"
  | "compliance.check_completed"
  | "milestone.reached"
  | "searches.ordered"
  | "search.result_received"
  | "enquiry.raised"
  | "enquiry.reply_received"
  | "enquiry.chased"
  | "communication.sent"
  | "communication.received"
  | "internal.note"
  | "ai.analysis_completed"
  | "ai.draft_produced"
  | "ai.draft_reviewed";
