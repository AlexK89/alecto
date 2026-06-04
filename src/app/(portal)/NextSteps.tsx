import { ListChecks } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import type { NextStep } from "@/domain/types";

type NextStepsProps = {
  nextSteps: NextStep[];
};

export const NextSteps = ({ nextSteps }: NextStepsProps) => (
  <SectionCard
    title="What happens next"
    description="The steps that unlock once the current work is finished."
    icon={<ListChecks className="size-4 text-primary" aria-hidden />}
  >
    {nextSteps.length > 0 ? (
      <ol className="space-y-3">
        {nextSteps.map((step, index) => (
          <li key={step.taskId} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary tabular-nums">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-medium">{step.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{step.plainDescription}</p>
            </div>
          </li>
        ))}
      </ol>
    ) : (
      <p className="text-sm text-muted-foreground">
        Nothing new starts until the current step is complete.
      </p>
    )}
  </SectionCard>
);
