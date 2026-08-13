import { toolPolicies } from "./tool-policy";

type PolicyState = {
  blockedTools: string[];
};

const policyState: PolicyState = {
  blockedTools: [],
};

export function getPolicyState(): PolicyState {
  return {
    blockedTools: [...policyState.blockedTools],
  };
}

export function blockTool(toolName: string): void {
  if (!toolPolicies[toolName]) {
    throw new Error(
      `Cannot block unknown tool "${toolName}"`,
    );
  }

  if (!policyState.blockedTools.includes(toolName)) {
    policyState.blockedTools.push(toolName);
  }
}

export function unblockTool(toolName: string): void {
  policyState.blockedTools =
    policyState.blockedTools.filter(
      (tool) => tool !== toolName,
    );
}