import { useWebSocket } from "./hooks/useWebSocket";

function App() {
  const { events, connected } = useWebSocket("ws://localhost:8080");

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-6">AI Guardrails Dashboard</h1>

      <div className="mb-4">
        Status:{" "}
        <span className={connected ? "text-green-400" : "text-red-400"}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="border border-zinc-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Realtime Events</h2>

        <div className="space-y-2">
          {events.map((event, index) => (
            <div key={index} className="border border-zinc-700 rounded p-3">
              <div className="font-mono text-sm text-green-400">
                {event.type}
              </div>

              <pre className="text-xs mt-2 overflow-auto">
                {JSON.stringify(event.payload ?? event, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
