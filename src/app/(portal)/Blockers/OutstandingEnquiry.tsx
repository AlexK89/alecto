import { ArrowRight } from "lucide-react";
import type { Blocker } from "@/domain/types";

type OutstandingEnquiryProps = {
  blocker: Blocker;
};

export const OutstandingEnquiry = ({ blocker }: OutstandingEnquiryProps) => (
  <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4">
    <h3 className="text-sm font-medium text-amber-900">{blocker.topic}</h3>
    <p className="mt-1 text-sm text-amber-900/80">{blocker.whatItMeans}</p>
    <p className="mt-2 flex items-start gap-1.5 text-sm text-amber-900/80">
      <ArrowRight className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>{blocker.whatHappensIfUnresolved}</span>
    </p>
  </div>
);
