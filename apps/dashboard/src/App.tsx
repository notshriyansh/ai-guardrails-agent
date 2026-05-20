import { useEffect, useState } from "react";
import { useWebSocket } from "./hooks/useWebSocket";
import {
  approveRequest,
  blockTool,
  getApprovals,
  unblockTool,
  getLogs,
} from "./api";

function App() {
  const { events, connected } = useWebSocket(import.meta.env.VITE_WS_URL);
  const [toolName, setToolName] = useState("");
  const [approvals, setApprovals] = useState<any[]>([]);
  const [logs, setLogs] = useState<any>(null);

  useEffect(() => {
    getApprovals().then(setApprovals);
  }, [events]);

  useEffect(() => {
    getLogs().then(setLogs);
  }, [events]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              AI Guardrails Dashboard
            </h1>

            <p className="text-zinc-400 mt-2">
              MCP orchestration, runtime governance, and realtime policy
              enforcement
            </p>
          </div>

          <div
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              connected
                ? "bg-green-500/10 text-green-400 border-green-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {connected ? "Connected" : "Disconnected"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 border border-zinc-800 bg-zinc-900/40 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-5">Policy Controls</h2>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder="Enter tool name..."
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-zinc-500"
              />

              <button
                onClick={() => blockTool(toolName)}
                className="bg-red-600 hover:bg-red-500 transition px-5 py-3 rounded-xl font-medium"
              >
                Block
              </button>

              <button
                onClick={() => unblockTool(toolName)}
                className="bg-green-600 hover:bg-green-500 transition px-5 py-3 rounded-xl font-medium"
              >
                Unblock
              </button>
            </div>
          </div>

          <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-5">Observability</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between border border-zinc-800 rounded-xl p-3">
                <span className="text-zinc-400">Conversations</span>

                <span className="font-bold text-lg">
                  {logs?.conversations?.length ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between border border-zinc-800 rounded-xl p-3">
                <span className="text-zinc-400">Tool Calls</span>

                <span className="font-bold text-lg">
                  {logs?.tools?.length ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between border border-zinc-800 rounded-xl p-3">
                <span className="text-zinc-400">Policy Decisions</span>

                <span className="font-bold text-lg">
                  {logs?.policies?.length ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold">Pending Approvals</h2>

            <span className="text-sm text-zinc-500">
              {approvals.length} pending
            </span>
          </div>

          <div className="space-y-3">
            {approvals.length === 0 && (
              <div className="text-zinc-500 text-sm">
                No pending approval requests
              </div>
            )}

            {approvals.map((approval) => (
              <div
                key={approval.id}
                className="border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium">{approval.toolName}</div>

                  <div className="text-sm text-zinc-400 mt-1">
                    {approval.reason}
                  </div>
                </div>

                <button
                  onClick={() => approveRequest(approval.id)}
                  className="bg-blue-600 hover:bg-blue-500 transition px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold">Realtime Events</h2>

            <span className="text-sm text-zinc-500">
              {events.length} events
            </span>
          </div>

          <div className="space-y-3 max-h-137.5 overflow-auto pr-2">
            {[...events].reverse().map((event, index) => (
              <div
                key={index}
                className="border border-zinc-800 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono text-sm text-green-400">
                    {event.type}
                  </div>
                </div>

                <pre className="text-xs text-zinc-300 overflow-auto">
                  {JSON.stringify(event.payload ?? event, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
