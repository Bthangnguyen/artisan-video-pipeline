import { ProjectStatus } from "./project-status.enum";

export const orderedProjectStatuses: readonly ProjectStatus[] = [
  ProjectStatus.DRAFT,
  ProjectStatus.SCRIPT_READY,
  ProjectStatus.VISUAL_READY,
  ProjectStatus.LAYOUT_READY,
  ProjectStatus.VOICE_READY,
  ProjectStatus.PACING_READY,
  ProjectStatus.CAMERA_READY,
  ProjectStatus.READY_FOR_REVIEW,
  ProjectStatus.RENDERED,
];

export function getNextStatus(status: ProjectStatus): ProjectStatus | null {
  const currentIndex = orderedProjectStatuses.indexOf(status);

  if (currentIndex < 0 || currentIndex === orderedProjectStatuses.length - 1) {
    return null;
  }

  return orderedProjectStatuses[currentIndex + 1];
}

export function canTransition(
  currentStatus: ProjectStatus,
  nextStatus: ProjectStatus,
): boolean {
  return getNextStatus(currentStatus) === nextStatus;
}

export function isReadyForReview(status: ProjectStatus): boolean {
  return status === ProjectStatus.READY_FOR_REVIEW;
}

export function isTerminalStatus(status: ProjectStatus): boolean {
  return status === ProjectStatus.READY_FOR_REVIEW || status === ProjectStatus.RENDERED;
}
