export type PendingExecution = {
  approvalId: string;

  selectedTool: string;

  toolArgs: Record<string, unknown>;

  userMessage: string;
};

const pendingExecutions: PendingExecution[] = [];

export function addPendingExecution(
  execution: PendingExecution,
) {
  pendingExecutions.push(execution);
}

export function getPendingExecution(
  approvalId: string,
) {
  return pendingExecutions.find(
    (e) => e.approvalId === approvalId,
  );
}

export function removePendingExecution(
  approvalId: string,
) {
  const index =
    pendingExecutions.findIndex(
      (e) => e.approvalId === approvalId,
    );

  if (index >= 0) {
    pendingExecutions.splice(index, 1);
  }
}