import { Router } from "express";
import { getApprovals, resolveApproval } from "../policy/approval-store";
import { eventBus } from "../events/event-bus";
import {
  getPendingExecution,
  removePendingExecution,
} from "../policy/pending-execution-store";

import { executeTool } from "../mcp/mcp-client";

export const approvalRouter: Router = Router();

approvalRouter.get("/", (_req, res) => {
  res.json(getApprovals());
});

approvalRouter.post("/approve", async (req, res) => {
  const { approvalId } = req.body;

  const execution =
    getPendingExecution(approvalId);

  resolveApproval(approvalId);

  let toolResult = null;

  if (execution) {
    toolResult =
      await executeTool(
        execution.selectedTool,
        execution.toolArgs,
      );

    eventBus.emit(
      "approval.execution.completed",
      {
        approvalId,
        toolName:
          execution.selectedTool,
        result: toolResult,
        timestamp:
          new Date().toISOString(),
      },
    );

    removePendingExecution(
      approvalId,
    );
  }

  eventBus.emit(
    "approval.approved",
    {
      approvalId,
      timestamp:
        new Date().toISOString(),
    },
  );

  res.json({
    success: true,
    result: toolResult,
  });
});