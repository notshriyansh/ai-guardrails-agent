import { START, END, StateGraph } from "@langchain/langgraph";

import { AgentStateAnnotation } from "./state";

import { memoryNode } from "./nodes/memory-node";
import { reasoningNode } from "./nodes/reasoning-node";
import { policyNode } from "./nodes/policy-node";
import { toolNode } from "./nodes/tool-node";
import { responseNode } from "./nodes/response-node";
import { plannerNode } from "./nodes/planner-node";

const workflow: any = new StateGraph(AgentStateAnnotation);

workflow.addNode("planner", plannerNode);

workflow.addNode("memory", memoryNode);

workflow.addNode("reasoning", reasoningNode);

workflow.addNode("policy", policyNode);

workflow.addNode("tool", toolNode);

workflow.addNode("response", responseNode);

workflow.addEdge(START, "planner");

workflow.addEdge("planner", "memory");

workflow.addEdge("memory", "reasoning");

workflow.addEdge("reasoning", "policy");

workflow.addEdge("policy", "tool");

workflow.addEdge("tool", "response");

workflow.addEdge("response", END);

export const agentGraph = workflow.compile();