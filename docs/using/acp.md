# ACP Bridge

The **ACP-lite** bridge (`@mitii/acp`) exposes Mitii over a stdio JSON-lines protocol. It is a minimal, stable surface for embedding the agent in external tools — not the full Agent Client Protocol.

## Build

```bash
pnpm --filter @mitii/acp build
```

## Run

```bash
mitii-acp
# or, without a global install:
node apps/acp/bin/mitii-acp.js
```

### Smoke test (no model required)

```bash
mitii-acp --echo
```

Useful for CI pipelines or verifying the binary works without a provider configured.

## Modes

| Flag | Description |
|---|---|
| `--echo` | Runs with a local stub (`EchoLlmPort`). No model or provider needed. |
| *(default)* | Full host mode — loads `.mitii/config.json`, wires `ToolRuntimePipeline` and MCP via `@mitii/mcp`. |

## Protocol (v1)

One JSON object per line on **stdin** (client → bridge) and **stdout** (bridge → client).

### Handshake

On startup the bridge emits a ready message:

```json
{ "op": "ready", "protocol": "mitii-acp-lite", "version": 1, "mode": "echo" | "host" }
```

### Operations

| Direction | Shape |
|---|---|
| → | `{ "op": "ping", "id"?: string }` |
| ← | `{ "op": "pong", "id"?: string }` |
| → | `{ "op": "prompt", "id", "prompt", "mode"?: "ask" \| "plan" \| "agent" }` |
| ← | `{ "op": "event", "id", "event" }` — one per `RunEvent` |
| ← | `{ "op": "result", "id", "result" }` — final response |

## Related

- [Daemon](/using/daemon) — long-lived automation process
- [MCP](/integrations/mcp) — external tool servers
- [SDK](/using/sdk) — programmatic API
