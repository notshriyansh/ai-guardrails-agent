export type PendingApproval = {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  reason: string;
  createdAt: string;
};

const pendingApprovals: PendingApproval[] = [];

export function createApproval(approval: PendingApproval) {
  pendingApprovals.push(approval);
}

export function getApprovals() {
  return pendingApprovals;
}

export function resolveApproval(approvalId: string) {
  const index = pendingApprovals.findIndex(
    (approval) => approval.id === approvalId,
  );

  if (index >= 0) {
    pendingApprovals.splice(index, 1);
  }
}
