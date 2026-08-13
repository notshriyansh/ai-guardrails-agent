export type RiskLevel =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type ToolPolicy = {
  risk: RiskLevel;
  requiresApproval: boolean;
  capabilities: string[];
};

export const toolPolicies: Record<string, ToolPolicy> = {
  calculator: {
    risk: "low",
    requiresApproval: false,
    capabilities: [],
  },

  tell_joke: {
    risk: "low",
    requiresApproval: false,
    capabilities: [],
  },

  search_memory: {
    risk: "low",
    requiresApproval: false,
    capabilities: ["memory.read"],
  },

  save_memory: {
    risk: "medium",
    requiresApproval: false,
    capabilities: ["memory.write"],
  },

  get_repo_info: {
    risk: "low",
    requiresApproval: false,
    capabilities: ["network.read"],
  },

  get_latest_commits: {
    risk: "low",
    requiresApproval: false,
    capabilities: ["network.read"],
  },

  get_weather: {
    risk: "medium",
    requiresApproval: true,
    capabilities: ["network.read"],
  },

  delete_file: {
    risk: "critical",
    requiresApproval: true,
    capabilities: ["filesystem.write"],
  },

  send_email: {
    risk: "high",
    requiresApproval: true,
    capabilities: ["network.write"],
  },
};