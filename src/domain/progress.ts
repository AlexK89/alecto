import type { CaseEvent, Task } from "@/domain/schema";
import { PHASE_DEFINITIONS, phaseKeyForTask } from "@/domain/phases";
import { readStringArray } from "@/domain/payload";
import type {
  Blocker,
  EnquirySummary,
  NextStep,
  PhaseProgress,
  PhaseStatus,
} from "@/domain/types";

const isCompleted = (task: Task): boolean => task.status === "completed";

const isActive = (task: Task): boolean =>
  task.status === "in_progress" || task.status === "in_review" || task.status === "blocked";

export const deriveOverallPercent = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completedCount = tasks.filter(isCompleted).length;
  return Math.round((completedCount / tasks.length) * 100);
};

const derivePhaseStatus = (phaseTasks: Task[]): PhaseStatus => {
  if (phaseTasks.length === 0) return "upcoming";
  if (phaseTasks.every(isCompleted)) return "completed";
  if (phaseTasks.some((task) => task.status === "blocked")) return "blocked";
  const hasStartedWork =
    phaseTasks.some((task) => task.status === "in_progress" || task.status === "in_review") ||
    phaseTasks.some(isCompleted);
  return hasStartedWork ? "in_progress" : "upcoming";
};

export const derivePhases = (tasks: Task[]): PhaseProgress[] => {
  const phasesWithStatus = PHASE_DEFINITIONS.map((definition) => {
    const phaseTasks = tasks.filter((task) => phaseKeyForTask(task) === definition.key);
    return { definition, phaseTasks, status: derivePhaseStatus(phaseTasks) };
  });

  const currentPhaseKey = phasesWithStatus.find((phase) => phase.status !== "completed")
    ?.definition.key;

  return phasesWithStatus.map(({ definition, phaseTasks, status }) => ({
    key: definition.key,
    label: definition.label,
    plainSummary: definition.plainSummary,
    status,
    isCurrent: definition.key === currentPhaseKey,
    completedTaskCount: phaseTasks.filter(isCompleted).length,
    totalTaskCount: phaseTasks.length,
  }));
};

/**
 * The next things that will happen: tasks not yet started whose dependencies are
 * all either finished or currently underway — i.e. the work that unlocks as soon
 * as the current step completes.
 */
export const deriveNextSteps = (tasks: Task[]): NextStep[] => {
  const taskById = new Map(tasks.map((task) => [task.id, task]));

  return tasks
    .filter((task) => task.status === "not_started")
    .filter((task) =>
      task.dependencies.every((dependencyId) => {
        const dependency = taskById.get(dependencyId);
        return dependency === undefined || isCompleted(dependency) || isActive(dependency);
      }),
    )
    .map((task) => ({
      taskId: task.id,
      title: task.title,
      plainDescription: task.description,
    }));
};

// Outstanding-enquiry explanations: plain-English meaning plus what happens if
// the point can't be resolved. Matched against the free-text topics in the feed.
const explainEnquiryTopic = (topic: string): Blocker => {
  const lowerTopic = topic.toLowerCase();

  if (lowerTopic.includes("knotweed")) {
    return {
      topic,
      whatItMeans:
        "Japanese knotweed is an invasive plant that can affect a property's value and a lender's willingness to lend. We've asked the seller for the professional management plan covering the affected neighbouring land.",
      whatHappensIfUnresolved:
        "Your lender may want to see a treatment plan before releasing funds, so we won't recommend committing until this is satisfactory.",
    };
  }

  if (lowerTopic.includes("building reg") || lowerTopic.includes("loft")) {
    return {
      topic,
      whatItMeans:
        "The loft was converted in 2019. We've asked for the building-regulations completion certificate that confirms the work met legal safety standards.",
      whatHappensIfUnresolved:
        "If the certificate can't be produced, indemnity insurance is a common, inexpensive alternative that protects you — we'll talk you through it.",
    };
  }

  return {
    topic,
    whatItMeans: "We've asked the seller's solicitor for more information on this point.",
    whatHappensIfUnresolved:
      "We won't recommend exchanging contracts until we're satisfied with their answer.",
  };
};

const latestStillOutstandingTopics = (events: CaseEvent[]): string[] => {
  const replyEvents = events.filter((event) => event.type === "enquiry.reply_received");
  const lastReply = replyEvents.at(-1);
  return lastReply ? readStringArray(lastReply.payload, "still_outstanding") : [];
};

export const deriveBlockers = (events: CaseEvent[]): Blocker[] =>
  latestStillOutstandingTopics(events).map(explainEnquiryTopic);

export const deriveEnquirySummary = (
  tasks: Task[],
  events: CaseEvent[],
): EnquirySummary | null => {
  const enquiryTask = tasks.find((task) => task.enquiries !== undefined);
  if (!enquiryTask?.enquiries) return null;

  const tracker = enquiryTask.enquiries;
  return {
    totalRaised: tracker.total_raised,
    resolved: tracker.resolved,
    outstanding: tracker.outstanding,
    outstandingTopics: latestStillOutstandingTopics(events),
    lastChased: tracker.last_chased,
  };
};
