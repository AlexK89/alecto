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

/**
 * The data is from late 2024. Using the real wall-clock "now" would make a
 * mid-flight case look wildly overdue, so by default we anchor "now" to the most
 * recent event in the feed — a realistic present moment for the demo. The value
 * is injectable so date logic stays testable and a live feed could pass the real
 * current time instead.
 */
const latestEventTimestamp = (data: CaseData): string => {
  const timestamps = data.events.map((event) => event.timestamp).sort();
  return timestamps.at(-1) ?? data.caseFile.case.created_at;
};

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

/** Pure assembler: turns loaded data + a reference time into the full view. */
export const assembleCaseView = (data: CaseData, now: string): CaseView => {
  const phases = derivePhases(data.tasks);
  const enquiries = deriveEnquirySummary(data.tasks, data.events);
  const blockers = deriveBlockers(data.events);
  const overallPercent = deriveOverallPercent(data.tasks);
  const property = buildPropertySummary(data);
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
    }),
    phases,
    nextSteps: deriveNextSteps(data.tasks),
    blockers,
    enquiries,
    keyDates: buildKeyDates(data),
    moneyFacts: buildMoneyFacts(data),
    timeline: humaniseEvents(data.events, {
      buyerName: data.caseFile.parties.buyer.name,
      conveyancerName: conveyancer.handler,
    }),
  };
};

/** Loads the case feed from disk and assembles the customer view. */
export const buildCaseView = async (): Promise<CaseView> => {
  const data = await loadCaseData();
  return assembleCaseView(data, latestEventTimestamp(data));
};
