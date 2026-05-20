const API_BASE = import.meta.env.VITE_API_URL;

export async function blockTool(toolName: string) {
  await fetch(`${API_BASE}/policy/block`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      toolName,
    }),
  });
}

export async function unblockTool(toolName: string) {
  await fetch(`${API_BASE}/policy/unblock`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      toolName,
    }),
  });
}

export async function getApprovals() {
  const response = await fetch(`${API_BASE}/approvals`);

  return response.json();
}

export async function approveRequest(approvalId: string) {
  await fetch(`${API_BASE}/approvals/approve`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      approvalId,
    }),
  });
}

export async function getLogs() {
  const response = await fetch(`${API_BASE}/logs`);

  return response.json();
}
