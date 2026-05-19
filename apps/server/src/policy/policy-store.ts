type PolicyState = {
  blockedTools: string[];
};

const policyState: PolicyState = {
  blockedTools: ["delete_file", "send_email"],
};

export function getPolicyState() {
  return policyState;
}

export function blockTool(toolName: string) {
  if (!policyState.blockedTools.includes(toolName)) {
    policyState.blockedTools.push(toolName);
  }
}

export function unblockTool(toolName: string) {
  policyState.blockedTools = policyState.blockedTools.filter(
    (tool) => tool !== toolName,
  );
}
