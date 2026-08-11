import { Router } from "express";

import {
  getApprovals,
  getApproval,
  resolveApproval,
} from "../policy/approval-store";

import { eventBus } from "../events/event-bus";

import {
  getPendingExecution,
  removePendingExecution,
} from "../policy/pending-execution-store";

import { executeTool } from "../mcp/mcp-client";

import {
  addToolLog,
} from "../observability/log-store";

import crypto from "crypto";

export const approvalRouter: Router =
  Router();

approvalRouter.get("/", (_req, res) => {
  res.json(getApprovals());
});

approvalRouter.post(
  "/approve",
  async (req, res) => {
    try {
      const { approvalId } =
        req.body;

      if (
        typeof approvalId !== "string" ||
        !approvalId
      ) {
        res.status(400).json({
          error:
            "approvalId is required",
        });
        return;
      }

      const approval =
        getApproval(approvalId);

      if (!approval) {
        res.status(404).json({
          error:
            "Approval request not found",
        });
        return;
      }

      if (
        approval.status !==
        "pending"
      ) {
        res.status(409).json({
          error:
            "Approval request has already been resolved",
          status: approval.status,
        });
        return;
      }

      const execution =
        getPendingExecution(
          approvalId,
        );

      if (!execution) {
        res.status(404).json({
          error:
            "Pending execution not found",
        });
        return;
      }

      resolveApproval(
        approvalId,
      );

      const startedAt =
        Date.now();

      let toolResult: unknown =
        null;

      try {
        toolResult =
          await executeTool(
            execution.selectedTool,
            execution.toolArgs,
          );

        addToolLog({
          id: crypto.randomUUID(),
          toolName:
            execution.selectedTool,
          arguments:
            execution.toolArgs,
          result: toolResult,
          status: "success",
          approvalId,
          durationMs:
            Date.now() -
            startedAt,
          timestamp:
            new Date().toISOString(),
        });

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
      } catch (error) {
        addToolLog({
          id: crypto.randomUUID(),
          toolName:
            execution.selectedTool,
          arguments:
            execution.toolArgs,
          status: "failed",
          approvalId,
          durationMs:
            Date.now() -
            startedAt,
          error:
            error instanceof Error
              ? error.message
              : "Tool execution failed",
          timestamp:
            new Date().toISOString(),
        });

        throw error;
      } finally {
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
        approvalId,
        result: toolResult,
      });
    } catch (error) {
      console.error(
        "Approval execution failed:",
        error,
      );

      res.status(500).json({
        error:
          "Approved tool execution failed",
      });
    }
  },
);