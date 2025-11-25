# Two-Agent Production System

A production-ready orchestration harness that coordinates planning and execution agents with real-time monitoring. Built for LOUSTA using Claude via the official Anthropic SDK.

## Features

- Planner and executor agents with graceful offline fallbacks.
- Central orchestrator that tracks performance metrics for every step.
- WebSocket-enabled monitoring dashboard (`npm run monitor`).
- Deterministic integration tests that validate the offline execution path.

## Getting Started

```bash
npm install
npm run dev "Ship the next iteration of the monitoring dashboard"
```

Set an Anthropic API key to enable live model calls:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
npm start "Deploy production workflow"
```

The monitoring dashboard is served on [http://localhost:3050](http://localhost:3050) by default and exposes a `/metrics` endpoint plus a WebSocket feed at `/ws`.

Run the included smoke test:

```bash
npm test
```

This executes the orchestrator with simulated agents, ensuring the core workflow remains stable.
