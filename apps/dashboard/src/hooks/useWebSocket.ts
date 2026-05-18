import { useEffect, useState } from "react";

export type DashboardEvent = {
  type: string;
  payload?: unknown;
  clientId?: string;
};

export function useWebSocket(url: string) {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket(url);

    socket.onopen = () => {
      console.log("WebSocket connected");

      setConnected(true);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");

      setConnected(false);
    };

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        setEvents((prev) => [parsed, ...prev]);
      } catch (error) {
        console.error("Failed to parse WS message", error);
      }
    };

    return () => {
      socket.close();
    };
  }, [url]);

  return {
    events,
    connected,
  };
}
