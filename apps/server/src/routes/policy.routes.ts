import { Router } from "express";
import { blockTool, getPolicyState, unblockTool } from "../policy/policy-store";
import { eventBus } from "../events/event-bus";

export const policyRouter: Router = Router();

policyRouter.get("/", (_req, res) => {
  res.json(getPolicyState());
});

policyRouter.post("/block", (req, res) => {
  const { toolName } = req.body;

  blockTool(toolName);

  eventBus.emit("policy.updated", {
    action: "blocked",
    toolName,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
  });
});

policyRouter.post("/unblock", (req, res) => {
  const { toolName } = req.body;

  unblockTool(toolName);

  eventBus.emit("policy.updated", {
    action: "unblocked",
    toolName,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
  });
});
