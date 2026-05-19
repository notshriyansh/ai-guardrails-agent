import { useEffect, useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import { approveRequest, blockTool, getApprovals, unblockTool } from "./api";

function App() {
  const { events, connected } = useWebSocket("ws://localhost:8080");
  const [toolName, setToolName] = useState("");
  const [approvals, setApprovals] = useState<any[]>([]);

  useEffect(() => {
    getApprovals().then(setApprovals);
  }, [events]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-6">AI Guardrails Dashboard</h1>

      <div className="mb-6">
        Status:{" "}
        <span className={connected ? "text-green-400" : "text-red-400"}>
          {connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="border border-zinc-800 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Policy Controls</h2>

        <div className="flex gap-2">
          <input
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
            placeholder="Tool name"
            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-white"
          />

          <button
            onClick={() => blockTool(toolName)}
            className="bg-red-600 px-4 py-2 rounded"
          >
            Block
          </button>

          <button
            onClick={() => unblockTool(toolName)}
            className="bg-green-600 px-4 py-2 rounded"
          >
            Unblock
          </button>
        </div>
      </div>

      <div className="border border-zinc-800 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>

        <div className="space-y-2">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="border border-zinc-700 rounded p-3"
            >
              <div>Tool: {approval.toolName}</div>

              <div className="text-sm text-zinc-400">{approval.reason}</div>

              <button
                onClick={() => approveRequest(approval.id)}
                className="mt-2 bg-blue-600 px-3 py-1 rounded"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-zinc-800 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Realtime Events</h2>

        <div className="space-y-2 max-h-[500px] overflow-auto">
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
