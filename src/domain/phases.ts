import type { Task } from "@/domain/schema";
import type { PhaseKey } from "@/domain/types";

/**
 * The customer journey.
 *
 * The raw feed organises work by operational `category` (compliance, finance,
 * searches, ...). Those categories don't map cleanly onto what a buyer cares
 * about — "finance", for example, is spread across the whole transaction (the
 * mortgage offer is secured early, the funds are drawn down at the very end).
 *
 * So we define an explicit, ordered journey of phases that mirror the milestones
 * a customer actually experiences, and assign each task to a phase. Assignment
 * is category-driven by default (so new tasks slot in automatically) with a
 * small set of task-level overrides for the finance tasks that belong to a
 * specific stage rather than to "finance" as a whole.
 */

export type PhaseDefinition = {
  key: PhaseKey;
  label: string;
  plainSummary: string;
  milestoneKeys: string[];
};

export const PHASE_DEFINITIONS: readonly PhaseDefinition[] = [
  {
    key: "getting_started",
    label: "Getting started",
    plainSummary:
      "We confirm your identity, complete anti-money-laundering checks, and get your mortgage offer in place.",
    milestoneKeys: ["onboarding_complete", "mortgage_offer_received"],
  },
  {
    key: "searches_and_legal",
    label: "Searches & legal checks",
    plainSummary:
      "We order searches on the property and review the legal title and contract pack for anything that could affect you.",
    milestoneKeys: ["all_searches_complete"],
  },
  {
    key: "enquiries",
    label: "Enquiries",
    plainSummary:
      "We raise questions with the seller's solicitor about anything unclear, then chase the replies until every point is resolved.",
    milestoneKeys: ["enquiries_raised"],
  },
  {
    key: "exchange_preparation",
    label: "Preparing to exchange",
    plainSummary:
      "We report to your mortgage lender, send you the contract to approve and sign, and collect your deposit.",
    milestoneKeys: [],
  },
  {
    key: "exchange",
    label: "Exchange of contracts",
    plainSummary:
      "Both sides exchange signed contracts. The sale becomes legally binding and a completion date is fixed.",
    milestoneKeys: [],
  },
  {
    key: "completion",
    label: "Completion",
    plainSummary:
      "We draw down the mortgage, send the money to the seller's solicitor, and you collect the keys.",
    milestoneKeys: [],
  },
  {
    key: "after_completion",
    label: "After completion",
    plainSummary:
      "We pay your stamp duty to HMRC and register you as the new owner with the Land Registry.",
    milestoneKeys: [],
  },
];

const PHASE_BY_CATEGORY: Record<string, PhaseKey> = {
  compliance: "getting_started",
  searches: "searches_and_legal",
  legal_review: "searches_and_legal",
  enquiries: "enquiries",
  finance: "exchange_preparation",
  exchange_prep: "exchange_preparation",
  exchange: "exchange",
  completion: "completion",
  post_completion: "after_completion",
};

// Finance tasks that belong to a specific journey stage rather than the default
// "exchange_preparation" bucket its category maps to.
const PHASE_BY_TASK_ID: Record<string, PhaseKey> = {
  "TASK-002": "getting_started", // securing the mortgage offer
  "TASK-013": "completion", // drawing down mortgage funds
  "TASK-014": "completion", // completion statement
};

export const phaseKeyForTask = (task: Task): PhaseKey =>
  PHASE_BY_TASK_ID[task.id] ?? PHASE_BY_CATEGORY[task.category] ?? "getting_started";
