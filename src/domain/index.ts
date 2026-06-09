import { eventsUpTo, reconstructTasksAsOf } from "@/domain/asOf";
import { DEFAULT_CHECKPOINT_INDEX, DEMO_CHECKPOINTS } from "@/domain/demo/checkpoints";
import { DEMO_FUTURE_EVENTS } from "@/domain/demo/futureEvents";
import { type CaseData, loadCaseData } from "@/domain/loadCase";
import { buildStatusSummary, buildTimelineImpactNote } from "@/domain/narrative";
import {
  deriveBlockers,
  deriveEnquirySummary,
  deriveNextSteps,
  deriveOverallPercent,
  derivePhases,
} from "@/domain/progress";
import { humaniseEvents } from "@/domain/timeline";
import type { CaseView, KeyDate, MoneyFact, PropertySummary } from "@/domain/types";

// Default "now" for the portal. The data is from late 2024, so using the real
// wall-clock time would make a mid-flight case look wildly overdue; instead we
// anchor to the real present moment in the feed (the "Today" checkpoint). The
// value is injectable so the demo stepper can time-travel and a live feed could
// pass the real current time.
const DEFAULT_NOW = DEMO_CHECKPOINTS[DEFAULT_CHECKPOINT_INDEX].at;

const humanisePropertyType = (propertyType: string): string =>
  propertyType.replace(/_/g, "-");

const buildPropertySummary = (data: CaseData): PropertySummary => {
  const { address, type, tenure, bedrooms } = data.caseFile.property;
  return {
    addressLine: `${address.line_1}, ${address.city}`,
    postcode: address.postcode,
    description: `${bedrooms}-bedroom ${humanisePropertyType(type)} · ${tenure}`,
  };
};

const buildKeyDates = (data: CaseData): KeyDate[] => [
  {
    label: "Estimated exchange",
    value: data.caseFile.case.estimated_exchange_date,
    helpText: "When contracts are expected to be exchanged and the sale becomes legally binding.",
  },
  {
    label: "Target completion",
    value: data.caseFile.case.target_completion_date,
    helpText: "The date you'd expect to collect the keys and move in.",
  },
  {
    label: "Mortgage offer valid until",
    value: data.caseFile.parties.mortgage_lender.offer_expiry,
    helpText: "Your mortgage funding is secured up to this date.",
  },
];

const buildMoneyFacts = (data: CaseData): MoneyFact[] => {
  const { financials } = data.caseFile;
  return [
    {
      label: "Purchase price",
      amount: financials.purchase_price,
      helpText: "The agreed price for the property.",
    },
    {
      label: "Your deposit",
      amount: financials.deposit,
      helpText: "The amount you pay from your own funds.",
    },
    {
      label: "Mortgage",
      amount: financials.mortgage_amount,
      helpText: "The amount your lender is providing.",
    },
    {
      label: "Stamp duty",
      amount: financials.stamp_duty,
      helpText: "Tax payable to HMRC, due within 14 days of completion.",
    },
    {
      label: "Estimated total cost",
      amount: financials.total_estimated_cost,
      helpText: "Purchase price plus fees, tax and disbursements.",
    },
  ];
};

/**
 * Pure assembler: turns loaded data + a reference time into the full view. Task
 * statuses and the enquiry tracker are reconstructed as of `now` by replaying
 * the event log, so the same code renders every point in the journey.
 */
export const assembleCaseView = (data: CaseData, now: string): CaseView => {
  const eventsAsOf = eventsUpTo(data.events, now);
  const tasksAsOf = reconstructTasksAsOf(data.tasks, eventsAsOf);

  const phases = derivePhases(tasksAsOf);
  const enquiries = deriveEnquirySummary(tasksAsOf, eventsAsOf);
  const blockers = deriveBlockers(eventsAsOf);
  const overallPercent = deriveOverallPercent(tasksAsOf);
  const property = buildPropertySummary(data);
  const isComplete = overallPercent >= 100;
  const currentPhaseLabel = phases.find((phase) => phase.isCurrent)?.label ?? "Complete";

  const conveyancer = data.caseFile.parties.buyer_conveyancer;
  const hasBuildingRegsBlocker = blockers.some((blocker) =>
    /building reg|loft/i.test(blocker.topic),
  );

  return {
    asOf: now,
    property,
    conveyancer: {
      firm: conveyancer.firm,
      handler: conveyancer.handler,
      email: conveyancer.email,
      phone: conveyancer.phone,
      caseReference: conveyancer.reference,
    },
    overallPercent,
    currentPhaseLabel,
    statusSummary: buildStatusSummary({
      propertyAddressLine: data.caseFile.property.address.line_1,
      currentPhaseLabel,
      overallPercent,
      enquiries,
    }),
    timelineImpactNote: buildTimelineImpactNote({
      mortgageOfferExpiry: data.caseFile.parties.mortgage_lender.offer_expiry,
      targetCompletionDate: data.caseFile.case.target_completion_date,
      hasBuildingRegsBlocker,
      isComplete,
    }),
    phases,
    nextSteps: deriveNextSteps(tasksAsOf),
    blockers,
    enquiries,
    keyDates: buildKeyDates(data),
    moneyFacts: buildMoneyFacts(data),
    timeline: humaniseEvents(eventsAsOf, {
      buyerName: data.caseFile.parties.buyer.name,
      conveyancerName: conveyancer.handler,
    }),
  };
};

/**
 * Loads the case feed from disk, appends the mocked future events (for the demo
 * stepper), and assembles the customer view as of `now`.
 */
export const buildCaseView = async (now: string = DEFAULT_NOW): Promise<CaseView> => {
  const data = await loadCaseData();
  const events = [...data.events, ...DEMO_FUTURE_EVENTS].sort((earlier, later) =>
    earlier.timestamp.localeCompare(later.timestamp),
  );
  return assembleCaseView({ ...data, events }, now);
};
