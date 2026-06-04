import { CircleAlert, CircleCheck, CircleDashed, CircleDot } from "lucide-react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PhaseProgress, PhaseStatus } from "@/domain/types";

type StatusPresentation = {
  Icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  label: string;
};

const STATUS_PRESENTATION: Record<PhaseStatus, StatusPresentation> = {
  completed: { Icon: CircleCheck, iconClassName: "text-emerald-600", label: "Done" },
  in_progress: { Icon: CircleDot, iconClassName: "text-primary", label: "In progress" },
  blocked: { Icon: CircleAlert, iconClassName: "text-amber-600", label: "Waiting" },
  upcoming: { Icon: CircleDashed, iconClassName: "text-muted-foreground/50", label: "Upcoming" },
};

type PhaseStepProps = {
  phase: PhaseProgress;
  isLast: boolean;
};

export const PhaseStep = ({ phase, isLast }: PhaseStepProps) => {
  const presentation = STATUS_PRESENTATION[phase.status];

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast ? (
        <span
          className="absolute left-[11px] top-7 -bottom-1 w-px bg-border"
          aria-hidden
        />
      ) : null}

      <presentation.Icon className={cn("size-6 shrink-0", presentation.iconClassName)} aria-hidden />

      <div className={cn("flex-1", phase.isCurrent && "rounded-lg bg-muted/50 -mt-1 p-3")}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-medium">{phase.label}</h3>
          {phase.isCurrent ? <Badge>Current step</Badge> : null}
          {phase.totalTaskCount > 0 ? (
            <span className="text-xs text-muted-foreground tabular-nums">
              {phase.completedTaskCount}/{phase.totalTaskCount} tasks · {presentation.label}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{phase.plainSummary}</p>
      </div>
    </li>
  );
};
