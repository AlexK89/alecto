import { formatLongDate, joinWithAnd, pluralise } from "@/lib/format";
import type { EnquirySummary } from "@/domain/types";

/**
 * Deterministic, rule-based plain-English summaries derived entirely from the
 * view model — no LLM call, so the app runs with no API key. This module is the
 * single seam where a live model (e.g. Claude) could later generate the same
 * paragraphs from the same structured inputs; nothing else would change.
 */

export type StatusSummaryInput = {
  propertyAddressLine: string;
  currentPhaseLabel: string;
  overallPercent: number;
  enquiries: EnquirySummary | null;
};

export const buildStatusSummary = (input: StatusSummaryInput): string => {
  const opening = `Your purchase of ${input.propertyAddressLine} is currently in the "${input.currentPhaseLabel}" stage, with ${input.overallPercent}% of the legal work complete.`;

  const enquiries = input.enquiries;
  if (!enquiries || enquiries.outstanding === 0) {
    return `${opening} There are no questions outstanding with the seller's solicitor at the moment.`;
  }

  const remainder = pluralise(enquiries.outstanding, "question remains", "questions remain");
  const topics = joinWithAnd(enquiries.outstandingTopics);
  const enquiryLine = topics
    ? `Your conveyancer has resolved ${enquiries.resolved} of the ${enquiries.totalRaised} questions raised with the seller's solicitor; ${enquiries.outstanding} ${remainder} outstanding — ${topics}.`
    : `Your conveyancer has resolved ${enquiries.resolved} of the ${enquiries.totalRaised} questions raised with the seller's solicitor; ${enquiries.outstanding} ${remainder} outstanding.`;

  const closing = pluralise(
    enquiries.outstanding,
    "Once this is resolved, we can report to your mortgage lender and move towards exchanging contracts.",
    "Once these are resolved, we can report to your mortgage lender and move towards exchanging contracts.",
  );

  return `${opening} ${enquiryLine} ${closing}`;
};

export type TimelineImpactInput = {
  mortgageOfferExpiry: string;
  targetCompletionDate: string;
  hasBuildingRegsBlocker: boolean;
};

export const buildTimelineImpactNote = (input: TimelineImpactInput): string => {
  const fundingLine = `Your mortgage offer is valid until ${formatLongDate(
    input.mortgageOfferExpiry,
  )}, so the current wait doesn't put your funding at risk. We're still working towards a target completion of ${formatLongDate(
    input.targetCompletionDate,
  )}.`;

  if (!input.hasBuildingRegsBlocker) return fundingLine;

  return `${fundingLine} If the loft-conversion building-regulations certificate can't be obtained, indemnity insurance is a straightforward and inexpensive alternative that would let us proceed.`;
};
