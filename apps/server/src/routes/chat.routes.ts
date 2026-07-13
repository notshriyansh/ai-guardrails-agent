import { Router } from "express";

import { runAgent } from "../agent/agent-loop";

export const chatRouter: Router =
  Router();

chatRouter.post(
  "/",
  async (req, res) => {
    try {
      const { message } =
        req.body;

      const result =
        await runAgent(message);

      try {
        const parsed =
          JSON.parse(
            result.response,
          );

        if (
          parsed.type ===
          "approval_required"
        ) {
          return res.json({
            approvalRequired: true,

            approvalId:
              parsed.approvalId,

            tool:
              parsed.tool,
          });
        }
      } catch {
        // normal response
      }

      res.json(result);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        error:
          "Agent execution failed",
      });
    }
  },
);