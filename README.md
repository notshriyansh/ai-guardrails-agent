# AI Guardrails Agent with MCP Support

A full-stack AI agent platform that dynamically discovers tools from MCP (Model Context Protocol) servers, executes them through an LLM-driven agent loop, and enforces real-time policy guardrails before tool execution.

This project was built as part of a systems-focused AI engineering assignment focused on:

- MCP orchestration
- AI tool-calling systems
- runtime governance
- human approval workflows
- realtime observability
- distributed tool execution

The system demonstrates how modern AI agents can safely interact with external tools through a clean separation between:

- Agent reasoning
- Tool execution
- Policy enforcement
- Observability
- Human governance

---

# Features

## AI Agent Runtime

- LLM-powered tool-use loop using Groq
- Runtime MCP tool discovery
- Dynamic tool execution routing
- Multi-MCP orchestration
- Structured tool execution flow
- Graceful degradation for failed MCP providers

## MCP Integration

- Multiple MCP servers connected simultaneously
- Tool discovery through MCP protocol
- Dynamic capability registration
- stdio-based MCP transport
- Plug-and-play MCP architecture

## Policy / Guardrails Engine

- Block tools dynamically at runtime
- Human approval workflows
- Prompt injection detection
- Tool input validation
- Centralized policy enforcement boundary
- Live policy updates without restart

## Dashboard

- Realtime websocket updates
- Policy control UI
- Human approval management
- Observability metrics
- Live event stream
- Connection status monitoring

## Observability

- Conversation logs
- Tool execution logs
- Policy decision logs
- Realtime operational events

---

# Architecture

```text
User Prompt
      ↓
React Dashboard / API Client
      ↓
Express Backend
      ↓
AI Agent Loop
      ↓
MCP Tool Discovery
      ↓
Policy Engine Intercepts Request
      ↓
Allowed / Blocked / Approval Required
      ↓
MCP Tool Execution
      ↓
Tool Result Returned To LLM
      ↓
Final Response Generated
      ↓
Realtime Events Broadcast Via WebSocket
```

---

# Tech Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- WebSockets
- Vite

## Backend

- Node.js
- TypeScript
- Express.js
- MCP SDK
- Groq API
- WebSockets

## Infrastructure Concepts

- MCP orchestration
- Runtime tool discovery
- Distributed tool routing
- Policy enforcement boundaries
- Human approval workflows
- Event-driven architecture

---

# Monorepo Structure

```text
apps/
  dashboard/           React admin dashboard
  server/              Main AI agent backend
  mcp-server/          Core MCP tools server
  notes-mcp-server/   Notes MCP server

packages/
  logger/
  policy-engine/
  shared-types/
```

---

# MCP Servers

## Core MCP Server

Exposes:

- calculator
- get_weather
- tell_joke

## Notes MCP Server

Exposes:

- add_note
- list_notes
- delete_note
- clear_notes

These tools are dynamically discovered at runtime by the agent.

No hardcoded tool lists exist inside the agent runtime.

---

# Security & Guardrails

The system intentionally separates:

- model intent
- execution permissions

The LLM cannot directly execute tools.

Every tool request passes through the policy engine first.

Current protections include:

- tool blocking
- runtime governance
- approval workflows
- suspicious input detection
- prompt injection checks

Example:

```text
User Prompt
      ↓
Model Wants Tool
      ↓
Policy Engine Evaluates Request
      ↓
Allowed / Denied / Approval Required
      ↓
Tool Executes Only If Approved
```

---

# Local Development Setup

## 1. Clone Repository

```bash
git clone https://github.com/notshriyansh/ai-guardrails-agent
cd ai-guardrails-agent
```

---

## 2. Install Dependencies

```bash
pnpm install
```

---

## 3. Configure Environment Variables

Create:

```text
apps/server/.env
```

Add:

```env
PORT=8080
GROQ_API_KEY=your_groq_api_key
```

---

# Running The Project

## Start Backend

```bash
cd apps/server
pnpm dev
```

---

## Start Dashboard

```bash
cd apps/dashboard
pnpm dev
```

---

# Dashboard

The dashboard runs at:

```text
http://localhost:5173
```

---

# API Endpoints

## Health Check

```http
GET /health
```

---

## Chat Endpoint

```http
POST /chat
```

Example:

```json
{
  "message": "What is 5 * 9?"
}
```

---

## Policy Controls

```http
POST /policy/block
POST /policy/unblock
```

---

## Approval Endpoints

```http
GET /approvals
POST /approvals/:id/approve
```

---

# Example Demo Flow

## 1. Calculator Tool

```text
What is 12 * 7?
```

Agent dynamically discovers calculator tool and executes it.

---

## 2. Runtime Blocking

Block:

```text
calculator
```

Retry request.

Tool execution is denied live without restarting backend.

---

## 3. Human Approval Workflow

Prompt:

```text
What is the weather in Delhi?
```

Policy engine requires approval before execution.

Approve request through dashboard.

---

## 4. Notes MCP Server

```text
Add note buy milk
List my notes
```

Demonstrates multi-MCP orchestration and runtime discovery.

---

# Key Engineering Concepts Demonstrated

- MCP orchestration
- runtime capability discovery
- AI tool calling
- policy enforcement boundaries
- human-in-the-loop systems
- realtime admin infrastructure
- distributed tool routing
- graceful degradation
- event-driven architecture
- observability systems

---

# Design Decisions

## Why Separate The Policy Engine?

Separating governance from the agent loop creates a strict enforcement boundary between:

- what the model wants to do
- what the system permits

This improves:

- security
- maintainability
- auditability
- extensibility

---

## Why Runtime Discovery?

The agent does not hardcode tool definitions.

Instead, MCP servers expose capabilities dynamically through the protocol.

This allows:

- plug-and-play tool ecosystems
- scalable orchestration
- provider interoperability

---

## Why WebSockets?

WebSockets allow dashboard updates to propagate instantly without polling.

This enables:

- live governance
- realtime observability
- operational visibility

---

# Future Improvements

Potential production-grade extensions:

- persistent database storage
- RBAC / authentication
- approval expiration
- policy DSL
- token usage tracking
- retry queues
- SSE transport support
- sandboxed tool execution
- distributed worker execution
- multi-agent orchestration

---

# Deployment

Frontend:

- Vercel

Backend:

- Railway / Render
