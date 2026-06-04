import { buildCaseView } from "@/domain";
import { Blockers } from "@/app/(portal)/Blockers/Blockers";
import { CaseHeader } from "@/app/(portal)/CaseHeader";
import { KeyFacts } from "@/app/(portal)/KeyFacts";
import { NextSteps } from "@/app/(portal)/NextSteps";
import { ProgressJourney } from "@/app/(portal)/ProgressJourney/ProgressJourney";
import { StatusSummary } from "@/app/(portal)/StatusSummary";
import { Timeline } from "@/app/(portal)/Timeline/Timeline";

const CasePortalPage = async () => {
  const view = await buildCaseView();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <CaseHeader
        property={view.property}
        conveyancer={view.conveyancer}
        overallPercent={view.overallPercent}
        currentPhaseLabel={view.currentPhaseLabel}
        asOf={view.asOf}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <StatusSummary
            statusSummary={view.statusSummary}
            timelineImpactNote={view.timelineImpactNote}
          />
          <Blockers blockers={view.blockers} enquiries={view.enquiries} />
          <NextSteps nextSteps={view.nextSteps} />
          <KeyFacts keyDates={view.keyDates} moneyFacts={view.moneyFacts} />
          <Timeline entries={view.timeline} />
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <ProgressJourney phases={view.phases} />
        </aside>
      </div>

      <footer className="mt-10 text-center text-xs text-muted-foreground">
        Case reference {view.conveyancer.caseReference} · Questions? Contact {view.conveyancer.handler} at{" "}
        {view.conveyancer.email}
      </footer>
    </main>
  );
};

export default CasePortalPage;
