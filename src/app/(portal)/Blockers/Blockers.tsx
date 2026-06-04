import { CircleCheck, TriangleAlert } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { OutstandingEnquiry } from "@/app/(portal)/Blockers/OutstandingEnquiry";
import { formatLongDate } from "@/lib/format";
import type { Blocker, EnquirySummary } from "@/domain/types";

type BlockersProps = {
  blockers: Blocker[];
  enquiries: EnquirySummary | null;
};

export const Blockers = ({ blockers, enquiries }: BlockersProps) => {
  const hasOutstanding = blockers.length > 0;

  return (
    <SectionCard
      title="What we're waiting on"
      description={
        enquiries
          ? `${enquiries.resolved} of ${enquiries.totalRaised} questions to the seller's solicitor resolved.`
          : undefined
      }
      icon={
        hasOutstanding ? (
          <TriangleAlert className="size-4 text-amber-600" aria-hidden />
        ) : (
          <CircleCheck className="size-4 text-emerald-600" aria-hidden />
        )
      }
    >
      {hasOutstanding ? (
        <div className="space-y-3">
          {blockers.map((blocker) => (
            <OutstandingEnquiry key={blocker.topic} blocker={blocker} />
          ))}
          {enquiries ? (
            <p className="text-xs text-muted-foreground">
              Last chased on {formatLongDate(enquiries.lastChased)}. We&apos;ll keep pressing
              until both points are resolved.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nothing is outstanding at the moment — there&apos;s no action needed from you right now.
        </p>
      )}
    </SectionCard>
  );
};
