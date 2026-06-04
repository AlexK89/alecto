import { MapPin, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatLongDate } from "@/lib/format";
import type { Conveyancer, PropertySummary } from "@/domain/types";

type CaseHeaderProps = {
  property: PropertySummary;
  conveyancer: Conveyancer;
  overallPercent: number;
  currentPhaseLabel: string;
  asOf: string;
};

export const CaseHeader = ({
  property,
  conveyancer,
  overallPercent,
  currentPhaseLabel,
  asOf,
}: CaseHeaderProps) => (
  <header className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
    <p className="text-sm font-medium text-muted-foreground">Your property purchase</p>

    <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <MapPin className="size-5 text-primary" aria-hidden />
          {property.addressLine}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {property.postcode} · {property.description}
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
        <User className="size-4 text-muted-foreground" aria-hidden />
        <div>
          <p className="font-medium">{conveyancer.handler}</p>
          <p className="text-muted-foreground">Your conveyancer · {conveyancer.firm}</p>
        </div>
      </div>
    </div>

    <div className="mt-6">
      <div className="flex items-end justify-between">
        <p className="text-sm font-medium">
          Currently: <span className="text-primary">{currentPhaseLabel}</span>
        </p>
        <p className="text-sm text-muted-foreground tabular-nums">{overallPercent}% complete</p>
      </div>
      <Progress value={overallPercent} className="mt-2" />
      <p className="mt-2 text-xs text-muted-foreground">
        Last updated {formatLongDate(asOf)}
      </p>
    </div>
  </header>
);
