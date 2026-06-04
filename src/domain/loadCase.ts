import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  type CaseEvent,
  type CaseFile,
  type Task,
  caseFileSchema,
  eventsFileSchema,
  tasksFileSchema,
} from "@/domain/schema";

/** The validated raw data for a single case, loaded from the JSON feed. */
export type CaseData = {
  caseFile: CaseFile;
  tasks: Task[];
  events: CaseEvent[];
};

const DATA_DIRECTORY = join(process.cwd(), "data");

const readJsonFile = async (fileName: string): Promise<unknown> => {
  const fileContents = await readFile(join(DATA_DIRECTORY, fileName), "utf8");
  return JSON.parse(fileContents);
};

/**
 * Reads and validates the case feed from `data/`. In a real system this would
 * be an API/event-bus/database call; the only thing that would change is the
 * body of this function — the validated shape it returns stays the same.
 */
export const loadCaseData = async (): Promise<CaseData> => {
  const [rawCase, rawTasks, rawEvents] = await Promise.all([
    readJsonFile("case.json"),
    readJsonFile("tasks.json"),
    readJsonFile("events.json"),
  ]);

  return {
    caseFile: caseFileSchema.parse(rawCase),
    tasks: tasksFileSchema.parse(rawTasks).tasks,
    events: eventsFileSchema.parse(rawEvents).events,
  };
};
