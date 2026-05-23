import { Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export const AgentStateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),

  userMessage: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),

  retrievedMemories: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),

  selectedTool: Annotation<string | undefined>({
    reducer: (_, y) => y,
    default: () => undefined,
  }),

  toolArgs: Annotation<Record<string, unknown> | undefined>({
    reducer: (_, y) => y,
    default: () => undefined,
  }),

  toolResult: Annotation<unknown>({
    reducer: (_, y) => y,
    default: () => undefined,
  }),

  finalResponse: Annotation<string | undefined>({
    reducer: (_, y) => y,
    default: () => undefined,
  }),

  requiresApproval: Annotation<boolean>({
    reducer: (_, y) => y,
    default: () => false,
  }),
});

export type AgentState = typeof AgentStateAnnotation.State;