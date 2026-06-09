/**
 * Ordered points in the case's life used by the demo stepper. Each maps to a
 * timestamp; the view is reconstructed as of that moment. Everything up to and
 * including "Today" is real data; later checkpoints replay the mocked future
 * events. The default landing point is the real present (`isDefault`).
 */

export type DemoCheckpoint = {
  label: string;
  at: string;
  isProjected: boolean;
  isDefault?: boolean;
};

export const DEMO_CHECKPOINTS: readonly DemoCheckpoint[] = [
  { label: "Case opened", at: "2024-09-12T09:15:00Z", isProjected: false },
  { label: "Onboarding complete", at: "2024-09-14T14:30:00Z", isProjected: false },
  { label: "Mortgage offer & searches", at: "2024-10-03T12:00:00Z", isProjected: false },
  { label: "Searches & title done", at: "2024-10-18T11:00:00Z", isProjected: false },
  { label: "Enquiries — first replies", at: "2024-10-28T15:00:00Z", isProjected: false },
  { label: "Today", at: "2024-12-13T09:30:00Z", isProjected: false, isDefault: true },
  { label: "Enquiries resolved", at: "2024-12-16T12:00:00Z", isProjected: true },
  { label: "Contract signed", at: "2024-12-23T16:00:00Z", isProjected: true },
  { label: "Ready to exchange", at: "2025-01-03T12:30:00Z", isProjected: true },
  { label: "Contracts exchanged", at: "2025-01-06T16:00:00Z", isProjected: true },
  { label: "Completed", at: "2025-01-10T12:30:00Z", isProjected: true },
  { label: "Registered", at: "2025-01-20T12:00:00Z", isProjected: true },
];

export const DEFAULT_CHECKPOINT_INDEX = DEMO_CHECKPOINTS.findIndex(
  (checkpoint) => checkpoint.isDefault,
);

export const clampCheckpointIndex = (rawIndex: number): number => {
  if (Number.isNaN(rawIndex)) return DEFAULT_CHECKPOINT_INDEX;
  return Math.min(Math.max(rawIndex, 0), DEMO_CHECKPOINTS.length - 1);
};
