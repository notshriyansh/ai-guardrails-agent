import express from "express";
import cors from "cors";
import http from "http";

import { env } from "./config/env";
import { healthRouter } from "./routes/health.routes";
import { createWebSocketServer } from "./websocket/websocket-server";
import { eventBus } from "./events/event-bus";
import { chatRouter } from "./routes/chat.routes";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/health", healthRouter);

app.use("/chat", chatRouter);

const server = http.createServer(app);

const websocket = createWebSocketServer(server);

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

setInterval(() => {
  eventBus.emit("log", {
    message: "Backend heartbeat event",
    timestamp: new Date().toISOString(),
  });
}, 5000);

server.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
