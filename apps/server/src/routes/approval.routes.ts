import { Router } from "express";
import { getApprovals, resolveApproval } from "../policy/approval-store";
import { eventBus } from "../events/event-bus";

export const approvalRouter: Router = Router();

approvalRouter.get("/", (_req, res) => {
  res.json(getApprovals());
});

approvalRouter.post("/approve", (req, res) => {
  const { approvalId } = req.body;

  resolveApproval(approvalId);

  eventBus.emit("approval.approved", {
    approvalId,
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
  });
});
