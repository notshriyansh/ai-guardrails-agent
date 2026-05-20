import { Router } from "express";

import {
  getConversationLogs,
  getPolicyLogs,
  getToolLogs,
} from "../observability/log-store";

export const logsRouter: Router = Router();

logsRouter.get("/", (_req, res) => {
  res.json({
    conversations: getConversationLogs(),

    tools: getToolLogs(),

    policies: getPolicyLogs(),
  });
});
