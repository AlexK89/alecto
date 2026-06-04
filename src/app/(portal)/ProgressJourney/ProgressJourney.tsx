import { Milestone } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { PhaseStep } from "@/app/(portal)/ProgressJourney/PhaseStep";
import type { PhaseProgress } from "@/domain/types";

type ProgressJourneyProps = {
  phases: PhaseProgress[];
};

export const ProgressJourney = ({ phases }: ProgressJourneyProps) => (
  <SectionCard
    title="Your journey"
    description="The full path from instruction to owning your new home."
    icon={<Milestone className="size-4 text-primary" aria-hidden />}
  >
    <ol>
      {phases.map((phase, index) => (
        <PhaseStep key={phase.key} phase={phase} isLast={index === phases.length - 1} />
      ))}
    </ol>
  </SectionCard>
);
