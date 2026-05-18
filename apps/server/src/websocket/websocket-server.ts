import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { v4 as uuid } from "uuid";

type ConnectedClient = {
  id: string;
  socket: WebSocket;
};

const clients = new Map<string, ConnectedClient>();

export function createWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (socket) => {
    const clientId = uuid();

    clients.set(clientId, {
      id: clientId,
      socket,
    });

    console.log(`WS client connected: ${clientId}`);

    socket.send(
      JSON.stringify({
        type: "connection.established",
        clientId,
      }),
    );

    socket.on("close", () => {
      clients.delete(clientId);

      console.log(`WS client disconnected: ${clientId}`);
    });
  });

  return {
    broadcast(event: unknown) {
      const payload = JSON.stringify(event);

      for (const client of clients.values()) {
        client.socket.send(payload);
      }
    },
  };
}
