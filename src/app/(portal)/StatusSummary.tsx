import { Sparkles } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";

type StatusSummaryProps = {
  statusSummary: string;
  timelineImpactNote: string;
};

export const StatusSummary = ({ statusSummary, timelineImpactNote }: StatusSummaryProps) => (
  <SectionCard
    title="Where things stand"
    description="A plain-English summary of your case right now."
    icon={<Sparkles className="size-4 text-primary" aria-hidden />}
  >
    <p className="text-sm leading-relaxed">{statusSummary}</p>
    <p className="mt-3 rounded-lg bg-muted/50 p-3 text-sm leading-relaxed text-muted-foreground">
      {timelineImpactNote}
    </p>
  </SectionCard>
);
