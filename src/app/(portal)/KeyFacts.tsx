import { CalendarDays, Wallet } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { formatLongDate, formatPounds } from "@/lib/format";
import type { KeyDate, MoneyFact } from "@/domain/types";

type KeyFactsProps = {
  keyDates: KeyDate[];
  moneyFacts: MoneyFact[];
};

export const KeyFacts = ({ keyDates, moneyFacts }: KeyFactsProps) => (
  <div className="grid gap-4 sm:grid-cols-2">
    <SectionCard
      title="Key dates"
      icon={<CalendarDays className="size-4 text-primary" aria-hidden />}
    >
      <dl className="space-y-3">
        {keyDates.map((keyDate) => (
          <div key={keyDate.label}>
            <dt className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-muted-foreground">{keyDate.label}</span>
              <span className="text-sm font-medium tabular-nums">
                {formatLongDate(keyDate.value)}
              </span>
            </dt>
            <dd className="mt-0.5 text-xs text-muted-foreground">{keyDate.helpText}</dd>
          </div>
        ))}
      </dl>
    </SectionCard>

    <SectionCard
      title="The numbers"
      icon={<Wallet className="size-4 text-primary" aria-hidden />}
    >
      <dl className="space-y-3">
        {moneyFacts.map((moneyFact) => (
          <div key={moneyFact.label}>
            <dt className="flex items-baseline justify-between gap-2">
              <span className="text-sm text-muted-foreground">{moneyFact.label}</span>
              <span className="text-sm font-medium tabular-nums">
                {formatPounds(moneyFact.amount)}
              </span>
            </dt>
            <dd className="mt-0.5 text-xs text-muted-foreground">{moneyFact.helpText}</dd>
          </div>
        ))}
      </dl>
    </SectionCard>
  </div>
);
