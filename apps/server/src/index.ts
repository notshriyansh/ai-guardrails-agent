import express from "express";
import cors from "cors";
import http from "http";
import { env } from "./config/env";
import { healthRouter } from "./routes/health.routes";
import { chatRouter } from "./routes/chat.routes";
import { policyRouter } from "./routes/policy.routes";
import { approvalRouter } from "./routes/approval.routes";
import { logsRouter } from "./routes/logs.routes";
import { createWebSocketServer } from "./websocket/websocket-server";
import { eventBus } from "./events/event-bus";
import { initializeMcpServers } from "./mcp/mcp-client";

async function bootstrap() {
  const app = express();

  app.use(cors());

  app.use(express.json());

  app.use("/health", healthRouter);

  app.use("/chat", chatRouter);

  app.use("/policy", policyRouter);

  app.use("/approvals", approvalRouter);

  app.use("/logs", logsRouter);

  const server = http.createServer(app);
  const websocket = createWebSocketServer(server);

  await initializeMcpServers();

  eventBus.on("log", (payload) => {
    websocket.broadcast({
      type: "log",
      payload,
    });
  });

  eventBus.on("policy.denied", (payload) => {
    websocket.broadcast({
      type: "policy.denied",
      payload,
    });
  });

  eventBus.on("policy.allowed", (payload) => {
    websocket.broadcast({
      type: "policy.allowed",
      payload,
    });
  });

  eventBus.on("policy.updated", (payload) => {
    websocket.broadcast({
      type: "policy.updated",
      payload,
    });
  });

  eventBus.on("policy.approval_requested", (payload) => {
    websocket.broadcast({
      type: "policy.approval_requested",
      payload,
    });
  });

  eventBus.on("approval.approved", (payload) => {
    websocket.broadcast({
      type: "approval.approved",
      payload,
    });
  });

  setInterval(() => {
    eventBus.emit("log", {
      message: "Backend heartbeat event",

      timestamp: new Date().toISOString(),
    });
  }, 5000);

  server.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap server:", error);
});
