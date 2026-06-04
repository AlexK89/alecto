import {
  FileText,
  Flag,
  MessageSquare,
  Milestone,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";
import { formatLongDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TimelineEntry as TimelineEntryModel, TimelineIconKey } from "@/domain/types";

const ICONS: Record<TimelineIconKey, ComponentType<{ className?: string }>> = {
  flag: Flag,
  file: FileText,
  search: Search,
  message: MessageSquare,
  sparkles: Sparkles,
  shield: ShieldCheck,
  milestone: Milestone,
};

type TimelineEntryProps = {
  entry: TimelineEntryModel;
  isLast: boolean;
};

export const TimelineEntry = ({ entry, isLast }: TimelineEntryProps) => {
  const Icon = ICONS[entry.iconKey];
  const isMilestone = entry.category === "milestone";

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast ? (
        <span className="absolute left-4 top-9 -bottom-1 w-px bg-border" aria-hidden />
      ) : null}

      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border",
          isMilestone ? "border-primary/30 bg-primary/10 text-primary" : "bg-card text-muted-foreground",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>

      <div className="flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <h3 className="text-sm font-medium">{entry.title}</h3>
          <time className="text-xs text-muted-foreground" dateTime={entry.timestamp}>
            {formatLongDate(entry.timestamp)}
          </time>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{entry.body}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">{entry.actorLabel}</p>
      </div>
    </li>
  );
};
