"use client";

import { History } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionCard } from "@/components/SectionCard";
import { TimelineEntry } from "@/app/(portal)/Timeline/TimelineEntry";
import { cn } from "@/lib/utils";
import type { TimelineCategory, TimelineEntry as TimelineEntryModel } from "@/domain/types";

const CATEGORY_LABELS: Record<TimelineCategory, string> = {
  milestone: "Milestones",
  documents: "Documents",
  searches: "Searches",
  enquiries: "Enquiries",
  communication: "Messages",
  review: "Reviews",
  case: "Case",
};

type CategoryFilter = TimelineCategory | "all";

type TimelineProps = {
  entries: TimelineEntryModel[];
};

export const Timeline = ({ entries }: TimelineProps) => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");

  const availableCategories = useMemo(
    () => [...new Set(entries.map((entry) => entry.category))],
    [entries],
  );

  const visibleEntries =
    activeFilter === "all"
      ? entries
      : entries.filter((entry) => entry.category === activeFilter);

  const filters: CategoryFilter[] = ["all", ...availableCategories];

  return (
    <SectionCard
      title="Everything that's happened"
      description="A plain-English history of your case, newest first."
      icon={<History className="size-4 text-primary" aria-hidden />}
    >
      <div className="mb-4 flex flex-wrap gap-1.5">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activeFilter === filter
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            {filter === "all" ? "All" : CATEGORY_LABELS[filter]}
          </button>
        ))}
      </div>

      <ol>
        {visibleEntries.map((entry, index) => (
          <TimelineEntry
            key={entry.id}
            entry={entry}
            isLast={index === visibleEntries.length - 1}
          />
        ))}
      </ol>
    </SectionCard>
  );
};
