import { z } from "zod";

/**
 * Runtime schemas for the three provided JSON files. The JSON is treated as
 * untrusted input at the system boundary: every file is validated on load so a
 * malformed feed fails loudly with a clear error instead of surfacing as a
 * confusing `undefined` deep inside the UI.
 *
 * Domain types are inferred from these schemas (`z.infer`) so the schema stays
 * the single source of truth for the raw data shape.
 */

const isoDateTime = z.string().datetime({ offset: true });

// --- tasks.json -------------------------------------------------------------

export const taskStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "in_review",
  "blocked",
  "completed",
]);

export const enquiryTrackerSchema = z.object({
  total_raised: z.number(),
  resolved: z.number(),
  outstanding: z.number(),
  last_chased: isoDateTime,
});

export const taskSchema = z.object({
  id: z.string(),
  case_id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  status: taskStatusSchema,
  assigned_to: z.string(),
  created_at: isoDateTime,
  started_at: isoDateTime.nullable(),
  completed_at: isoDateTime.nullable(),
  dependencies: z.array(z.string()),
  notes: z.string(),
  blocked_reason: z.string().optional(),
  enquiries: enquiryTrackerSchema.optional(),
});

export const tasksFileSchema = z.object({ tasks: z.array(taskSchema) });

// --- events.json ------------------------------------------------------------

export const caseEventSchema = z.object({
  id: z.string(),
  case_id: z.string(),
  type: z.string(),
  timestamp: isoDateTime,
  actor: z.string(),
  payload: z.record(z.unknown()),
  description: z.string(),
});

export const eventsFileSchema = z.object({ events: z.array(caseEventSchema) });

// --- case.json --------------------------------------------------------------
// Only the fields the portal reads are modelled; unknown keys are ignored.

export const addressSchema = z.object({
  line_1: z.string(),
  line_2: z.string(),
  city: z.string(),
  county: z.string(),
  postcode: z.string(),
});

export const caseFileSchema = z.object({
  case: z.object({
    id: z.string(),
    reference: z.string(),
    type: z.string(),
    status: z.string(),
    created_at: isoDateTime,
    target_completion_date: isoDateTime,
    estimated_exchange_date: isoDateTime,
    current_stage: z.string(),
    priority: z.string(),
  }),
  property: z.object({
    address: addressSchema,
    type: z.string(),
    tenure: z.string(),
    bedrooms: z.number(),
    price: z.number(),
    epc_rating: z.string(),
    council_tax_band: z.string(),
    title_number: z.string(),
  }),
  parties: z.object({
    buyer: z.object({
      name: z.string(),
      email: z.string(),
      phone: z.string(),
    }),
    seller: z.object({
      name: z.string(),
      solicitor: z.object({ firm: z.string(), contact: z.string() }),
    }),
    buyer_conveyancer: z.object({
      firm: z.string(),
      handler: z.string(),
      email: z.string(),
      phone: z.string(),
      reference: z.string(),
    }),
    mortgage_lender: z.object({
      name: z.string(),
      offer_amount: z.number(),
      offer_expiry: isoDateTime,
    }),
    estate_agent: z.object({ firm: z.string(), contact: z.string() }),
  }),
  financials: z.object({
    purchase_price: z.number(),
    mortgage_amount: z.number(),
    deposit: z.number(),
    stamp_duty: z.number(),
    legal_fees_estimate: z.number(),
    search_fees_estimate: z.number(),
    land_registry_fee: z.number(),
    total_estimated_cost: z.number(),
  }),
});

// --- inferred domain types --------------------------------------------------

export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type EnquiryTracker = z.infer<typeof enquiryTrackerSchema>;
export type Task = z.infer<typeof taskSchema>;
export type CaseEvent = z.infer<typeof caseEventSchema>;
export type CaseFile = z.infer<typeof caseFileSchema>;
