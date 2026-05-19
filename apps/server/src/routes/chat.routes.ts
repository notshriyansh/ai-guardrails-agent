import { Router } from "express";

import { runAgent } from "../agent/agent-loop";

export const chatRouter: Router = Router();

chatRouter.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    const result = await runAgent(message);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Agent execution failed",
    });
  }
});
