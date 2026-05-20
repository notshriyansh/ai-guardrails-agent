import { ConversationLog, PolicyLog, ToolExecutionLog } from "./log-types";

const conversationLogs: ConversationLog[] = [];
const toolLogs: ToolExecutionLog[] = [];
const policyLogs: PolicyLog[] = [];

export function addConversationLog(log: ConversationLog) {
  conversationLogs.unshift(log);
}

export function getConversationLogs() {
  return conversationLogs;
}

export function addToolLog(log: ToolExecutionLog) {
  toolLogs.unshift(log);
}

export function getToolLogs() {
  return toolLogs;
}

export function addPolicyLog(log: PolicyLog) {
  policyLogs.unshift(log);
}

export function getPolicyLogs() {
  return policyLogs;
}
