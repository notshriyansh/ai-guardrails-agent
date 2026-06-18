import { AgentStateAnnotation } from "../state";

export async function plannerNode(
  state: typeof AgentStateAnnotation.State,
): Promise<Partial<typeof AgentStateAnnotation.State>> {
  console.log("Running planner node");

  const message = state.userMessage.toLowerCase();

  if (
    message.includes("remember") ||
    message.includes("save this")
  ) {
    return {
      plannedTool: "save_memory",
    };
  }

  if (
    message.includes("what do i") ||
    message.includes("search memories") ||
    message.includes("memory") ||
    message.includes("remembered")
  ) {
    return {
      plannedTool: "search_memory",
    };
  }

  if (
    message.includes("github") ||
    message.includes("repo") ||
    message.includes("repository")
  ) {
    return {
      plannedTool: "get_repo_info",
    };
  }

  if (
    message.includes("commit") ||
    message.includes("latest commits")
  ) {
    return {
      plannedTool: "get_latest_commits",
    };
  }

  return {};
}